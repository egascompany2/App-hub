import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { z } from "zod";
import { authService } from "@/services/auth";

const phoneSchema = z
  .string()
  .regex(/^\+234[0-9]{10}$/, "Invalid Nigerian phone number");

export default function PhoneNumberScreen() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    try {
      setError("");
      setLoading(true);

      // Ensure phone number is formatted properly
      const formattedPhone = phoneNumber.startsWith("+234")
        ? phoneNumber
        : `+234${phoneNumber.replace(/^0+/, "")}`;

      phoneSchema.parse(formattedPhone);

      await authService.requestOTP(formattedPhone);

      router.push({
        pathname: "/(auth)/otp",
        params: { phoneNumber: formattedPhone },
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
      } else if (err instanceof Error) {
        Alert.alert("Error", err.message);
      } else {
        Alert.alert("Error", "An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.content}>
        <Text style={styles.title}>Enter your mobile number</Text>

        <View style={styles.inputContainer}>
          <View style={styles.countryFlag}>
            <Image source={require("@/assets/images/flag.png")} />
          </View>

          <View style={styles.phoneInputWrapper}>
            <Text style={styles.countryCode}>+234</Text>
            <TextInput
              style={[styles.phoneInput, error ? styles.inputError : null]}
              placeholder="Mobile number"
              placeholderTextColor="#666"
              keyboardType="phone-pad"
              value={phoneNumber}
              onChangeText={(text) => {
                setPhoneNumber(text.replace(/[^0-9]/g, ""));
                setError("");
              }}
              maxLength={15}
            />
          </View>
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.continueButton]}
          onPress={handleContinue}
          disabled={!phoneNumber.trim() || loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.buttonText}>Continue</Text>
          )}
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.line} />
          <Text style={styles.orText}>OR</Text>
          <View style={styles.line} />
        </View>

        <Text style={styles.disclaimer}>
          By proceeding, you consent to receive calls, WhatsApp, or SMS messages,
          including automated ones, from Egas and its affiliates at the provided number.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 40,
  },
  content: {
    flex: 1,
    padding: 20,
    position: "relative",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: "row",
    gap: 12,
    overflow: "hidden",
  },
  countryFlag: {
    width: 60,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  phoneInputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 12,
  },
  countryCode: {
    fontSize: 16,
    marginRight: 8,
    color: "#000",
  },
  phoneInput: {
    flex: 1,
    fontSize: 16,
    color: "#000",
    padding: 16,
  },
  continueButton: {
    backgroundColor: "#000",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 28,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  disclaimer: {
    position: "absolute",
    bottom: 40,
    left: 5,
    right: 5,
    marginHorizontal: "auto",
    textAlign: "center",
    color: "#888888",
    fontWeight: "700",
    fontSize: 14,
    lineHeight: 20,
  },
  inputError: {
    borderColor: "red",
    borderWidth: 1,
  },
  errorText: {
    color: "red",
    fontSize: 14,
    marginTop: -16,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 28,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#A4A4A4",
  },
  orText: {
    color: "#666",
    fontSize: 14,
    marginHorizontal: 12,
    fontWeight: "600",
  },
});

