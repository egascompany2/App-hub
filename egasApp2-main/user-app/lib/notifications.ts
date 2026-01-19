import { AppState, AppStateStatus, Platform } from "react-native";
// Use dynamic imports for Firebase to avoid crashes in Expo Go
let firebase: any = null;
let messaging: any = null;

// Type definitions that work with or without Firebase
type FirebaseMessagingTypes = any;
type FirebaseAuthorizationStatus = any;

// Try to import Firebase, but don't crash if it's not available (Expo Go)
try {
  firebase = require("@react-native-firebase/app").default;
  const messagingModule = require("@react-native-firebase/messaging");
  messaging = messagingModule.default;
  // Use the actual types if available
  if (messagingModule.FirebaseMessagingTypes) {
    // Types are available
  }
  if (messagingModule.AuthorizationStatus) {
    // AuthorizationStatus enum available
  }
} catch (error) {
  console.warn("[Notifications] Firebase not available (Expo Go mode). Push notifications will be disabled.");
}

// Create enum-like object for AuthorizationStatus
const FirebaseAuthStatus = {
  NOT_DETERMINED: 0,
  DENIED: 1,
  AUTHORIZED: 2,
  PROVISIONAL: 3,
};
import notifee, {
  AndroidCategory,
  AndroidImportance,
  AndroidLaunchActivityFlag,
  AndroidVisibility,
  EventDetail,
  EventType,
} from "@notifee/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Linking from "expo-linking";
import { notificationService } from "@/services/notifications";

type CleanupFn = () => void;

type NotificationDebugSnapshot = {
  notifeeSettings: Awaited<ReturnType<typeof notifee.getNotificationSettings>> | null;
  firebaseAuthorization: FirebaseMessagingTypes.AuthorizationStatus | null;
  storedToken: string | null;
  currentToken: string | null;
};

const USER_FCM_TOKEN_KEY = "@user/fcmToken";
const USER_NOTIFICATION_CHANNEL_ID = "user-order-updates";
const USER_DELIVERY_CHANNEL_ID = "user-delivery-reminders";
const VIEW_ORDER_ACTION_ID = "view-order";
const DISMISS_DELIVERY_ACTION_ID = "dismiss-delivery";

let onTokenRefreshCleanup: CleanupFn | null = null;
let onForegroundEventCleanup: CleanupFn | null = null;
let appStateListenerCleanup: CleanupFn | null = null;
let onMessageCleanup: CleanupFn | null = null;
let firebaseReady = false;

async function ensureFirebaseApp() {
  if (firebaseReady) return;
  try {
    firebase.app();
    firebaseReady = true;
  } catch (error) {
    // In Expo Go, Firebase native modules are not available
    // Fail gracefully instead of throwing
    try {
      const config = Platform.select({
        ios: {
          appId: "1:732082265368:ios:ac7799339befd79d95526d",
          apiKey: "AIzaSyBWlMQuIAqjdjAMDIUwMMtaA77p3Lkkq8k",
          projectId: "egasadmin",
          storageBucket: "egasadmin.firebasestorage.app",
          messagingSenderId: "732082265368",
          databaseURL: "https://egasadmin-default-rtdb.firebaseio.com",
        },
        default: {
          appId: "1:732082265368:android:e9a7a6ea33c0fccf95526d",
          apiKey: "AIzaSyD613CNAYP8kV-QQovql9XfRuQwwSsiucQ",
          projectId: "egasadmin",
          storageBucket: "egasadmin.firebasestorage.app",
          messagingSenderId: "732082265368",
          databaseURL: "https://egasadmin-default-rtdb.firebaseio.com",
        },
      }) as {
        appId: string;
        apiKey: string;
        projectId: string;
        storageBucket: string;
        messagingSenderId: string;
        databaseURL: string;
      };

      firebase.initializeApp(config);
      firebaseReady = true;
      console.log("[Notifications] Firebase app initialized manually");
    } catch (initError) {
      // In Expo Go, Firebase won't work - just log and continue
      console.warn("[Notifications] Firebase not available (Expo Go mode). Push notifications will be disabled.");
      firebaseReady = false;
      // Don't throw - allow app to continue without Firebase
    }
  }
}

