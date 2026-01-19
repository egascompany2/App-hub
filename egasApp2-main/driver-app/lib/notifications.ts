import { Platform, AppState, AppStateStatus } from "react-native";
import messaging, {
  FirebaseMessagingTypes,
  AuthorizationStatus as FirebaseAuthorizationStatus,
} from "@react-native-firebase/messaging";
import notifee, {
  AndroidImportance,
  AndroidCategory,
  AndroidLaunchActivityFlag,
  EventType,
  EventDetail,
  IntervalTrigger,
  TriggerType,
  AndroidVisibility,
  AuthorizationStatus,
  TimeUnit,
} from "@notifee/react-native";
import type { Notification as NotifeeNotification } from "@notifee/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { notificationService } from "@/services/notifications";
import { driverService } from "@/services/driver";

const DRIVER_FCM_TOKEN_KEY = "driverFcmToken";
const LEGACY_SECURE_KEYS = ["driverFcmToken", "driver_fcm_token"] as const;
const ASYNC_TOKEN_KEY = "@driver/fcmToken";

const isKeyValid = (key: string): boolean => /^[A-Za-z0-9.-@_/]+$/.test(key);

const secureStoreGet = async (key: string): Promise<string | null> => {
  if (!isKeyValid(key)) {
    return null;
  }
  try {
    return await SecureStore.getItemAsync(key);
  } catch (error) {
    console.warn(`[Notifications] SecureStore get failed for key ${key}`, error);
    return null;
  }
};

const secureStoreDelete = async (key: string): Promise<void> => {
  if (!isKeyValid(key)) {
    return;
  }
  try {
    await SecureStore.deleteItemAsync(key);
  } catch (error) {
    console.warn(`[Notifications] SecureStore delete failed for key ${key}`, error);
  }
};

const readStoredToken = async (): Promise<string | null> => {
  try {
    const asyncToken = await AsyncStorage.getItem(ASYNC_TOKEN_KEY);
    if (asyncToken) {
      return asyncToken;
    }
  } catch (error) {
    console.warn("[Notifications] AsyncStorage get failed", error);
  }

  for (const key of LEGACY_SECURE_KEYS) {
    const value = await secureStoreGet(key);
    if (value) {
      await AsyncStorage.setItem(ASYNC_TOKEN_KEY, value).catch(err => {
        console.warn("[Notifications] Failed to migrate token to AsyncStorage", err);
      });
      return value;
    }
  }

  return null;
};

const writeStoredToken = async (token: string): Promise<void> => {
  await AsyncStorage.setItem(ASYNC_TOKEN_KEY, token).catch(error => {
    console.error("[Notifications] AsyncStorage set failed", error);
  });

  for (const key of LEGACY_SECURE_KEYS) {
    await secureStoreDelete(key);
  }
};

const clearStoredToken = async (): Promise<void> => {
  await AsyncStorage.removeItem(ASYNC_TOKEN_KEY).catch(error => {
    console.warn("[Notifications] AsyncStorage remove failed", error);
  });

  for (const key of LEGACY_SECURE_KEYS) {
    await secureStoreDelete(key);
  }
};
const DRIVER_NOTIFICATION_CHANNEL_ID = "driver-critical-alerts";
const DRIVER_SUMMARY_CHANNEL_ID = "driver-general-updates";
const ACKNOWLEDGE_ACTION_ID = "acknowledge-order";
const OPEN_ORDER_ACTION_ID = "open-order";
const SILENCE_ACTION_ID = "silence-alarm";

type CleanupFn = () => void;

let onTokenRefreshCleanup: CleanupFn | null = null;
let onMessageCleanup: CleanupFn | null = null;
let onForegroundEventCleanup: CleanupFn | null = null;
let appStateListenerCleanup: CleanupFn | null = null;

const isNotificationAuthorized = (status: number) =>
  status === FirebaseAuthorizationStatus.AUTHORIZED ||
  status === FirebaseAuthorizationStatus.PROVISIONAL;

const toText = (value: unknown, fallback: string): string => {
  if (typeof value === "string" && value.trim().length > 0) {
    return value;
  }
  return fallback;
};

async function ensureAndroidChannels(): Promise<void> {
  if (Platform.OS !== "android") return;

  await notifee.createChannel({
    id: DRIVER_NOTIFICATION_CHANNEL_ID,
    name: "Driver Critical Alerts",
    lights: true,
    vibration: true,
    vibrationPattern: [300, 500],
    sound: "default",
    importance: AndroidImportance.HIGH,
    bypassDnd: true,
    visibility: AndroidVisibility.PUBLIC,
    lightColor: "#FF4D4D",
  });

  await notifee.createChannel({
    id: DRIVER_SUMMARY_CHANNEL_ID,
    name: "Driver Updates",
    lights: true,
    vibration: true,
    sound: "default",
    importance: AndroidImportance.DEFAULT,
  });
}

