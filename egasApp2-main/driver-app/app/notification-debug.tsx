import React, { useEffect, useState, useCallback, useRef } from "react";
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
  getStoredDriverToken,
  initializeDriverNotifications,
  shutdownDriverNotifications,
  handleDriverRemoteMessage,
} from "@/lib/notifications";
import { notificationService } from "@/services/notifications";

const formatToken = (token: string | null) =>
  token ? `${token.slice(0, 12)}…${token.slice(-6)}` : "<none>";

export default function DriverNotificationDebugScreen() {
  const [storedToken, setStoredToken] = useState<string | null>(null);
  const [currentToken, setCurrentToken] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const listenerCleanupRef = useRef<(() => void) | null>(null);

  const appendLog = useCallback((message: string) => {
    setLogs(prev => [`${new Date().toLocaleTimeString()} ${message}`, ...prev].slice(0, 200));
  }, []);

  const loadTokens = useCallback(async () => {
    try {
      const [stored, current] = await Promise.all([
        getStoredDriverToken(),
        messaging().getToken().catch(() => null),
      ]);
      setStoredToken(stored);
      setCurrentToken(current);
      appendLog(`Tokens refreshed. Stored=${formatToken(stored)} Current=${formatToken(current)}`);
    } catch (error) {
      appendLog(`Failed to load tokens: ${(error as Error).message}`);
    }
  }, [appendLog]);

  useEffect(() => {
    loadTokens();
  }, [loadTokens]);

  useEffect(() => {
    const unsubscribeMessage = messaging().onMessage(async (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
      appendLog(`Foreground message ${remoteMessage.messageId ?? ""} ${remoteMessage.data?.type ?? ""}`);
    });

    const unsubscribeNotifee = notifee.onForegroundEvent(async event => {
      if (event.type === EventType.DISMISSED) {
        appendLog(`Notifee dismissed id=${event.detail.notification?.id}`);
      }
      if (event.type === EventType.ACTION_PRESS) {
        appendLog(`Notifee action ${event.detail.pressAction?.id} id=${event.detail.notification?.id}`);
      }
    });

    return () => {
      unsubscribeMessage();
      unsubscribeNotifee();
    };
  }, [appendLog]);

  useEffect(() => {
    return () => {
      listenerCleanupRef.current?.();
      listenerCleanupRef.current = null;
    };
  }, []);

  const ensureInitialized = async () => {
    appendLog("Initializing driver notifications…");
    const cleanup = await initializeDriverNotifications();
    listenerCleanupRef.current?.();
    listenerCleanupRef.current = cleanup ?? null;
    await loadTokens();
    appendLog("Initialization complete");
  };

  const shutdown = async () => {
    appendLog("Shutting down notifications…");
    await shutdownDriverNotifications();
    listenerCleanupRef.current?.();
    listenerCleanupRef.current = null;
    await loadTokens();
    appendLog("Shutdown complete");
  };

  const sendTestPush = async () => {
    const token = currentToken ?? storedToken;
    if (!token) {
      Alert.alert("Missing token", "Register or refresh tokens first.");
      return;
    }
    try {
      await notificationService.sendTestNotification({
        token,
        title: "Driver Debug Push",
        body: "This is a test push from the driver debug screen.",
      });
      appendLog("Test push request sent");
    } catch (error) {
      appendLog(`Test push failed: ${(error as Error).message}`);
    }
  };

  const triggerLocalAlarm = async () => {
    const id = `local-${Date.now()}`;
    appendLog("Triggering local persistent notification");
    await notifee.displayNotification({
      id,
      title: "Local Alarm",
      body: "This is a local reminder repeating every 30s.",
      data: { type: "DEBUG_LOCAL" },
      android: {
        channelId: "driver-critical-alerts",
        importance: AndroidImportance.HIGH,
        ongoing: true,
        autoCancel: false,
      },
    });
  };

  const simulateRemoteAlarm = async () => {
    appendLog("Simulating remote ALARM_REMINDER payload");
    await handleDriverRemoteMessage({
      data: {
        orderId: "debug-order",
        type: "ALARM_REMINDER",
        title: "Simulated Alarm",
        body: "Driver must acknowledge order.",
      },
      messageId: `debug-${Date.now()}`,
      sentTime: Date.now(),
    } as FirebaseMessagingTypes.RemoteMessage);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Driver Notification Debugger</Text>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tokens</Text>
          <Text style={styles.label}>Stored token</Text>
          <Text selectable style={styles.value}>{storedToken ?? "—"}</Text>
          <Text style={styles.label}>Current token</Text>
          <Text selectable style={styles.value}>{currentToken ?? "—"}</Text>
          <View style={styles.row}>
            <TouchableOpacity style={styles.button} onPress={loadTokens}>
              <Text style={styles.buttonText}>Refresh</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={ensureInitialized}>
              <Text style={styles.buttonText}>Register / Init</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={shutdown}>
              <Text style={styles.buttonText}>Unregister</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions</Text>
          <View style={styles.row}>
            <TouchableOpacity style={styles.button} onPress={sendTestPush}>
              <Text style={styles.buttonText}>Send Test Push</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={triggerLocalAlarm}>
              <Text style={styles.buttonText}>Local Alarm</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={simulateRemoteAlarm}>
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
    backgroundColor: "#0b1120",
    paddingTop: 48,
  },
  heading: {
    fontSize: 20,
    fontWeight: "700",
    color: "#38bdf8",
    textAlign: "center",
    marginBottom: 16,
  },
  content: {
    padding: 20,
    gap: 24,
  },
  section: {
    backgroundColor: "rgba(30, 41, 59, 0.8)",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.2)",
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#e2e8f0",
  },
  label: {
    color: "#cbd5f5",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  value: {
    color: "#f8fafc",
    fontSize: 13,
    marginBottom: 8,
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
    fontFamily: Platform.select({ ios: "Menlo", default: "monospace" }),
  },
});