// Helper to safely get messaging instance (returns null in Expo Go)
function getMessaging() {
  try {
    if (!firebaseReady) return null;
    return messaging();
  } catch (error) {
    console.warn("[Notifications] Messaging not available:", error);
    return null;
  }
}

const isNotificationAuthorized = (status: number) =>
  status === FirebaseAuthStatus.AUTHORIZED ||
  status === FirebaseAuthStatus.PROVISIONAL;

const toText = (value: unknown, fallback: string): string => {
  if (typeof value === "string" && value.trim().length > 0) {
    return value;
  }
  return fallback;
};

async function ensureNotificationChannels(): Promise<void> {
  await notifee.createChannel({
    id: USER_NOTIFICATION_CHANNEL_ID,
    name: "Order Updates",
    importance: AndroidImportance.DEFAULT,
    sound: "default",
  });

  await notifee.createChannel({
    id: USER_DELIVERY_CHANNEL_ID,
    name: "Delivery Reminders",
    importance: AndroidImportance.HIGH,
    sound: "default",
    vibration: true,
    visibility: AndroidVisibility.PUBLIC,
  });
}

async function requestNotificationPermissions(): Promise<boolean> {
  try {
    const notifeeSettings = await notifee.requestPermission();
    if (notifeeSettings.authorizationStatus === FirebaseAuthStatus.DENIED) {
      return false;
    }

    // In Expo Go, Firebase messaging is not available
    const messagingInstance = getMessaging();
    if (!messagingInstance) {
      console.warn("[Notifications] Firebase messaging not available (Expo Go). Notifications will be limited.");
      return true; // Allow app to continue with Notifee only
    }

    const firebaseSettings = await messagingInstance.requestPermission({
      alert: true,
      badge: true,
      sound: true,
      provisional: true,
    });

    if (!isNotificationAuthorized(firebaseSettings)) {
      return false;
    }

    await messagingInstance.registerDeviceForRemoteMessages();
    return true;
  } catch (error) {
    console.error("Failed to request notification permissions", error);
    return false;
  }
}

const getStoredToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(USER_FCM_TOKEN_KEY);
  } catch (error) {
    console.warn("[Notifications] Failed to read stored token", error);
    return null;
  }
};

const storeToken = async (token: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(USER_FCM_TOKEN_KEY, token);
  } catch (error) {
    console.error("[Notifications] Failed to persist token", error);
  }
};

const removeStoredToken = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(USER_FCM_TOKEN_KEY);
  } catch (error) {
    console.warn("[Notifications] Failed to clear stored token", error);
  }
};

const getNotificationId = (remoteMessage: FirebaseMessagingTypes.RemoteMessage): string =>
  String(remoteMessage.data?.orderId ?? remoteMessage.messageId ?? Date.now());

const createDeliveryNotificationId = (orderId: string) => `delivery-${orderId}`;

async function cancelDeliveryNotification(orderId: string) {
  const id = createDeliveryNotificationId(orderId);
  await notifee.cancelDisplayedNotification(id).catch(() => undefined);
  await notifee.cancelNotification(id).catch(() => undefined);
}

async function navigateToOrder(orderId: string) {
  try {
    const url = Linking.createURL(`/order-summary?orderId=${orderId}`);
    await Linking.openURL(url);
  } catch (error) {
    console.warn("[Notifications] Failed to open deep link", error);
  }
}

