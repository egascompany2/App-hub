import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";
import { View, ActivityIndicator } from "react-native";
import { AuthProvider } from "@/contexts/AuthContext";
import { AuthGuard } from "@/components/AuthGuard";
import { runFirebaseDiagnostics, setupGlobalErrorLogging, setupUpdatesLogging } from "@/lib/diagnostics";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    // Setup diagnostics early
    setupGlobalErrorLogging();
    setupUpdatesLogging();
    runFirebaseDiagnostics('AppStart').catch(() => {});
  }, []);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <AuthProvider>
      <AuthGuard>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="order" options={{ headerShown: false }} />
          <Stack.Screen name="card" options={{ headerShown: false }} />
          <Stack.Screen name="pos" options={{ headerShown: false }} />
          <Stack.Screen name="payonline" options={{ headerShown: false }} />
          <Stack.Screen
            name="order-summary"
            options={{ headerShown: false, presentation: "modal" }}
          />
          <Stack.Screen
            name="payment-failed"
            options={{ headerShown: false }}
          />
          <Stack.Screen name="ETA" options={{ headerShown: false }} />
          <Stack.Screen name="payment/otp" options={{ headerShown: false }} />
          <Stack.Screen
            name="payment/success"
            options={{ headerShown: false }}
          />
          <Stack.Screen name="complete" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="address"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="notification-debug"
            options={{ headerShown: false, presentation: "modal" }}
          />
        </Stack>
      </AuthGuard>
    </AuthProvider>
  );
}
