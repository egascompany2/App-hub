import { Platform } from "react-native";
import { api } from "@/lib/api";

type NotificationPlatform = "ANDROID" | "IOS";
type NotificationApp = "USER";

interface RegisterDevicePayload {
  token: string;
  platform?: NotificationPlatform;
  app?: NotificationApp;
}

interface SendTestPayload {
  token: string;
  title?: string;
  body?: string;
}

export const notificationService = {
  async registerDevice(payload: RegisterDevicePayload) {
    const platform: NotificationPlatform = payload.platform ?? (Platform.OS === "ios" ? "IOS" : "ANDROID");

    console.log("[UserNotifications] /notifications/register request", {
      tokenPreview: payload.token.slice(0, 12),
      platform,
      app: payload.app ?? "USER",
    });

    await api.post("/notifications/register", {
      token: payload.token,
      platform,
      app: payload.app ?? "USER",
    }).then(() => {
      console.log("[UserNotifications] register succeeded");
    }).catch(error => {
      console.error("[UserNotifications] register failed", {
        message: error?.message,
        status: error?.response?.status,
        response: error?.response?.data,
      });
      throw error;
    });
  },

  async unregisterDevice(token: string) {
    await api.delete("/notifications/unregister", {
      data: { token },
    });
  },

  async sendTestNotification(payload: SendTestPayload) {
    console.log("[UserNotifications] /notifications/send-test request", {
      tokenPreview: payload.token.slice(0, 12),
    });

    await api.post("/notifications/send-test", {
      token: payload.token,
      title: payload.title,
      body: payload.body,
    }).then(() => {
      console.log("[UserNotifications] send-test succeeded");
    }).catch(error => {
      console.error("[UserNotifications] send-test failed", {
        message: error?.message,
        status: error?.response?.status,
        response: error?.response?.data,
      });
      throw error;
    });
  },
};