async function displayDeliveryNotification(remoteMessage: FirebaseMessagingTypes.RemoteMessage) {
  const rawOrderId = remoteMessage.data?.orderId;
  if (typeof rawOrderId !== "string" || rawOrderId.trim().length === 0) {
    return;
  }
  const orderId = rawOrderId.trim();
  const title = toText(remoteMessage.notification?.title ?? remoteMessage.data?.title, "Order delivered");
  const body = toText(remoteMessage.notification?.body ?? remoteMessage.data?.body, "Your order has been delivered.");
  const dataPayload = (remoteMessage.data ?? {}) as Record<string, string>;

  await ensureNotificationChannels();

  await notifee.displayNotification({
    id: createDeliveryNotificationId(orderId),
    title,
    body,
    data: {
      ...dataPayload,
      orderId,
      type: "ORDER_DELIVERED",
    },
    android: {
      channelId: USER_DELIVERY_CHANNEL_ID,
      category: AndroidCategory.REMINDER,
      importance: AndroidImportance.HIGH,
      visibility: AndroidVisibility.PUBLIC,
      sound: "default",
      autoCancel: false,
      ongoing: true,
      showTimestamp: true,
      pressAction: {
        id: VIEW_ORDER_ACTION_ID,
        launchActivity: "default",
        launchActivityFlags: [AndroidLaunchActivityFlag.SINGLE_TOP],
      },
      actions: [
        {
          title: "View order",
          pressAction: { id: VIEW_ORDER_ACTION_ID },
        },
        {
          title: "Mark as seen",
          pressAction: { id: DISMISS_DELIVERY_ACTION_ID },
        },
      ],
    },
    ios: {
      sound: "default",
      categoryId: "order_delivery",
      interruptionLevel: "timeSensitive",
    },
  });
}

async function displayStandardNotification(remoteMessage: FirebaseMessagingTypes.RemoteMessage) {
  const title = toText(remoteMessage.notification?.title ?? remoteMessage.data?.title, "Egas Update");
  const body = toText(remoteMessage.notification?.body ?? remoteMessage.data?.body, "You have a new update.");
  const dataPayload = (remoteMessage.data ?? {}) as Record<string, string>;

  await ensureNotificationChannels();

  await notifee.displayNotification({
    id: getNotificationId(remoteMessage),
    title,
    body,
    data: dataPayload,
    android: {
      channelId: USER_NOTIFICATION_CHANNEL_ID,
      importance: AndroidImportance.DEFAULT,
      sound: "default",
      pressAction: {
        id: VIEW_ORDER_ACTION_ID,
        launchActivity: "default",
        launchActivityFlags: [AndroidLaunchActivityFlag.SINGLE_TOP],
      },
    },
    ios: {
      sound: "default",
    },
  });
}

async function handleNotificationAction(detail: EventDetail) {
  const orderId = typeof detail.notification?.data?.orderId === "string" ? detail.notification?.data?.orderId : undefined;

  if (detail.pressAction?.id === VIEW_ORDER_ACTION_ID) {
    if (orderId) {
      await cancelDeliveryNotification(orderId);
      await navigateToOrder(orderId);
    }
    return;
  }

  if (detail.pressAction?.id === DISMISS_DELIVERY_ACTION_ID) {
    if (orderId) {
      await cancelDeliveryNotification(orderId);
    }
    return;
  }
}

async function handleNotificationDismiss(detail: EventDetail) {
  const orderId = typeof detail.notification?.data?.orderId === "string" ? detail.notification?.data?.orderId : undefined;
  if (orderId) {
    await cancelDeliveryNotification(orderId);
  }
}

async function syncDeviceToken(token: string): Promise<void> {
  try {
    const existing = await getStoredToken();
    if (existing === token) {
      return;
    }

    await notificationService.registerDevice({ token });
    await storeToken(token);
  } catch (error) {
    console.error("Failed to sync device token", error);
  }
}

