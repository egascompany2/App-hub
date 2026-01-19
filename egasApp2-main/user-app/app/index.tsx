import { Redirect } from "expo-router";
import { useAuthStore } from "@/store/authStore";
import { UserRole } from "@/types/auth";
import { useAuth } from "@/contexts/AuthContext";
import { ActivityIndicator, StyleSheet, View } from "react-native";

export default function Home() {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );  
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/phoneNumber" />;
  }

  if (user?.role !== UserRole.CLIENT) {
    return <Redirect href="/(auth)/phoneNumber" />;
  }

  if (!user.onboarded) {
    return <Redirect href="/(auth)/onboarding" />;
  }

  return <Redirect href="/(tabs)/home" />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
