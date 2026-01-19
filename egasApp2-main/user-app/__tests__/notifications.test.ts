import type { FirebaseMessagingTypes } from "@react-native-firebase/messaging";
import { handleUserRemoteMessage } from "../lib/notifications";

jest.mock("react-native", () => ({
  Platform: {
    OS: "android",
    select: jest.fn((options: Record<string, unknown>) => options.android ?? options.default),
  },
  AppState: {
    addEventListener: jest.fn(() => ({ remove: jest.fn() })),
  },
}));

jest.mock("expo-linking", () => ({
  createURL: jest.fn((path: string) => `exp://localhost/${path}`),
  openURL: jest.fn(async () => true),
}));

jest.mock(
  "@notifee/react-native",
  () => {
    const createChannel = jest.fn(async channel => channel?.id ?? "user-order-updates");
    const displayNotification = jest.fn(async () => undefined);
    const createTriggerNotification = jest.fn(async () => undefined);
    const requestPermission = jest.fn(async () => ({ authorizationStatus: 1 }));
    const onForegroundEvent = jest.fn(() => jest.fn());
    const cancelDisplayedNotification = jest.fn(async () => undefined);
    const cancelNotification = jest.fn(async () => undefined);
    const getNotificationSettings = jest.fn();

    const defaults = {
      createChannel,
      displayNotification,
      createTriggerNotification,
      requestPermission,
      onForegroundEvent,
      cancelDisplayedNotification,
      cancelNotification,
      getNotificationSettings,
    };

    return {
      __esModule: true,
      ...defaults,
      default: defaults,
      AndroidImportance: { HIGH: 5, DEFAULT: 3 },
      AndroidLaunchActivityFlag: { SINGLE_TOP: 1 },
      AndroidVisibility: { PUBLIC: "public" },
      AndroidCategory: { CALL: "call", MESSAGE: "message" },
      TriggerType: { TIMESTAMP: "timestamp" },
      EventType: { ACTION_PRESS: 1, DISMISSED: 2 },
      AuthorizationStatus: { DENIED: 0 },
    };
  },
  { virtual: true }
);

const notifee = require("@notifee/react-native");
const {
  createChannel: mockCreateChannel,
  displayNotification: mockDisplayNotification,
  createTriggerNotification: mockCreateTriggerNotification,
  requestPermission: mockRequestPermission,
  onForegroundEvent: mockOnForegroundEvent,
  cancelDisplayedNotification: mockCancelDisplayedNotification,
  cancelNotification: mockCancelNotification,
} = notifee.default;

jest.mock("@react-native-firebase/app", () => ({
  __esModule: true,
  default: {
    app: jest.fn(() => ({})),
    initializeApp: jest.fn(() => ({})),
  },
}));

jest.mock("@react-native-firebase/messaging", () => {
  const messagingMock = () => ({
    requestPermission: jest.fn(async () => ({ authorizationStatus: 1 })),
    hasPermission: jest.fn(async () => 1),
    registerDeviceForRemoteMessages: jest.fn(async () => undefined),
    getToken: jest.fn(async () => "user-token"),
    onMessage: jest.fn(),
    onTokenRefresh: jest.fn(),
  });
  messagingMock.AuthorizationStatus = { AUTHORIZED: 1, PROVISIONAL: 2, DENIED: 0 };
  return messagingMock;
});

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(async () => null),
  setItem: jest.fn(async () => undefined),
  removeItem: jest.fn(async () => undefined),
}));

jest.mock("@/services/notifications", () => ({
  notificationService: {
    registerDevice: jest.fn(),
    unregisterDevice: jest.fn(),
    sendTestNotification: jest.fn(),
  },
}));

describe("user notification handling", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("displays delivery notification with deep-link data", async () => {
    const message: FirebaseMessagingTypes.RemoteMessage = {
      data: {
        type: "ORDER_DELIVERED",
        orderId: "order-501",
        title: "Delivery complete",
        body: "Your gas order has arrived",
      },
      notification: {
        title: "Order delivered",
        body: "Order #EG-501 has been delivered",
      },
      messageId: "msg-delivered-1",
      sentTime: Date.now(),
    } as FirebaseMessagingTypes.RemoteMessage;

    await handleUserRemoteMessage(message);

    expect(mockCreateChannel).toHaveBeenCalledWith(
      expect.objectContaining({ id: "user-order-updates" })
    );
    expect(mockCreateChannel).toHaveBeenCalledWith(
      expect.objectContaining({ id: "user-delivery-reminders" })
    );

    expect(mockDisplayNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "delivery-order-501",
        data: expect.objectContaining({
          orderId: "order-501",
          type: "ORDER_DELIVERED",
        }),
      })
    );
  });

  it("shows standard notification for status updates", async () => {
    const message: FirebaseMessagingTypes.RemoteMessage = {
      data: {
        type: "ORDER_STATUS",
        orderId: "order-777",
        status: "ASSIGNED",
        title: "Order update",
        body: "Driver assigned to your order",
      },
      notification: {
        title: "Order update",
        body: "Driver assigned to your order",
      },
      messageId: "msg-status-1",
      sentTime: Date.now(),
    } as FirebaseMessagingTypes.RemoteMessage;

    await handleUserRemoteMessage(message);

    expect(mockDisplayNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        android: expect.objectContaining({
          channelId: "user-order-updates",
        }),
        data: expect.objectContaining({
          orderId: "order-777",
          status: "ASSIGNED",
        }),
      })
    );
  });
});
