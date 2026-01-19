import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { User, AuthResponse } from "@/types/auth";
import { tokenService } from "@/services/token";
import { authService } from "@/services/auth";
import {
  clearStoredUserToken,
  forceRegisterCurrentToken,
  initializeUserNotifications,
  shutdownUserNotifications,
} from "@/lib/notifications";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  signIn: (auth: AuthResponse) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    isLoading: true,
    isAuthenticated: false,
    user: null,
  });
  const notificationCleanupRef = useRef<(() => void) | null>(null);
  const notificationsInitializedRef = useRef(false);

  const stopNotifications = useCallback(async () => {
    notificationsInitializedRef.current = false;
    notificationCleanupRef.current?.();
    notificationCleanupRef.current = null;
    await shutdownUserNotifications().catch(() => undefined);
    await clearStoredUserToken().catch(() => undefined);
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const tokens = await tokenService.getTokens();
        if (tokens?.accessToken && tokens?.user) {
          const isValid = await tokenService.validateTokens();
          if (isValid) {
            console.log("Auth initialized with user:", tokens.user);
            setState({
              isLoading: false,
              isAuthenticated: true,
              user: tokens.user,
            });
            if (!notificationsInitializedRef.current) {
              try {
                const cleanup = await initializeUserNotifications();
                if (cleanup) {
                  notificationCleanupRef.current?.();
                  notificationCleanupRef.current = cleanup;
                  notificationsInitializedRef.current = true;
                  await forceRegisterCurrentToken().catch(() => undefined);
                }
              } catch (error) {
                console.error("Notification initialization failed", error);
              }
            }
            return;
          }
        }
        await tokenService.clearTokens();
        await stopNotifications();
        console.log("No valid tokens, cleared auth state");
        setState({
          isLoading: false,
          isAuthenticated: false,
          user: null,
        });
      } catch (error) {
        console.error("Auth initialization error:", error);
        await tokenService.clearTokens();
        await stopNotifications();
        setState({
          isLoading: false,
          isAuthenticated: false,
          user: null,
        });
      }
    };

    initAuth();
  }, [stopNotifications]);

  const signIn = async (auth: AuthResponse) => {
    try {
      await tokenService.saveTokens({
        accessToken: auth.data.accessToken,
        refreshToken: auth.data.refreshToken,
        user: auth.data.user,
      });
      
      console.log("SignIn successful, user:", auth.data.user);
      setState({
        isLoading: false,
        isAuthenticated: true,
        user: auth.data.user,
      });
      try {
        const cleanup = await initializeUserNotifications();
        if (cleanup) {
          notificationCleanupRef.current?.();
          notificationCleanupRef.current = cleanup;
          notificationsInitializedRef.current = true;
          await forceRegisterCurrentToken().catch(() => undefined);
        }
      } catch (error) {
        console.error("Notification init during sign-in failed", error);
      }
    } catch (error) {
      console.error("Sign in error:", error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await stopNotifications();
      await tokenService.clearTokens();
      console.log("Signed out");
      setState({
        isLoading: false,
        isAuthenticated: false,
        user: null,
      });
    } catch (error) {
      console.error("Sign out error:", error);
      throw error;
    }
  };

  const updateUser = (userData: Partial<User>) => {
    setState(prev => ({
      ...prev,
      user: prev.user ? { ...prev.user, ...userData } : null,
    }));
  };

  const refreshUser = async () => {
    try {
      const response = await authService.getMe();
      if (response.success) {
        setState(prev => ({
          ...prev,
          user: response.data.user,
        }));
      }
    } catch (error: any) {
      console.error("Refresh user error:", error);
      if (error.response?.status === 401) {
        await signOut();
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        signIn,
        signOut,
        updateUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
