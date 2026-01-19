import axios, {
  AxiosError,
  AxiosHeaders,
  AxiosRequestConfig,
  AxiosResponse,
} from "axios";
import { tokenService } from "@/services/token";
import { getApiUrl } from "@/config/environment";

interface QueueItem {
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
}

interface TokenResponse {
  data: {
    accessToken: string;
    refreshToken: string;
  };
}

const API_URL = getApiUrl();

if (!API_URL) {
  console.error('API URL not configured');
}

// Add access token getter functionality
let accessTokenGetter: (() => Promise<string | null>) | null = null;

export const setAccessTokenGetter = (getter: () => Promise<string | null>) => {
  accessTokenGetter = getter;
};

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Track if we're refreshing to prevent multiple refresh calls
let isRefreshing = false;
let failedQueue: QueueItem[] = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request interceptor
api.interceptors.request.use(
  async (config: AxiosRequestConfig & { headers: AxiosHeaders }) => {
    try {
      // Log request in development
      if (__DEV__) {
        console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
          baseURL: config.baseURL,
          headers: config.headers,
          data: config.data,
        });
      }

      // Use accessTokenGetter if available
      let accessToken = null;
      if (accessTokenGetter) {
        accessToken = await accessTokenGetter();
      } else {
        const tokens = await tokenService.getTokens();
        accessToken = tokens?.accessToken;
      }

      if (accessToken) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      return config;
    } catch (error) {
      console.error('Request interceptor error:', error);
      return Promise.reject(error);
    }
  },
  (error: AxiosError) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log successful response in development
    if (__DEV__) {
      console.log(`✅ API Response: ${response.status} ${response.config.url}`, {
        data: response.data,
      });
    }
    return response;
  },
  async (error: AxiosError) => {
    // Log error response in development
    if (__DEV__) {
      console.error(`❌ API Error: ${error.response?.status} ${error.config?.url}`, {
        error: error.message,
        response: error.response?.data,
        config: error.config,
      });
    }

    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };
    if (!originalRequest) return Promise.reject(error);

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        try {
          const token = await new Promise<string>((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          });
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return api(originalRequest);
        } catch (err) {
          return Promise.reject(err);
        }
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const tokens = await tokenService.getTokens();
        if (!tokens?.refreshToken) {
          throw new Error("No refresh token available");
        }

        const response = await axios.post<TokenResponse>(
          `${API_URL}/auth/refresh-token`,
          {
            refreshToken: tokens.refreshToken,
          }
        );

        const { accessToken, refreshToken } = response.data.data;

        await tokenService.saveTokens({
          accessToken,
          refreshToken,
          user: tokens.user,
        });

        // Update authorization header
        api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }

        // Process queued requests
        processQueue(null, accessToken);

        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as Error, null);
        await tokenService.clearTokens();
        throw refreshError;
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export { api };

