import { Platform } from "react-native";
import { api } from "@/lib/api";

type NotificationPlatform = "ANDROID" | "IOS";
type NotificationApp = "DRIVER";

interface RegisterDevicePayload {
  token: string;
  platform?: NotificationPlatform;
  app?: NotificationApp;
}

export const notificationService = {
  async registerDevice(payload: RegisterDevicePayload) {
    const platform: NotificationPlatform = payload.platform ?? (Platform.OS === "ios" ? "IOS" : "ANDROID");

    console.log("[Notifications] Calling /notifications/register", {
      tokenPreview: payload.token.slice(0, 12),
      platform,
      app: payload.app ?? "DRIVER",
    });

    await api.post("/notifications/register", {
      token: payload.token,
      platform,
      app: payload.app ?? "DRIVER",
    }).then(() => {
      console.log("[Notifications] /notifications/register succeeded");
    }).catch(error => {
      console.error("[Notifications] /notifications/register failed", {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
      });
      throw error;
    });
  },

  async unregisterDevice(token: string) {
    await api.delete("/notifications/unregister", {
      data: { token },
    });
  },

  async sendTestNotification(payload: { token: string; title?: string; body?: string }) {
    console.log("[Notifications] Calling /notifications/send-test", {
      tokenPreview: payload.token.slice(0, 12),
    });

    await api.post("/notifications/send-test", payload).then(() => {
      console.log("[Notifications] /notifications/send-test succeeded");
    }).catch(error => {
      console.error("[Notifications] /notifications/send-test failed", {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
      });
      throw error;
    });
  },
};
