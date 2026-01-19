import { create } from "zustand";
import { AuthState, AuthResponse, UserRole } from "../types/auth";
import * as SecureStore from "expo-secure-store";
import { tokenService } from "@/services/token";

export const useAuthStore = create<any>((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isInitialized: false,

  setAuth: async (auth: any) => {
    if (auth.user.role !== UserRole.CLIENT) {
      throw new Error("Unauthorized access");
    }

    const tokens = {
      accessToken: auth.data.accessToken,
      refreshToken: auth.data.refreshToken,
      user: auth.data.user
    };

    const saved = await tokenService.saveTokens(tokens);
    if (!saved) {
      throw new Error("Failed to save authentication tokens");
    }

    set({
      user: auth.data.user,
      accessToken: auth.data.accessToken,
      refreshToken: auth.data.refreshToken,
      isAuthenticated: true,
    });
  },

  signOut: async () => {
    await tokenService.clearTokens();
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
    });
  }
}));
