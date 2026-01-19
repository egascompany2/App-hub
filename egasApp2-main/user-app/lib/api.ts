import axios, {
  AxiosError,
  AxiosHeaders,
  AxiosRequestConfig,
  AxiosResponse,
} from "axios";
import { tokenService } from "@/services/token";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { environment } from "../config";

const API_URL = environment.API_URL;

console.log('[API] Initializing API client with baseURL:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue: any[] = [];

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

api.interceptors.request.use(
  async (config: AxiosRequestConfig & { headers: AxiosHeaders }) => {
    try {
      console.log('[API] Making request:', config.method?.toUpperCase(), config.url, 'to baseURL:', config.baseURL);
      const tokens = await tokenService.getTokens();
      if (tokens?.accessToken) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${tokens.accessToken}`;
        console.log('[API] Added authorization header');
      } else {
        console.log('[API] No access token found');
      }
      return config;
    } catch (error) {
      console.error('[API] Request interceptor error:', error);
      return Promise.reject(error);
    }
  },
  (error: AxiosError) => {
    console.error('[API] Request error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log('[API] Response received:', response.status, response.config.url);
    return response;
  },
  async (error) => {
    console.error('[API] Response error:', error.message, error.response?.status, error.config?.url);
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const tokens = await tokenService.getTokens();
        if (!tokens?.refreshToken) {
          throw new Error("No refresh token available");
        }

        const response = await axios.post(`${API_URL}/auth/refresh-token`, {
          refreshToken: tokens.refreshToken
        });

        const { accessToken, refreshToken } = response.data.data;

        // Save new tokens
        await tokenService.saveTokens({
          ...tokens,
          accessToken,
          refreshToken,
        });

        // Update request header
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Clear tokens only, let the UI handle navigation
        await tokenService.clearTokens();
        throw refreshError;
      }
    }

    return Promise.reject(error);
  }
);

export { api };