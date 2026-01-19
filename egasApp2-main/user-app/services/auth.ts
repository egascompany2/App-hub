import { useAuthStore } from "@/store/authStore";
import { handleError } from "@/utils/errorHandler";
import { api } from "@/lib/api";
import { AxiosError } from "axios";

export const authService = {
  requestOTP: async (phoneNumber: string) => {
    try {
      const response = await api.post(
        "/auth/request-otp",
        { phoneNumber },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response;
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 429) {
        throw new Error("You've exceeded the OTP request limit. Please try again in 1 hour.");
      }
      throw error;
    }
  },

  verifyOTP: (phoneNumber: string, otp: string) =>
    api.post(
      "/auth/verify-otp",
      { phoneNumber, otp },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    ),

  refreshToken: (refreshToken: string) =>
    api.post(
      "/auth/refresh-token",
      { refreshToken },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    ),

  updateUserProfile: async (profileData: {
    firstName?: string;
    lastName?: string;
    email?: string;
    tankSize?: string;
    address?: string;
    city?: string;
    area?: string;
    termsAccepted?: boolean;
    latitude: number;
    longitude: number;
  }) => {
    try {
      const payload = {
        ...profileData,
        area: profileData.area || "Ikeja",
      };

      const response = await api.put(
        "/client/profile",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${useAuthStore.getState().token}`,
          },
        }
      );

      if (response.data.success) {
        const { user } = useAuthStore.getState();
        useAuthStore.setState({
          user: { ...user!, ...response.data.data.user },
        });
      }
      return response.data;
    } catch (error) {
      console.error("Profile update error:", error);
      handleError(error);
      throw error;
    }
  },

  deleteAccount: async () => {
    try {
      const response = await api.delete("/client/profile", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${useAuthStore.getState().token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Delete account error:", error);
      handleError(error);
      throw error;
    }
  },

  getMe: async () => {
    try {
      const response = await api.get("/client/me", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${useAuthStore.getState().token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Get me error:", error);
      handleError(error);
      throw error;
    }
  },
};
