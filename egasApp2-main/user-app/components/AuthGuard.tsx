import { useEffect } from "react";
import { useRouter, useSegments } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { View, ActivityIndicator } from "react-native";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";
    const inOnboarding = segments[1] === "onboarding";

    if (!isAuthenticated && !inAuthGroup) {
      router.replace("/(auth)/phoneNumber");
      return;
    }

    if (isAuthenticated && !user?.onboarded && !inOnboarding) {
      router.replace("/(auth)/onboarding");
      return;
    }

    if (isAuthenticated && user?.onboarded && inAuthGroup) {
      router.replace("/(tabs)/home");
    }

    if (isAuthenticated && user?.onboarded && inOnboarding) {
      router.replace("/(tabs)/home");
    }

  }, [isAuthenticated, isLoading, segments, user?.onboarded]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <>{children}</>;
} 