async function configureIOSCategories() {
  if (Platform.OS !== "ios") return;

  await notifee.setNotificationCategories([
    {
      id: "driver_alarm",
      actions: [
        {
          id: ACKNOWLEDGE_ACTION_ID,
          title: "Acknowledge",
        },
        {
          id: SILENCE_ACTION_ID,
          title: "Silence",
          destructive: true,
        },
      ],
    },
  ]);
}

async function requestNotificationPermissions(): Promise<boolean> {
  try {
    const notifeeSettings = await notifee.requestPermission();
    console.log("[Notifications] Notifee permission result", notifeeSettings);

    if (notifeeSettings.authorizationStatus === AuthorizationStatus.DENIED) {
      console.warn("Notifee permission denied:", notifeeSettings);
      return false;
    }

    const settings = await messaging().requestPermission({
      alert: true,
      badge: true,
      sound: true,
      announcement: true,
      provisional: true,
    });
    console.log("[Notifications] Firebase permission result", settings);

    if (!isNotificationAuthorized(settings)) {
      console.warn("Notification permission not granted:", settings);
      return false;
    }

    await messaging().registerDeviceForRemoteMessages();
    return true;
  } catch (error) {
    console.error("Failed to request notification permissions", error);
    return false;
  }
}

export async function syncDeviceToken(token: string): Promise<void> {
  try {
    console.log("[Notifications] Attempting to register device token", token.slice(0, 12));
    const existing = await readStoredToken();

    if (existing === token) {
      console.log("[Notifications] Token unchanged; skipping registration");
      return;
    }

    await notificationService.registerDevice({ token });
    await writeStoredToken(token);
    const verify = await readStoredToken();
    console.log("[Notifications] Device token registered and cached", verify ? verify.slice(0, 12) : "<missing>");
  } catch (error) {
    console.error("Failed to sync device token with backend", error);
  }
}

const getNotificationId = (remoteMessage: FirebaseMessagingTypes.RemoteMessage): string =>
  String(remoteMessage.data?.orderId ?? remoteMessage.messageId ?? Date.now());

async function displayDriverNotification(remoteMessage: FirebaseMessagingTypes.RemoteMessage) {
  const payloadType = remoteMessage.data?.type ?? remoteMessage.data?.reason;
  const rawOrderId = remoteMessage.data?.orderId;
  const orderId = typeof rawOrderId === "string" && rawOrderId.trim().length > 0 ? rawOrderId : undefined;
  const title: string = toText(
    remoteMessage.notification?.title ?? remoteMessage.data?.title,
    "Egas Driver Alert"
  );
  const body: string = toText(
    remoteMessage.notification?.body ?? remoteMessage.data?.body,
    "You have a new update."
  );
  const shouldPersist = payloadType === "ALARM_REMINDER" || payloadType === "ORDER_ASSIGNMENT";
  const channelId =
    Platform.OS === "android" && payloadType === "ALARM_REMINDER"
      ? DRIVER_NOTIFICATION_CHANNEL_ID
      : DRIVER_SUMMARY_CHANNEL_ID;

  await ensureAndroidChannels();
  await configureIOSCategories();

  const dataPayload = (remoteMessage.data ?? {}) as Record<string, string>;
  const notificationData = dataPayload as Record<string, string | number | object>;

  const notification: NotifeeNotification = {
    id: getNotificationId(remoteMessage),
    title,
    body,
    data: notificationData,
    android: {
      channelId,
      importance:
        shouldPersist
          ? AndroidImportance.HIGH
          : AndroidImportance.DEFAULT,
      category: AndroidCategory.MESSAGE,
      autoCancel: !shouldPersist,
      ongoing: shouldPersist,
      showTimestamp: true,
      sound: "default",
      pressAction: {
        id: OPEN_ORDER_ACTION_ID,
        launchActivity: "default",
        launchActivityFlags: [AndroidLaunchActivityFlag.SINGLE_TOP],
      },
      actions:
        payloadType === "ALARM_REMINDER" || payloadType === "ORDER_ASSIGNMENT"
          ? [
              {
                title: "Acknowledge",
                pressAction: { id: ACKNOWLEDGE_ACTION_ID },
              },
              {
                title: "Silence",
                pressAction: { id: SILENCE_ACTION_ID },
              },
            ]
          : undefined,
    },
    ios: {
      sound: payloadType === "ALARM_REMINDER" ? "default" : undefined,
      categoryId: "driver_alarm",
      interruptionLevel:
        payloadType === "ALARM_REMINDER" ? "timeSensitive" : "active",
    },
  };

  await notifee.displayNotification(notification);

  if (orderId && (payloadType === "ALARM_REMINDER" || payloadType === "ORDER_ASSIGNMENT")) {
    await scheduleAlarmReminder(orderId, title, body, dataPayload);
  }
}

