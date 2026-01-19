import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { tokenService } from "../services/token";
import { router } from "expo-router";
import { api } from "@/lib/api";
import { authService } from "@/services/auth";
import { initializeDriverNotifications, shutdownDriverNotifications } from "@/lib/notifications";

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any | null;
}

interface AuthContextType extends AuthState {
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
  });

  const notificationCleanupRef = useRef<(() => void) | null>(null);
  const notificationsAttemptedRef = useRef(false);

  const enableNotifications = useCallback(async () => {
    if (notificationsAttemptedRef.current || !state.isAuthenticated) {
      return;
    }

    try {
      const cleanup = await initializeDriverNotifications();
      notificationsAttemptedRef.current = true;

      if (cleanup) {
        notificationCleanupRef.current?.();
        notificationCleanupRef.current = cleanup;
      }
    } catch (error) {
      console.error("Driver notification setup failed", error);
    }
  }, [state.isAuthenticated]);

  const disableNotifications = useCallback(async () => {
    notificationsAttemptedRef.current = false;
    notificationCleanupRef.current?.();
    notificationCleanupRef.current = null;

    try {
      await shutdownDriverNotifications();
    } catch (error) {
      console.error("Failed to shutdown driver notifications", error);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (state.isAuthenticated) {
      enableNotifications();
    } else if (!state.isLoading) {
      disableNotifications();
    }
  }, [state.isAuthenticated, state.isLoading, enableNotifications, disableNotifications]);

  const checkAuth = async () => {
    try {
      const tokens = await tokenService.getTokens();
      if (!tokens) {
        setState({ isAuthenticated: false, isLoading: false, user: null });
        return;
      }

      // Validate tokens
      const isValid = await tokenService.validateTokens();
      if (!isValid) {
        await logout(); // This will clear tokens and update state
        return;
      }

      // Set the API authorization header
      api.defaults.headers.common["Authorization"] = `Bearer ${tokens.accessToken}`;
      
      setState({
        isAuthenticated: true,
        isLoading: false,
        user: tokens.user,
      });

      // Start periodic token validation
      startTokenValidationInterval();

    } catch (error) {
      console.error("Auth check failed:", error);
      await logout();
    }
  };

  // Add periodic token validation
  const startTokenValidationInterval = () => {
    // Check tokens every hour
    const interval = setInterval(async () => {
      const isValid = await tokenService.validateTokens();
      if (!isValid) {
        console.log('Token validation failed, logging out');
        clearInterval(interval);
        await logout();
      }
    }, 60 * 60 * 1000); // 1 hour

    return () => clearInterval(interval);
  };

  const refreshAuth = async () => {
    try {
      const tokens = await tokenService.getTokens();
      if (!tokens?.refreshToken) throw new Error("No refresh token");

      const response = await api.post("/auth/refresh-token", {
        refreshToken: tokens.refreshToken,
      });

      const { user, accessToken, refreshToken } = response.data.data;

      await tokenService.saveTokens({
        accessToken,
        refreshToken,
        user,
      });

      setState({ isAuthenticated: true, isLoading: false, user });

      // Update API client with new token
      api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;

      return response.data;
    } catch (error) {
      console.error("Token refresh failed:", error);
      await logout();
      throw error;
    }
  };

  const login = async (credentials: { email: string; password: string }) => {
    try {
      const response = await api.post("/auth/driver/login", credentials);
      const { user, accessToken, refreshToken } = response.data.data;

      await tokenService.saveTokens({
        accessToken,
        refreshToken,
        user,
      });

      api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;

      setState({ isAuthenticated: true, isLoading: false, user });
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await disableNotifications();
    } catch (error) {
      console.error("Notification disable error:", error);
    }

    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      await tokenService.clearTokens();
      delete api.defaults.headers.common["Authorization"];
      setState({ isAuthenticated: false, isLoading: false, user: null });
      router.replace("/(auth)/login");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        refreshAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
