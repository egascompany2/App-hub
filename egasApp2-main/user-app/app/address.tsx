import React, { useEffect, useRef } from "react";
import "react-native-get-random-values";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { commonStyles } from "@/components/onboarding/styles";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { authService } from "@/services/auth";
import { GOOGLE_MAPS_API_KEY } from "@/config/index";

const AddressScreen = () => {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [focusedInput, setFocusedInput] = React.useState<string | null>(null);
  const addressRef = useRef<any>(null);
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [isMounted, setIsMounted] = React.useState(false);
  const [selectedAddress, setSelectedAddress] = React.useState<{
    address: string;
    latitude: number;
    longitude: number;
  } | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  const handleUpdateAddress = async () => {
    if (!selectedAddress) {
      Alert.alert("Error", "Please select an address first");
      return;
    }

    try {
      setIsUpdating(true);
      const response = await authService.updateUserProfile({
        address: selectedAddress.address,
        latitude: selectedAddress.latitude,
        longitude: selectedAddress.longitude,
      });

      if (response.success) {
        await refreshUser();
        Alert.alert("Success", "Address updated successfully", [
          { text: "OK", onPress: () => router.back() },
        ]);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to update address");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <SafeAreaView style={commonStyles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Update Address</Text>
      </View>

      <View style={commonStyles.content}>
        <View style={commonStyles.inputGroup}>
          <Text style={commonStyles.label}>Street Address</Text>
          <View style={styles.addressInputContainer}>
            <GooglePlacesAutocomplete
              ref={addressRef}
              placeholder="Enter your street address"
              onPress={(data, details = null) => {
                setFocusedInput(null);
                if (details) {
                  setSelectedAddress({
                    address: details.formatted_address,
                    latitude: details.geometry.location.lat,
                    longitude: details.geometry.location.lng,
                  });
                }
              }}
              query={{
                key: GOOGLE_MAPS_API_KEY,
                language: "en",
                components: "country:ng",
              }}
              fetchDetails={true}
              styles={{
                container: {
                  flex: 0,
                },
                textInput: {
                  ...commonStyles.input,
                  ...(focusedInput === "address"
                    ? commonStyles.inputFocused
                    : commonStyles.inputInactive),
                },
                listView: {
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  right: 0,
                  backgroundColor: "white",
                  zIndex: 1000,
                  elevation: 10,
                },
              }}
              textInputProps={{
                placeholderTextColor: "#666666",
                onFocus: () => setFocusedInput("address"),
                onBlur: () => setFocusedInput(null),
              }}
              onFail={(error) => console.error(error)}
              enablePoweredByContainer={false}
              minLength={3}
              debounce={300}
              listEmptyComponent={<View />}
              keyboardShouldPersistTaps="handled"
            />
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.updateButton,
            (!selectedAddress || isUpdating) && styles.disabledButton,
          ]}
          onPress={handleUpdateAddress}
          disabled={!selectedAddress || isUpdating}
        >
          {isUpdating ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.updateButtonText}>Update Address</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  addressInputContainer: {
    position: "relative",
    zIndex: 1,
  },
  updateButton: {
    backgroundColor: "#000",
    padding: 16,
    borderRadius: 8,
    marginTop: "auto",
    marginBottom: 20,
  },
  updateButtonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },
  disabledButton: {
    opacity: 0.5,
  },
});

export default AddressScreen;
