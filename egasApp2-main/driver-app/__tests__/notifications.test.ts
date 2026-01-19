import type { FirebaseMessagingTypes } from "@react-native-firebase/messaging";
import { handleDriverRemoteMessage } from "../lib/notifications";
const notifee = require("@notifee/react-native");
const {
  createChannel: mockCreateChannel,
  setNotificationCategories: mockSetNotificationCategories,
  displayNotification: mockDisplayNotification,
  createTriggerNotification: mockCreateTriggerNotification,
  requestPermission: mockRequestPermission,
  onForegroundEvent: mockOnForegroundEvent,
  cancelDisplayedNotification: mockCancelDisplayedNotification,
  cancelNotification: mockCancelNotification,
} = notifee.default;

jest.mock("react-native", () => ({
  Platform: {
    OS: "android",
    select: jest.fn((options: Record<string, unknown>) => options.android ?? options.default),
  },
  AppState: {
    addEventListener: jest.fn(() => ({ remove: jest.fn() })),
  },
}));

jest.mock(
  "@notifee/react-native",
  () => {
    const createChannel = jest.fn(async channel => channel?.id ?? "driver-critical-alerts");
    const setNotificationCategories = jest.fn(async () => undefined);
    const displayNotification = jest.fn(async () => undefined);
    const createTriggerNotification = jest.fn(async () => undefined);
    const requestPermission = jest.fn(async () => ({ authorizationStatus: 1 }));
    const onForegroundEvent = jest.fn(() => jest.fn());
    const cancelDisplayedNotification = jest.fn(async () => undefined);
    const cancelNotification = jest.fn(async () => undefined);
    const getNotificationSettings = jest.fn();

    const defaults = {
      createChannel,
      setNotificationCategories,
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
      AndroidCategory: { CALL: "call", MESSAGE: "message" },
      AndroidLaunchActivityFlag: { SINGLE_TOP: 1 },
      TriggerType: { TIMESTAMP: "timestamp", INTERVAL: "interval" },
      TimeUnit: { SECONDS: "seconds" },
      AndroidVisibility: { PUBLIC: "public" },
      EventType: { ACTION_PRESS: 0, DISMISSED: 1 },
      AuthorizationStatus: { DENIED: 0 },
    };
  },
  { virtual: true }
);

jest.mock("@react-native-firebase/messaging", () => {
  const messagingMock = () => ({
    requestPermission: jest.fn(async () => ({ authorizationStatus: 1 })),
    getToken: jest.fn(async () => "mock-token"),
    onTokenRefresh: jest.fn(),
    registerDeviceForRemoteMessages: jest.fn(),
    setBackgroundMessageHandler: jest.fn(),
  });
  messagingMock.AuthorizationStatus = { AUTHORIZED: 1, PROVISIONAL: 2, DENIED: 0 };
  return messagingMock;
});

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(async () => null),
  setItem: jest.fn(async () => undefined),
  removeItem: jest.fn(async () => undefined),
}));

jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(async () => null),
  setItemAsync: jest.fn(async () => undefined),
  deleteItemAsync: jest.fn(async () => undefined),
}));

jest.mock("@/services/notifications", () => ({
  notificationService: {
    registerDevice: jest.fn(),
    unregisterDevice: jest.fn(),
  },
}));

jest.mock("@/services/driver", () => ({
  driverService: {
    acknowledgeAlarm: jest.fn(async () => ({ success: true })),
    silenceAlarm: jest.fn(async () => ({ success: true })),
  },
}));

describe("driver notification handling", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("displays persistent notification and schedules alarm reminder for assignment messages", async () => {
    const message: FirebaseMessagingTypes.RemoteMessage = {
      data: {
        type: "ORDER_ASSIGNMENT",
        orderId: "order-101",
        title: "New order",
        body: "Order EG-101 waiting",
      },
      notification: {
        title: "New order assigned",
        body: "Order EG-101 is ready for pickup",
      },
      messageId: "message-assign-1",
      sentTime: Date.now(),
    } as FirebaseMessagingTypes.RemoteMessage;

    await handleDriverRemoteMessage(message);

    expect(mockCreateChannel).toHaveBeenCalledWith(
      expect.objectContaining({ id: "driver-critical-alerts" })
    );
    expect(mockCreateChannel).toHaveBeenCalledWith(
      expect.objectContaining({ id: "driver-general-updates" })
    );

    expect(mockDisplayNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          orderId: "order-101",
          type: "ORDER_ASSIGNMENT",
        }),
        android: expect.objectContaining({
          ongoing: true,
          actions: expect.arrayContaining([
            expect.objectContaining({ pressAction: { id: "acknowledge-order" } }),
          ]),
        }),
      })
    );

    expect(mockCreateTriggerNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "order-101-alarm",
        android: expect.objectContaining({
          channelId: "driver-critical-alerts",
        }),
      }),
      expect.objectContaining({
        type: "interval",
        interval: 30,
        timeUnit: "seconds",
      })
    );
  });

  it("does not schedule alarm reminders for regular updates", async () => {
    const message: FirebaseMessagingTypes.RemoteMessage = {
      data: {
        type: "ORDER_STATUS",
        orderId: "order-102",
        title: "Order update",
        body: "Customer received the order",
      },
      notification: {
        title: "Order update",
        body: "Order EG-102 marked as delivered",
      },
      messageId: "message-status-1",
      sentTime: Date.now(),
    } as FirebaseMessagingTypes.RemoteMessage;

    await handleDriverRemoteMessage(message);

    expect(mockDisplayNotification).toHaveBeenCalled();
    expect(mockCreateTriggerNotification).not.toHaveBeenCalled();
  });
});
