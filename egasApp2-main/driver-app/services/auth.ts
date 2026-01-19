import { api } from "../lib/api";
import { AuthResponse } from "../types/auth";
import { tokenService } from "./token";
export const authService = {
  async login(
    email: string,
    password: string,
    deviceToken?: string
  ): Promise<AuthResponse> {
    try {
      console.log("🔐 AuthService: Attempting login for:", email);
      
      const response = await api.post<AuthResponse>("/auth/driver/login", {
        email,
        password,
      });

      console.log("✅ AuthService: Login response received:", {
        success: response.data.success,
        message: response.data.message,
        hasUser: !!response.data.data?.user,
        hasTokens: !!(response.data.data?.accessToken && response.data.data?.refreshToken),
      });

      // Store tokens
      if (response.data.data.accessToken && response.data.data.refreshToken) {
        await tokenService.saveTokens({
          accessToken: response.data.data.accessToken,
          refreshToken: response.data.data.refreshToken,
          user: response.data.data.user,
        });
        console.log("✅ AuthService: Tokens saved successfully");
      } else {
        console.warn("⚠️ AuthService: No tokens received in response");
      }

      return response.data;
    } catch (error) {
      console.error("❌ AuthService: Login error:", error);
      throw this.handleError(error);
    }
  },

  async logout(): Promise<void> {
    try {
      const tokens = await tokenService.getTokens();
      if (tokens?.refreshToken) {
        await api.post("/auth/logout", { refreshToken: tokens.refreshToken });
      }
      await tokenService.clearTokens();
    } catch (error) {
      throw this.handleError(error);
    }
  },

  handleError(error: any): Error {
    console.error("🔍 AuthService: Handling error:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      config: error.config,
    });

    // Network errors
    if (error.code === 'NETWORK_ERROR' || error.code === 'ECONNABORTED') {
      return new Error("Network error. Please check your internet connection and try again.");
    }

    // Timeout errors
    if (error.code === 'ECONNABORTED') {
      return new Error("Request timeout. Please try again.");
    }

    // Server errors
    if (error.response?.status >= 500) {
      return new Error("Server error. Please try again later.");
    }

    // Authentication errors
    if (error.response?.status === 401) {
      return new Error("Invalid credentials. Please check your email and password.");
    }

    // Validation errors
    if (error.response?.status === 400) {
      if (error.response?.data?.message) {
        return new Error(error.response.data.message);
      }
      return new Error("Invalid request. Please check your input.");
    }

    // Not found errors
    if (error.response?.status === 404) {
      return new Error("Login service not available. Please try again later.");
    }

    // Custom error messages from server
    if (error.response?.data?.message) {
      return new Error(error.response.data.message);
    }

    // Default error
    return new Error("Authentication failed. Please check your credentials and try again.");
  },
};