async function handleAppStateChange(nextState: AppStateStatus) {
  if (nextState !== "active") {
    return;
  }

  const storedToken = await getStoredToken();
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

async function handleNotificationFromRemote(remoteMessage: FirebaseMessagingTypes.RemoteMessage) {
  const payloadType = remoteMessage.data?.type ?? remoteMessage.data?.reason;

  if (payloadType === "ORDER_DELIVERED") {
    await displayDeliveryNotification(remoteMessage);
    return;
  }

  await displayStandardNotification(remoteMessage);
}

async function onForegroundEvent(event: { type: EventType; detail: EventDetail }) {
  if (event.type === EventType.ACTION_PRESS) {
    await handleNotificationAction(event.detail);
  }

  if (event.type === EventType.DISMISSED) {
    await handleNotificationDismiss(event.detail);
  }
}

export async function initializeUserNotifications(): Promise<CleanupFn | null> {
  await ensureFirebaseApp();
  const granted = await requestNotificationPermissions();
  if (!granted) {
    return null;
  }

  await ensureNotificationChannels();

  // In Expo Go, Firebase messaging is not available
  const messagingInstance = getMessaging();
  if (!messagingInstance) {
    console.warn("[Notifications] Firebase messaging not available. Push notifications disabled.");
    return () => {
      // Return cleanup function even without Firebase
      onTokenRefreshCleanup?.();
      onTokenRefreshCleanup = null;
      onForegroundEventCleanup?.();
      onForegroundEventCleanup = null;
      appStateListenerCleanup?.();
      appStateListenerCleanup = null;
    };
  }

  const token = await messagingInstance.getToken();
  await syncDeviceToken(token);

  onTokenRefreshCleanup?.();
  onTokenRefreshCleanup = messagingInstance.onTokenRefresh(async refreshedToken => {
    await syncDeviceToken(refreshedToken);
  });

  onMessageCleanup?.();
  onMessageCleanup = messagingInstance.onMessage(async remoteMessage => {
    await ensureFirebaseApp();
    await handleNotificationFromRemote(remoteMessage);
  });

  onForegroundEventCleanup?.();
  onForegroundEventCleanup = notifee.onForegroundEvent(async event => {
    await onForegroundEvent(event);
  });

  appStateListenerCleanup?.();
  const appStateSubscription = AppState.addEventListener("change", handleAppStateChange);
  appStateListenerCleanup = () => {
    appStateSubscription.remove();
  };

  return () => {
    onTokenRefreshCleanup?.();
    onTokenRefreshCleanup = null;
    onForegroundEventCleanup?.();
    onForegroundEventCleanup = null;
    appStateListenerCleanup?.();
    appStateListenerCleanup = null;
  };
}

export async function shutdownUserNotifications(): Promise<void> {
  onTokenRefreshCleanup?.();
  onTokenRefreshCleanup = null;
  onForegroundEventCleanup?.();
  onForegroundEventCleanup = null;
  appStateListenerCleanup?.();
  appStateListenerCleanup = null;
  onMessageCleanup?.();
  onMessageCleanup = null;

  const storedToken = await getStoredToken();
  if (storedToken) {
    try {
      await notificationService.unregisterDevice(storedToken);
    } catch (error) {
      console.error("Failed to unregister user device", error);
    }
  }

  await removeStoredToken();
}

export async function handleUserRemoteMessage(remoteMessage: FirebaseMessagingTypes.RemoteMessage) {
  await ensureFirebaseApp();
  await handleNotificationFromRemote(remoteMessage);
}

export async function handleUserNotifeeBackgroundEvent(event: { type: EventType; detail: EventDetail }) {
  if (event.type === EventType.ACTION_PRESS) {
    await handleNotificationAction(event.detail);
  }

  if (event.type === EventType.DISMISSED) {
    await handleNotificationDismiss(event.detail);
  }
}

export async function forceRegisterCurrentToken(): Promise<string | null> {
  await ensureFirebaseApp();
  const token = await messaging().getToken();
  if (!token) {
    console.warn("[Notifications] No token returned during force register");
    return null;
  }

  await syncDeviceToken(token);
  return token;
}

export async function getNotificationDebugSnapshot(): Promise<NotificationDebugSnapshot> {
  let notifeeSettings: NotificationDebugSnapshot["notifeeSettings"] = null;
  let firebaseAuthorization: NotificationDebugSnapshot["firebaseAuthorization"] = null;
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
    storedToken = await getStoredToken();
  } catch (error) {
    console.warn("[Notifications] Failed to read stored token", error);
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

export async function clearStoredUserToken(): Promise<void> {
  await removeStoredToken();
}

export async function requestNotificationPermissionsDebug(): Promise<boolean> {
  return requestNotificationPermissions();
}
