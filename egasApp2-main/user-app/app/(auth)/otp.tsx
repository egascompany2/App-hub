import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  ActivityIndicator,
  Keyboard,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { authService } from "@/services/auth";
import { useAuth } from "@/contexts/AuthContext";
import { tokenService } from "@/services/token";
import { AuthResponse } from "@/types/auth";

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 30;

export default function OptScreen() {
  const { phoneNumber } = useLocalSearchParams<{ phoneNumber: string }>();
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(RESEND_COOLDOWN);
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const { signIn } = useAuth();

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  useEffect(() => {
    if (isOtpComplete() && !loading) {
      handleVerifyOTP();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp]);

  const handleOtpChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    setError(null);
    if (text && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
    // Auto-submit when all digits are filled
    if (text && index === OTP_LENGTH - 1 && newOtp.every(digit => digit !== "")) {
      handleVerifyOTP();
    }
  };

  const handleKeyPress = (e: NativeSyntheticEvent<TextInputKeyPressEventData>, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async () => {
    try {
      if (!phoneNumber || !isOtpComplete()) return;
      setLoading(true);
      setError(null);
      const otpString = otp.join("");
      
      const axiosResponse = await authService.verifyOTP(phoneNumber, otpString);

      // Extract the data to match AuthResponse type
      const response: AuthResponse = {
        success: axiosResponse.data.status === "success",
        message: axiosResponse.data.message,
        data: {
          user: axiosResponse.data.data.user,
          accessToken: axiosResponse.data.data.accessToken,
          refreshToken: axiosResponse.data.data.refreshToken,
        },
      };

      // Update auth state and local storage
      await signIn(response);

      // Check onboarded status from local storage
      const tokens = await tokenService.getTokens();
      const isOnboarded = tokens?.user?.onboarded || false;

      if (isOnboarded) {
        router.replace("/(tabs)/home");
      } else {
        router.replace("/(auth)/onboarding");
      }
    } catch (error: any) {
      console.error("Verify OTP error:", error);
      // Handle specific error cases
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else if (error.response?.status === 400) {
        setError("Invalid verification code. Please try again.");
      } else if (error.response?.status === 404) {
        setError("Phone number not found. Please request a new code.");
      } else if (error.response?.status === 429) {
        setError("Too many attempts. Please wait a moment and try again.");
      } else {
        setError("Unable to verify code. Please try again.");
      }
      setOtp(Array(OTP_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!phoneNumber || countdown > 0) return;
    try {
      setLoading(true);
      setError(null);
      await authService.requestOTP(phoneNumber);
      setCountdown(RESEND_COOLDOWN);
      // Show success message for resend
      setError("New verification code sent successfully!");
    } catch (error: any) {
      console.error("Resend OTP error:", error);
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else if (error.response?.status === 429) {
        setError("Please wait before requesting another code.");
      } else if (error.response?.status === 400) {
        setError("Invalid phone number. Please go back and try again.");
      } else {
        setError("Couldn't send new code. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  const isOtpComplete = () => otp.every(digit => digit !== "");

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.content}>
        <Text style={styles.title}>
          Enter the 6-digit code sent to {"\n"}
          {phoneNumber}
        </Text>

        <View style={styles.otpContainer}>
          {Array(OTP_LENGTH).fill(0).map((_, index) => (
            <TextInput
              key={index}
              ref={ref => (inputRefs.current[index] = ref)}
              style={[styles.otpInput, otp[index] ? styles.filledInput : null]}
              maxLength={1}
              keyboardType="number-pad"
              value={otp[index]}
              onChangeText={text => handleOtpChange(text, index)}
              onKeyPress={e => handleKeyPress(e, index)}
              placeholder="-"
              placeholderTextColor="#999"
            />
          ))}
        </View>

        {error && <Text style={styles.errorText}>{error}</Text>}

        <Text style={styles.tip}>Check your message inbox</Text>

        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>Didn't receive OTP?</Text>
          <TouchableOpacity
            onPress={handleResendOTP}
            disabled={countdown > 0 || loading}
          >
            <Text style={styles.resendButton}>
              {countdown > 0 ? `${countdown}s` : "Resend"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Loading overlay */}
        {loading && (
          <View style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(255,255,255,0.7)',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10,
          }}>
            <ActivityIndicator size="large" color="#000" />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60, backgroundColor: "#FFFFFF" },
  content: { flex: 1, paddingHorizontal: 24 },
  title: { fontSize: 20, lineHeight: 30, fontWeight: "600", marginBottom: 32, color: "#000" },
  tip: { fontSize: 16, color: "#888", fontWeight: "500", marginBottom: 40 },
  otpContainer: { flexDirection: "row", justifyContent: "space-between", marginBottom: 40 },
  otpInput: { width: 52, height: 52, borderWidth: 1, borderColor: "#E5E5E5", borderRadius: 12, textAlign: "center", fontSize: 24, backgroundColor: "#E8E8E8", color: "#000" },
  filledInput: { backgroundColor: "#F5F5F5" },
  resendContainer: { flexDirection: "row", alignItems: "center", marginTop: 20 },
  resendText: { color: "#888", fontSize: 16, fontWeight: "500" },
  resendButton: { color: "#000", fontSize: 16, fontWeight: "700", marginLeft: 8 },
  nextButton: { position: "absolute", bottom: 40, right: 24, flexDirection: "row", alignItems: "center", backgroundColor: "#EEE", paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24 },
  nextButtonText: { fontSize: 18, fontWeight: "700", color: "#7F7F7F", marginRight: 8 },
  activeNextButtonText: { color: "#000" },
  disabledButton: { opacity: 0.5 },
  errorText: { 
    color: "#FF3B30", 
    fontSize: 14, 
    marginTop: -32, 
    marginBottom: 32, 
    textAlign: "center",
    paddingHorizontal: 20,
    lineHeight: 20
  },
});