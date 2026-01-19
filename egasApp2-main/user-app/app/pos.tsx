import React, { useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  Pressable,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useOrderStore } from "@/store/orderStore";
import { getTankSizePrice } from "@/utils/tankSize";
import { useOnboardingStore } from "@/store/onboardingStore";
import { useAuth } from "@/contexts/AuthContext";

const PosScreen = () => {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const { createOrder, fetchOrderHistory, isLoading } = useOrderStore();
  const { tankSizes } = useOnboardingStore();
  const amount = getTankSizePrice(tankSizes, user?.tankSize);

  useEffect(() => {
    refreshUser();
  }, []);

  const handleConfirm = async () => {

    if (!user?.tankSize || !user.address || !amount) {
      return
    }

    try {
      await createOrder({
        tankSize: user?.tankSize || "",
        deliveryAddress: user?.address || "",
        paymentMethod: "POS",
        amount: amount,
        deliveryLatitude: user?.latitude || 0,
        deliveryLongitude: user?.longitude || 0,
        notes: "Payment made with POS",
      });
      await fetchOrderHistory();
      router.push("/ETA");
    } catch (error) {
      console.log(error);
      Alert.alert("Failed to create order");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="close" color="#000000" size={36} />
        </Pressable>
        <Text style={styles.headerTitle}>Pay with Pos</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.message}>
          A rider will bring a pos device to you to make payment
        </Text>

        <View style={styles.amountContainer}>
          <Text style={styles.label}>Amount</Text>
          <Text style={styles.amount}>₦{amount.toLocaleString()}</Text>
        </View>

        <TouchableOpacity
          style={[styles.confirmButton, isLoading && styles.disabledButton]}
          onPress={handleConfirm}
          disabled={isLoading}
        >
          <Text style={styles.confirmButtonText}>
            {isLoading ? <ActivityIndicator color="#fff" /> : "Confirm"}
          </Text>
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
    fontSize: 18,
    fontWeight: "800",
    color: "#000000",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  message: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 40,
    lineHeight: 32,
  },
  amountContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  label: {
    fontSize: 18,
    color: "#000000",
    fontWeight: "700",
  },
  amount: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000000",
  },
  confirmButton: {
    backgroundColor: "#000000",
    padding: 16,
    alignItems: "center",
    marginTop: 80,
  },
  confirmButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "700",
  },
  disabledButton: {
    backgroundColor: "#666",
  },
});

export default PosScreen;
