import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useProfile } from "../../hooks/useProfile";
import { useAuth } from "@/context/AuthContext";
import { useDeleteAccount } from "../../hooks/useDriver";

export default function AccountScreen() {
  const { logout } = useAuth();
  const router = useRouter();
  const { data: profile, isLoading, error, refetch } = useProfile();
  const deleteAccountMutation = useDeleteAccount();
  // const { mutate: updateAvailability } = useUpdateAvailability();

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0066CC" />
      </View>
    );
  }

  // if (error || !profile) {
  //   return (
  //     <View style={styles.centered}>
  //       <Text>Failed to load profile</Text>
  //       <TouchableOpacity onPress={() => refetch()}>
  //         <Text>Retry</Text>
  //       </TouchableOpacity>
  //     </View>
  //   );
  // }

  const onRefresh = async () => {
    await refetch();
  };

  const handleSignOut = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: async () => {
            try {
              await logout();
              // The router.replace is handled in the AuthContext logout function
            } catch (error) {
              console.error("Sign out error:", error);
              Alert.alert(
                "Error",
                "Failed to sign out properly. Please try again."
              );
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteAccountMutation.mutateAsync();
              await logout();
              // The router.replace is handled in the AuthContext logout function
            } catch (error) {
              console.error("Delete account error:", error);
              Alert.alert(
                "Error",
                "Failed to delete account. Please try again."
              );
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>e-gas Account</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={onRefresh} />
        }
      >
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Account Info</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>First Name</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.input}>
                {profile?.profile?.user?.firstName}
              </Text>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Last Name</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.input}>
                {profile?.profile?.user?.lastName}
              </Text>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.input}>{profile?.profile?.user?.email}</Text>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.input}>
                {profile?.profile?.user?.phoneNumber}
              </Text>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Vehicle Type</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.input}>
                {profile?.profile?.vehicleType || "N/A"}
              </Text>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Vehicle Plate</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.input}>
                {profile?.profile?.vehiclePlate || "N/A"}
              </Text>
            </View>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity onPress={handleSignOut} disabled={deleteAccountMutation.isPending}>
              <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDeleteAccount} disabled={deleteAccountMutation.isPending} style={{ marginTop: 16 }}>
              {deleteAccountMutation.isPending ? (
                <ActivityIndicator size="small" color="#FF0000" />
              ) : (
                <Text style={[styles.signOutText, { color: "#FF0000" }]}>Delete Account</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingVertical: 40,
    paddingHorizontal: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
    gap: 16,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  footer: {
    marginTop: "auto",
    gap: 16,
  },
  signOutText: {
    color: "#FF0000",
    fontSize: 16,
    fontWeight: "500",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
});
