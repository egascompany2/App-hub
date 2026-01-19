import { useOnboardingStore } from "@/store/onboardingStore";
import React, { useRef, useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Platform,
} from "react-native";
import { StepIndicator } from "./StepIndicator";
import { commonStyles } from "./styles";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { GOOGLE_MAPS_API_KEY } from "@/config/index";

const OnboardingStep3 = () => {
  const { city, setDeliveryInfo, errors } = useOnboardingStore();
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [addressQuery, setAddressQuery] = useState<string>("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const addressRef = useRef<TextInput>(null);

  const fetchGoogleSuggestions = async (query: string) => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await axios.get(
        "https://maps.googleapis.com/maps/api/place/autocomplete/json",
        {
          params: {
            input: query,
            key: GOOGLE_MAPS_API_KEY,
            types: "address",
          },
        }
      );

      console.log("Google suggestions:", response.data.predictions);
      setSuggestions(response.data.predictions || []);
    } catch (error) {
      console.error("Google Autocomplete error:", error);
      setSuggestions([]);
    }
  };

  const handleSelectSuggestion = async (place: any) => {
    try {
      const placeId = place.place_id;
      const detailResponse = await axios.get(
        "https://maps.googleapis.com/maps/api/place/details/json",
        {
          params: {
            place_id: placeId,
            key: GOOGLE_MAPS_API_KEY,
          },
        }
      );

      const result = detailResponse.data.result;
      const placeName = result.formatted_address;
      const coordinates = result.geometry.location;
      const selectedCity =
        result.address_components.find((comp: any) =>
          comp.types.includes("locality")
        )?.long_name || city;

      setDeliveryInfo(
        placeName,
        "",
        selectedCity,
        coordinates.lat,
        coordinates.lng
      );
      setAddressQuery(placeName);
      setSuggestions([]);

      console.log("Selected address:", {
        placeName,
        selectedCity,
        lat: coordinates.lat,
        lng: coordinates.lng,
      });
    } catch (error) {
      console.error("Google Place Details error:", error);
    }
  };

  return (
    <SafeAreaView style={commonStyles.container}>
      <View style={commonStyles.content}>
        <Text style={commonStyles.title}>Location</Text>
        <Text style={commonStyles.subtitle}>
          Please enter the address for your egas delivery (optional)
        </Text>

        <View style={commonStyles.inputGroup}>
          <Text style={commonStyles.label}>Street Address</Text>
          <View style={styles.addressInputContainer}>
            <TextInput
              ref={addressRef}
              style={[
                commonStyles.input,
                errors.streetAddress && commonStyles.inputError,
                focusedInput === "address"
                  ? commonStyles.inputFocused
                  : commonStyles.inputInactive,
                Platform.OS !== "web" && { paddingVertical: 12 },
              ]}
              placeholder="Enter your street address"
              placeholderTextColor="#666666"
              value={addressQuery}
              onChangeText={(text) => {
                setAddressQuery(text);
                fetchGoogleSuggestions(text);
              }}
              onFocus={() => setFocusedInput("address")}
              onBlur={() => setTimeout(() => setSuggestions([]), 200)}
            />
            {focusedInput === "address" && addressQuery.length > 0 && (
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => {
                  setAddressQuery("");
                  setSuggestions([]);
                  setDeliveryInfo("", "", city, null, null);
                }}
              >
                <Ionicons name="close" size={24} color="#000000" />
              </TouchableOpacity>
            )}
            {suggestions.length > 0 && (
              <View
                style={[
                  styles.suggestionList,
                  Platform.OS !== "web" && { elevation: 5, zIndex: 5 },
                ]}
              >
                {suggestions.map((item) => (
                  <TouchableOpacity
                    key={item.place_id}
                    style={styles.suggestionItem}
                    onPress={() => handleSelectSuggestion(item)}
                  >
                    <Text style={styles.suggestionText}>
                      {item.description}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
          <Text style={styles.nearestLandmassText}>
            (If your address is not available please use nearest landmass)
          </Text>
          {errors.streetAddress && (
            <Text style={styles.errorText}>{errors.streetAddress}</Text>
          )}
        </View>

        <View style={commonStyles.inputGroup}>
          <Text style={commonStyles.label}>City</Text>
          <TouchableOpacity
            style={[
              commonStyles.input,
              errors.city ? commonStyles.inputError : null,
              focusedInput === "city"
                ? commonStyles.inputFocused
                : commonStyles.inputInactive,
            ]}
            onFocus={() => setFocusedInput("city")}
            onBlur={() => setFocusedInput(null)}
          >
            <Text style={city ? styles.selectedText : styles.placeholderText}>
              {city || "Select City"}
            </Text>
          </TouchableOpacity>
          {errors.city && <Text style={styles.errorText}>{errors.city}</Text>}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  placeholderText: {
    color: "#666666",
  },
  selectedText: {
    color: "#000000",
  },
  addressInputContainer: {
    position: "relative",
    zIndex: 1,
  },
  closeButton: {
    position: "absolute",
    right: 5,
    top: Platform.OS === "ios" ? 10 : 8,
  },
  errorText: {
    color: "#FF0000",
    fontSize: 12,
    marginTop: 5,
  },
  nearestLandmassText: {
    color: "#666666",
    fontSize: 12,
    fontWeight: "700",
    textDecorationLine: "underline",
  },
  suggestionList: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    backgroundColor: "white",
    borderRadius: 5,
    maxHeight: 200,
    overflow: "scroll",
    zIndex: 1000,
    elevation: 10,
  },
  suggestionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#c8c7cc",
  },
  suggestionText: {
    color: "#000000",
    fontSize: 14,
  },
});

export default OnboardingStep3;