async function scheduleAlarmReminder(
  orderId: string,
  title: string,
  body: string,
  data: Record<string, string>
) {
  if (Platform.OS !== "android") return;

  const trigger: IntervalTrigger = {
    type: TriggerType.INTERVAL,
    interval: 30,
    timeUnit: TimeUnit.SECONDS,
  };

  console.log("[Notifications] Scheduling local alarm reminder", {
    orderId,
    intervalSeconds: 30,
  });

  await notifee.createTriggerNotification(
    {
      id: `${orderId}-alarm`,
      title,
      body,
      android: {
        channelId: DRIVER_NOTIFICATION_CHANNEL_ID,
        importance: AndroidImportance.HIGH,
        sound: "default",
        category: AndroidCategory.MESSAGE,
        pressAction: { id: OPEN_ORDER_ACTION_ID, launchActivity: "default" },
        ongoing: true,
        autoCancel: false,
        actions: [
          {
            title: "Acknowledge",
            pressAction: { id: ACKNOWLEDGE_ACTION_ID },
          },
          {
            title: "Silence",
            pressAction: { id: SILENCE_ACTION_ID },
          },
        ],
      },
      data: {
        ...data,
        orderId,
        reason: "ALARM_REMINDER",
      },
    },
    trigger
  );
}

async function clearAlarmNotifications(orderId: string | undefined) {
  if (!orderId) return;

  const id = String(orderId);

  await notifee.cancelDisplayedNotification(id).catch(() => undefined);
  await notifee.cancelNotification(id).catch(() => undefined);
  await notifee.cancelNotification(`${id}-alarm`).catch(() => undefined);
  await notifee.cancelTriggerNotification(`${id}-alarm`).catch(() => undefined);
}

export async function dismissDriverAlarm(orderId: string) {
  await clearAlarmNotifications(orderId);
}

async function handleAck(orderId: string | undefined) {
  if (!orderId) return;

  try {
    await driverService.confirmReassignment(orderId);
  } catch (error) {
    console.error("Failed to acknowledge reassignment", error);
  } finally {
    await clearAlarmNotifications(orderId);
  }
}

async function handleSilence(orderId: string | undefined) {
  if (!orderId) return;

  await clearAlarmNotifications(orderId);
}

async function onForegroundEvent({ type, detail }: { type: EventType; detail: EventDetail }) {
  if (type === EventType.ACTION_PRESS) {
    const rawOrderId = detail.notification?.data?.orderId;
    const orderId = typeof rawOrderId === "string" ? rawOrderId : undefined;

    if (detail.pressAction?.id === ACKNOWLEDGE_ACTION_ID) {
      await handleAck(orderId);
    }
    if (detail.pressAction?.id === SILENCE_ACTION_ID) {
      await handleSilence(orderId);
    }
  }
}

async function handleAppStateChange(nextState: AppStateStatus) {
  if (nextState !== "active") {
    return;
  }

  const storedToken = await readStoredToken();
  if (!storedToken) {
    try {
      const refreshedToken = await messaging().getToken();
      if (refreshedToken) {
        await syncDeviceToken(refreshedToken);
      }
    } catch (error) {
      console.error("Failed to refresh token on app foreground", error);
    }
  }
}

