import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import { useAuthStore } from "@/store/authStore";
import { authService } from "@/services/auth";
import { useOnboardingStore } from "@/store/onboardingStore";
import { Picker } from "@react-native-picker/picker";
import { useAuth } from "@/contexts/AuthContext";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AccountScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { user, signOut, refreshUser } = useAuth();
  const [isEditingFirstName, setIsEditingFirstName] = useState(false);
  const [isEditingLastName, setIsEditingLastName] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [tempFirstName, setTempFirstName] = useState(user?.firstName || "John");
  const [tempLastName, setTempLastName] = useState(user?.lastName || "Doe");
  const [tempAddress, setTempAddress] = useState(
    user?.address || "mn 1, egas estate, Ipaja, Lagos"
  );
  const [tempTankSize, setTempTankSize] = useState(user?.tankSize || "10kg");
  const [tempEmail, setTempEmail] = useState(user?.email || "");
  const { tankSizes, fetchTankSizes } = useOnboardingStore();
  const [isEditingTankSize, setIsEditingTankSize] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchTankSizes();
    refreshUser();
  }, []);

  useFocusEffect(
    useCallback(() => {
      refreshUser();
    }, [])
  );

  const handleSignOut = async () => {
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
              setLoading(true);
              await signOut();
              router.replace("/(auth)/phoneNumber");
            } catch (error) {
              Alert.alert("Error", "Failed to sign out. Please try again.");
            } finally {
              setLoading(false);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleSaveField = async (
    field: "firstName" | "lastName" | "email" | "address"
  ) => {
    try {
      const trimmedValue = (
        field === "firstName"
          ? tempFirstName
          : field === "lastName"
          ? tempLastName
          : field === "email"
          ? tempEmail
          : tempAddress
      ).trim();

      if (!trimmedValue) {
        Alert.alert("Error", `${field} cannot be empty`);
        return;
      }

      if (field === "email") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trimmedValue)) {
          Alert.alert("Error", "Please enter a valid email address");
          return;
        }
      }

      setLoading(true);

      const updatedData = {
        [field]: trimmedValue,
        latitude: user?.latitude || 0,
        longitude: user?.longitude || 0,
      };

      const response = await authService.updateUserProfile(updatedData);

      if (response.success) {
        useAuthStore.setState((state: any) => ({
          ...state,
          user: { ...state.user!, ...response.data.user },
        }));

        switch (field) {
          case "firstName":
            setIsEditingFirstName(false);
            Alert.alert("Success", "First name updated successfully");
            break;
          case "lastName":
            setIsEditingLastName(false);
            Alert.alert("Success", "Last name updated successfully");
            break;
          case "email":
            setIsEditingEmail(false);
            Alert.alert("Success", "Email updated successfully");
            break;
          case "address":
            setIsEditingAddress(false);
            Alert.alert("Success", "Address updated successfully");
            break;
        }
      }
    } catch (error) {
      console.error("Update error:", error);
      Alert.alert("Failed to update profile information. Please try again.");

      switch (field) {
        case "firstName":
          setTempFirstName(user?.firstName || "");
          break;
        case "lastName":
          setTempLastName(user?.lastName || "");
          break;
        case "email":
          setTempEmail(user?.email || "");
          break;
        case "address":
          setTempAddress(user?.address || "");
          break;
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTankSize = async () => {
    try {
      setLoading(true);
      const response = await authService.updateUserProfile({
        tankSize: tempTankSize,
        latitude: user?.latitude || 0,
        longitude: user?.longitude || 0,
      });

      if (response.success) {
        useAuthStore.setState((state: any) => ({
          ...state,
          user: { ...state.user!, ...response.data.user },
          tankSize: tempTankSize,
        }));
        setIsEditingTankSize(false);
        Alert.alert("Success", `Tank size updated to ${tempTankSize}`);
      }
    } catch (error) {
      console.error("Update error:", error);
      Alert.alert("Error", "Failed to update tank size. Please try again.");
      setTempTankSize(user?.tankSize || "");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
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
              setDeleting(true);
              await authService.deleteAccount();
              await signOut();
              router.replace("/(auth)/phoneNumber");
            } catch (error) {
              Alert.alert("Error", "Failed to delete account. Please try again.");
            } finally {
              setDeleting(false);
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
          <Ionicons name="close" size={36} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>e-gas Account</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Account Info</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>First Name</Text>
            <View style={styles.inputContainer}>
              {isEditingFirstName ? (
                <>
                  <TextInput
                    style={styles.input}
                    value={tempFirstName}
                    onChangeText={setTempFirstName}
                    autoFocus
                  />
                  <TouchableOpacity
                    onPress={() => handleSaveField("firstName")}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator size="small" color="#22C55E" />
                    ) : (
                      <Ionicons name="checkmark" size={20} color="#22C55E" />
                    )}
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text style={styles.input}>{tempFirstName}</Text>
                  <TouchableOpacity onPress={() => setIsEditingFirstName(true)}>
                    <Ionicons name="pencil" size={20} color="#666" />
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Last Name</Text>
            <View style={styles.inputContainer}>
              {isEditingLastName ? (
                <>
                  <TextInput
                    style={styles.input}
                    value={tempLastName}
                    onChangeText={setTempLastName}
                    autoFocus
                  />
                  <TouchableOpacity
                    onPress={() => {
                      handleSaveField("lastName");
                      setIsEditingLastName(false);
                    }}
                  >
                    <Ionicons name="checkmark" size={20} color="#22C55E" />
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text style={styles.input}>{tempLastName}</Text>
                  <TouchableOpacity onPress={() => setIsEditingLastName(true)}>
                    <Ionicons name="pencil" size={20} color="#666" />
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputContainer}>
              {isEditingEmail ? (
                <>
                  <TextInput
                    style={styles.input}
                    value={tempEmail}
                    onChangeText={setTempEmail}
                    autoFocus
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    onPress={() => handleSaveField("email")}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator size="small" color="#22C55E" />
                    ) : (
                      <Ionicons name="checkmark" size={20} color="#22C55E" />
                    )}
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text style={styles.input}>{tempEmail || "Add email"}</Text>
                  <TouchableOpacity onPress={() => setIsEditingEmail(true)}>
                    <Ionicons name="pencil" size={20} color="#666" />
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Address</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.input}>{user?.address}</Text>
              <TouchableOpacity onPress={() => router.push("/address")}>
                <Ionicons name="pencil" size={20} color="#666" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.input}>{user?.phoneNumber}</Text>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>e-gas Tank size</Text>
            <View style={styles.inputContainer}>
              {isEditingTankSize ? (
                <>
                  <Picker
                    selectedValue={tempTankSize}
                    style={[styles.input, { marginLeft: -10 }]}
                    onValueChange={setTempTankSize}
                  >
                    {tankSizes.map(size => (
                      <Picker.Item
                        key={size.id}
                        label={size.size}
                        value={size.size}
                      />
                    ))}
                  </Picker>
                  <TouchableOpacity
                    onPress={handleSaveTankSize}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator size="small" color="#22C55E" />
                    ) : (
                      <Ionicons name="checkmark" size={20} color="#22C55E" />
                    )}
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text style={styles.input}>{tempTankSize}</Text>
                  {/* <TouchableOpacity onPress={() => setIsEditingTankSize(true)}>
                    <Ionicons name="pencil" size={20} color="#666" />
                  </TouchableOpacity> */}
                </>
              )}
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.footer}>
            <TouchableOpacity onPress={handleSignOut} disabled={loading || deleting} style={{ marginBottom: 24 }}>
              <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
            <Text style={styles.sectionTitle}>Other options</Text>
            <TouchableOpacity onPress={() => router.push('/support')} style={{ marginBottom: 16 }}>
              <Text style={[styles.signOutText, { color: '#276EF1' }]}>Contact Support</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDeleteAccount} disabled={loading || deleting}>
              {deleting ? (
                <ActivityIndicator size="small" color="#FF0000" />
              ) : (
                <Text style={styles.deleteAccountText}>Delete Account</Text>
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
    paddingTop: 19,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
    gap: 15,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#000000",
  },
  content: {
    flex: 1,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 2,
  },
  inputGroup: {
    marginBottom: 23,
  },
  label: {
    fontSize: 15,
    marginBottom: 8,
    fontWeight: "500",
    color: "#000000",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 11,
    borderWidth: 3,
    borderColor: "#276EF1",
    backgroundColor: "#e8e8e8",
    borderRadius: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
  },
  footer: {
    marginTop: 1,
  },
  signOutText: {
    color: "#22C55E",
    fontSize: 15,
    fontWeight: "500",
  },
  cancelButton: {
    padding: 8,
  },
  divider: {
    height: 1,
    backgroundColor: "#E0E0E0",
  },
  deleteAccountText: {
    color: '#FF0000',
    fontSize: 12,
    fontWeight: '400',
    opacity: 0.7,
    textAlign: 'center',
    marginTop: 4,
},
});
