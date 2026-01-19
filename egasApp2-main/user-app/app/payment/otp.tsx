import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Pressable,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { paymentService } from "@/services/payment";
import { useAuthStore } from "@/store/authStore";
import { useOrderStore } from "@/store/orderStore";

const OtpScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [otp, setOtp] = useState("");
  const [processing, setProcessing] = useState(false);

  const handleVerifyOtp = async () => {
    try {
      setProcessing(true);

      if (!otp) {
        Alert.alert("Error", "Please enter OTP");
        return;
      }

      const response = await paymentService.authenticateOtp(
        params.paymentId as string,
        params.transactionRef as string,
        otp
      );

      if (response.success) {
        const user = useAuthStore.getState().user;

        try {
          await useOrderStore.getState().createOrder({
            tankSize: user?.tankSize || "",
            deliveryAddress: user?.address || "",
            paymentMethod: "CARD",
            amount: Number(params.amount),
            deliveryLatitude: 6.6018,
            deliveryLongitude: 3.3515,
          });

          router.replace("/payment/success");
        } catch (error) {
          Alert.alert("Error", "Failed to create order");
        }
      }
    } catch (error) {
      Alert.alert(
        "Verification Failed",
        error instanceof Error
          ? error.message
          : "An error occurred while verifying OTP"
      );
    } finally {
      setProcessing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="close" color="#000000" size={36} />
        </Pressable>
        <Text style={styles.headerTitle}>Enter OTP</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.description}>
          Please enter the OTP sent to your phone number or email
        </Text>

        <View style={styles.inputGroup}>
          <TextInput
            style={styles.input}
            placeholder="Enter OTP"
            value={otp}
            onChangeText={setOtp}
            keyboardType="numeric"
            maxLength={6}
          />
        </View>

        <TouchableOpacity
          style={[styles.verifyButton, processing && styles.disabledButton]}
          onPress={handleVerifyOtp}
          disabled={processing}
        >
          {processing ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.verifyButtonText}>Verify OTP</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingTop: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    gap: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000000",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  description: {
    fontSize: 16,
    color: "#666666",
    marginBottom: 24,
    textAlign: "center",
  },
  inputGroup: {
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  verifyButton: {
    backgroundColor: "#000",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  disabledButton: {
    opacity: 0.7,
  },
  verifyButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default OtpScreen;