export async function initializeDriverNotifications(): Promise<CleanupFn | null> {
  console.log("[Notifications] Initializing driver notifications");
  const permissionsGranted = await requestNotificationPermissions();
  if (!permissionsGranted) {
    console.warn("[Notifications] Permissions not granted; skipping initialization");
    return null;
  }

  await ensureAndroidChannels();
  await configureIOSCategories();

  const token = await messaging().getToken();
  console.log("[Notifications] Retrieved FCM token", token.slice(0, 12));
  await syncDeviceToken(token);

  onTokenRefreshCleanup?.();
  onTokenRefreshCleanup = messaging().onTokenRefresh(async refreshedToken => {
    console.log("[Notifications] Token refreshed", refreshedToken.slice(0, 12));
    await syncDeviceToken(refreshedToken);
  });

  onMessageCleanup?.();
  onMessageCleanup = messaging().onMessage(async remoteMessage => {
    await displayDriverNotification(remoteMessage);
  });

  onForegroundEventCleanup?.();
  onForegroundEventCleanup = notifee.onForegroundEvent(onForegroundEvent);

  appStateListenerCleanup?.();
  const appStateSubscription = AppState.addEventListener("change", handleAppStateChange);
  appStateListenerCleanup = () => {
    appStateSubscription.remove();
  };

  return () => {
    onTokenRefreshCleanup?.();
    onTokenRefreshCleanup = null;
    onMessageCleanup?.();
    onMessageCleanup = null;
    onForegroundEventCleanup?.();
    onForegroundEventCleanup = null;
    appStateListenerCleanup?.();
    appStateListenerCleanup = null;
  };
}

export async function shutdownDriverNotifications(): Promise<void> {
  onTokenRefreshCleanup?.();
  onMessageCleanup?.();
  onForegroundEventCleanup?.();
  appStateListenerCleanup?.();

  onTokenRefreshCleanup = null;
  onMessageCleanup = null;
  onForegroundEventCleanup = null;
  appStateListenerCleanup = null;

  const storedToken = await readStoredToken();
  if (storedToken) {
    try {
      await notificationService.unregisterDevice(storedToken);
    } catch (error) {
      console.error("Failed to unregister device token", error);
    }
    await clearStoredToken();
  }

  try {
    await messaging().deleteToken();
  } catch (error) {
    console.warn("Unable to delete FCM token", error);
  }
}

export async function handleDriverRemoteMessage(
  remoteMessage: FirebaseMessagingTypes.RemoteMessage
) {
  await displayDriverNotification(remoteMessage);
}

export async function handleNotifeeBackgroundEvent({
  type,
  detail,
}: {
  type: EventType;
  detail: EventDetail;
}) {
  if (type === EventType.ACTION_PRESS) {
    const rawOrderId = detail.notification?.data?.orderId;
    const orderId = typeof rawOrderId === "string" ? rawOrderId : undefined;
    if (detail.pressAction?.id === ACKNOWLEDGE_ACTION_ID) {
      await handleAck(orderId);
    }
    if (detail.pressAction?.id === SILENCE_ACTION_ID) {
      await handleSilence(orderId);
    }
  }
}

export async function getStoredDriverToken(): Promise<string | null> {
  return readStoredToken();
}

export async function clearStoredDriverToken(): Promise<void> {
  await clearStoredToken();
}

export type NotificationDebugSnapshot = {
  notifeeSettings: Awaited<ReturnType<typeof notifee.getNotificationSettings>> | null;
  firebaseAuthorization: FirebaseMessagingTypes.AuthorizationStatus | null;
  storedToken: string | null;
  currentToken: string | null;
};

export async function getNotificationDebugSnapshot(): Promise<NotificationDebugSnapshot> {
  let notifeeSettings: Awaited<ReturnType<typeof notifee.getNotificationSettings>> | null = null;
  let firebaseAuthorization: FirebaseMessagingTypes.AuthorizationStatus | null = null;
  let storedToken: string | null = null;
  let currentToken: string | null = null;

  try {
    notifeeSettings = await notifee.getNotificationSettings();
  } catch (error) {
    console.warn("[Notifications] Failed to get Notifee settings", error);
  }

  try {
    firebaseAuthorization = await messaging().hasPermission();
  } catch (error) {
    console.warn("[Notifications] Failed to get Firebase permission status", error);
  }

  try {
    storedToken = await readStoredToken();
  } catch (error) {
    console.warn("[Notifications] Failed to get stored token", error);
  }

  try {
    currentToken = await messaging().getToken();
  } catch (error) {
    console.warn("[Notifications] Failed to get current token", error);
  }

  return {
    notifeeSettings,
    firebaseAuthorization,
    storedToken,
    currentToken,
  };
}

export async function forceRegisterCurrentToken(): Promise<string | null> {
  try {
    const token = await messaging().getToken();
    if (token) {
      await syncDeviceToken(token);
      return token;
    }
    console.warn("[Notifications] forceRegisterCurrentToken: no token returned");
    return null;
  } catch (error) {
    console.error("[Notifications] forceRegisterCurrentToken failed", error);
    throw error;
  }
}

export async function requestNotificationPermissionsDebug(): Promise<boolean> {
  return requestNotificationPermissions();
}
