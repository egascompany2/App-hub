import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import messaging, { FirebaseMessagingTypes } from "@react-native-firebase/messaging";
import notifee, { AndroidImportance, EventType } from "@notifee/react-native";
import {
  forceRegisterCurrentToken,
  getNotificationDebugSnapshot,
  handleUserRemoteMessage,
  initializeUserNotifications,
  shutdownUserNotifications,
} from "@/lib/notifications";
import { notificationService } from "@/services/notifications";

export default function UserNotificationDebugScreen() {
  const [snapshot, setSnapshot] = useState<Awaited<ReturnType<typeof getNotificationDebugSnapshot>> | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const cleanupRef = useRef<(() => void) | null>(null);

  const appendLog = useCallback((message: string) => {
    setLogs(prev => [`${new Date().toLocaleTimeString()} ${message}`, ...prev].slice(0, 200));
  }, []);

  const refreshSnapshot = useCallback(async () => {
    try {
      const snap = await getNotificationDebugSnapshot();
      setSnapshot(snap);
      appendLog(`Snapshot refreshed (token=${snap.currentToken ? snap.currentToken.slice(0, 12) : "none"})`);
    } catch (error) {
      appendLog(`Failed to refresh snapshot ${(error as Error).message}`);
    }
  }, [appendLog]);

  useEffect(() => {
    refreshSnapshot();
  }, [refreshSnapshot]);

  useEffect(() => {
    const unsubscribeMessage = messaging().onMessage(async (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
      appendLog(`Foreground message ${remoteMessage.data?.type ?? ""} id=${remoteMessage.messageId ?? ""}`);
    });
    const unsubscribeNotifee = notifee.onForegroundEvent(event => {
      if (event.type === EventType.ACTION_PRESS) {
        appendLog(`Action ${event.detail.pressAction?.id} notification=${event.detail.notification?.id}`);
      }
      if (event.type === EventType.DISMISSED) {
        appendLog(`Dismissed notification=${event.detail.notification?.id}`);
      }
    });

    return () => {
      unsubscribeMessage();
      unsubscribeNotifee();
    };
  }, [appendLog]);

  useEffect(() => {
    return () => {
      cleanupRef.current?.();
      cleanupRef.current = null;
    };
  }, []);

  const ensureInitialized = async () => {
    appendLog("Initializing user notifications…");
    const cleanup = await initializeUserNotifications();
    cleanupRef.current?.();
    cleanupRef.current = cleanup;
    await refreshSnapshot();
    appendLog("Initialization complete");
  };

  const shutdown = async () => {
    appendLog("Shutting down user notifications…");
    await shutdownUserNotifications();
    cleanupRef.current?.();
    cleanupRef.current = null;
    await refreshSnapshot();
    appendLog("Shutdown complete");
  };

  const sendTestPush = async () => {
    const token = snapshot?.currentToken ?? snapshot?.storedToken;
    if (!token) {
      Alert.alert("No token", "Register notifications to obtain a token first.");
      return;
    }
    try {
      await notificationService.sendTestNotification({
        token,
        title: "User Debug Push",
        body: "This is a test notification from the debug screen.",
      });
      appendLog("Test push request sent");
    } catch (error) {
      appendLog(`Test push failed ${(error as Error).message}`);
    }
  };

  const registerCurrent = async () => {
    try {
      const token = await forceRegisterCurrentToken();
      appendLog(`forceRegisterCurrentToken => ${token ? token.slice(0, 12) : "none"}`);
      await refreshSnapshot();
    } catch (error) {
      appendLog(`forceRegisterCurrentToken failed ${(error as Error).message}`);
    }
  };

  const simulateRemote = async () => {
    appendLog("Simulating ORDER_STATUS payload");
    await handleUserRemoteMessage({
      data: {
        orderId: "debug-user-order",
        type: "ORDER_STATUS",
        status: "DELIVERED",
        title: "Simulated Order Delivered",
        body: "This was triggered locally for debugging.",
      },
      messageId: `debug-${Date.now()}`,
      sentTime: Date.now(),
    } as FirebaseMessagingTypes.RemoteMessage);
  };

  const triggerLocal = async () => {
    appendLog("Showing local notification");
    await notifee.displayNotification({
      id: `user-local-${Date.now()}`,
      title: "Local Debug Notification",
      body: "This notification is generated locally.",
      android: {
        channelId: "user-order-updates",
        importance: AndroidImportance.DEFAULT,
      },
    });
  };

  const notifeeStatus = snapshot?.notifeeSettings
    ? JSON.stringify(snapshot.notifeeSettings, null, 2)
    : "Unavailable";

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>User Notification Debugger</Text>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tokens</Text>
          <Text style={styles.label}>Stored token</Text>
          <Text selectable style={styles.value}>{snapshot?.storedToken ?? "—"}</Text>
          <Text style={styles.label}>Current token</Text>
          <Text selectable style={styles.value}>{snapshot?.currentToken ?? "—"}</Text>
          <View style={styles.row}>
            <TouchableOpacity style={styles.button} onPress={refreshSnapshot}>
              <Text style={styles.buttonText}>Refresh</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={ensureInitialized}>
              <Text style={styles.buttonText}>Register / Init</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={registerCurrent}>
              <Text style={styles.buttonText}>Force Register</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={shutdown}>
              <Text style={styles.buttonText}>Unregister</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Diagnostics</Text>
          <Text style={styles.label}>Notifee Settings</Text>
          <Text selectable style={styles.code}>{notifeeStatus}</Text>
          <Text style={styles.label}>Firebase Authorization</Text>
          <Text style={styles.value}>{snapshot?.firebaseAuthorization ?? "—"}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions</Text>
          <View style={styles.row}>
            <TouchableOpacity style={styles.button} onPress={sendTestPush}>
              <Text style={styles.buttonText}>Send Test Push</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={triggerLocal}>
              <Text style={styles.buttonText}>Local Toast</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={simulateRemote}>
              <Text style={styles.buttonText}>Simulate Remote</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.logHeader}>
            <Text style={styles.sectionTitle}>Logs</Text>
            <TouchableOpacity onPress={() => setLogs([])}>
              <Text style={styles.clearText}>Clear</Text>
            </TouchableOpacity>
          </View>
          {logs.length === 0 ? (
            <Text style={styles.empty}>No logs yet.</Text>
          ) : (
            logs.map(line => (
              <Text key={line} style={styles.logLine}>
                {line}
              </Text>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#172554",
    paddingTop: 48,
  },
  heading: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fbbf24",
    textAlign: "center",
    marginBottom: 16,
  },
  content: {
    padding: 20,
    gap: 24,
  },
  section: {
    backgroundColor: "rgba(2, 6, 23, 0.8)",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(147, 197, 253, 0.2)",
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#f8fafc",
  },
  label: {
    color: "#cbd5f5",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  value: {
    color: "#f1f5f9",
    fontSize: 13,
    marginBottom: 8,
  },
  code: {
    color: "#e2e8f0",
    fontSize: 12,
    fontFamily: "monospace",
    backgroundColor: "rgba(30, 41, 59, 0.8)",
    padding: 8,
    borderRadius: 8,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  button: {
    backgroundColor: "#2563eb",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  buttonText: {
    color: "#f8fafc",
    fontWeight: "600",
  },
  logHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  clearText: {
    color: "#f87171",
    fontWeight: "600",
  },
  empty: {
    color: "#cbd5f5",
    fontStyle: "italic",
  },
  logLine: {
    color: "#f1f5f9",
    fontSize: 12,
    marginBottom: 4,
  },
});
