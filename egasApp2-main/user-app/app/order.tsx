import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useOnboardingStore } from "@/store/onboardingStore";
import { getTankSizePrice } from "@/utils/tankSize";
import { useAuth } from "@/contexts/AuthContext";
import { orderService, type Order } from "@/services/order";

const OrderScreen = () => {
  const router = useRouter();
  const { user, refreshUser, isLoading } = useAuth();
  const { tankSizes, fetchTankSizes } = useOnboardingStore();
  const [selectedPayment, setSelectedPayment] = useState<string>("pos");
  const [hasActiveOrders, setHasActiveOrders] = useState(false);
  const [canUsePOS, setCanUsePOS] = useState(true);
  const [isCheckingRestrictions, setIsCheckingRestrictions] = useState(true);
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);

  useEffect(() => {
    fetchTankSizes();
    refreshUser();
    checkOrderRestrictions();
  }, []);

  const checkOrderRestrictions = async () => {
    try {
      setIsCheckingRestrictions(true);
      
      // Check for active orders
      const activeOrdersResponse = await orderService.getActiveOrders();
      setHasActiveOrders(activeOrdersResponse.hasActiveOrders);
      setActiveOrders(activeOrdersResponse.activeOrders || []);

      // Check POS payment eligibility
      const posEligibilityResponse = await orderService.checkPOSPaymentEligibility();
      setCanUsePOS(posEligibilityResponse.canUsePOS);

      // If user can't use POS, default to card payment
      if (!posEligibilityResponse.canUsePOS && selectedPayment === "pos") {
        setSelectedPayment("card");
      }
    } catch (error) {
      console.error("Error checking order restrictions:", error);
      // If there's an error, allow the user to proceed but show a warning
    } finally {
      setIsCheckingRestrictions(false);
    }
  };

  const amount = getTankSizePrice(tankSizes, user?.tankSize);

  const paymentMethods = [
    {
      id: "card",
      label: "Pay online",
      icon: require("@/assets/images/card.png"),
      disabled: false,
    },
    {
      id: "pos",
      label: "POS Payment",
      icon: require("@/assets/images/card-pos.png"),
      disabled: !canUsePOS,
    },
  ];

  const handleConfirm = () => {
    if (hasActiveOrders) {
      Alert.alert(
        "Active Order Exists",
        "You already have an active order. Please complete or cancel your current order before placing a new one.",
        [
          {
            text: "View Orders",
            onPress: () => router.push("/history"),
          },
          {
            text: "Cancel",
            style: "cancel",
          },
        ]
      );
      return;
    }

    if (selectedPayment === "pos") {
      if (!canUsePOS) {
        Alert.alert(
          "POS Payment Not Available",
          "POS payment is not available. You need to complete a successful POS payment first, or you have failed POS payments in the last 30 days.",
          [
            {
              text: "Use Card Payment",
              onPress: () => setSelectedPayment("card"),
            },
            {
              text: "Cancel",
              style: "cancel",
            },
          ]
        );
        return;
      }
      router.push("/pos");
    } else if (selectedPayment === "card") {
      router.push("/payonline");
    } else {
      router.push("/ETA");
    }
  };

  const handlePaymentMethodSelect = (methodId: string) => {
    if (methodId === "pos" && !canUsePOS) {
      Alert.alert(
        "POS Payment Not Available",
        "POS payment is not available. You need to complete a successful POS payment first, or you have failed POS payments in the last 30 days."
      );
      return;
    }
    setSelectedPayment(methodId);
  };

  if (isCheckingRestrictions) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000000" />
          <Text style={styles.loadingText}>Checking order restrictions...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="close" color="#000000" size={36} />
        </Pressable>
        <Text style={styles.headerTitle}>Your order</Text>
      </View>

      {hasActiveOrders && (
        <View style={styles.warningContainer}>
          <Ionicons name="warning" size={20} color="#FF6B35" />
          <Text style={styles.warningText}>
            You have an active order. Please complete it before placing a new one.
          </Text>
        </View>
      )}

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.locationContainer}>
          <Ionicons name="location" size={24} color="#000000" />
          <View style={styles.locationText}>
            <Text style={styles.address}>{user?.address}</Text>
            <Text style={styles.subText}>
              {user?.firstName} {user?.lastName}
            </Text>
          </View>
        </View>

        <View style={styles.amountContainer}>
          <Text style={styles.label}>Amount</Text>
          {isLoading ? (
            <ActivityIndicator size="small" color="#000000" />
          ) : (
            <Text style={styles.amount}>₦{amount.toLocaleString()}</Text>
          )}
        </View>

        <View style={styles.paymentMethods}>
          {paymentMethods.map(method => (
            <Pressable
              key={method.id}
              style={[
                styles.paymentOption,
                method.disabled && styles.paymentOptionDisabled
              ]}
              onPress={() => handlePaymentMethodSelect(method.id)}
              disabled={method.disabled}
            >
              <View style={styles.paymentLeft}>
                <Image
                  source={method.icon}
                  style={[
                    styles.paymentIcon,
                    method.disabled && styles.paymentIconDisabled
                  ]}
                  resizeMode="contain"
                />
                <Text style={[
                  styles.paymentLabel,
                  method.disabled && styles.paymentLabelDisabled
                ]}>
                  {method.label}
                  {method.disabled && " (Not Available)"}
                </Text>
              </View>
              <View style={[
                styles.radio,
                selectedPayment === method.id && styles.radioSelected
              ]}>
                {selectedPayment === method.id && (
                  <View style={styles.radioInner} />
                )}
              </View>
            </Pressable>
          ))}
        </View>

        <View style={styles.imageContainer}>
          <Image
            source={require("@/assets/images/gas.png")}
            style={styles.gasImage}
            resizeMode="contain"
          />
        </View>

        <View style={styles.weightContainer}>
          <Text style={styles.weight}>{user?.tankSize}</Text>
        </View>

        <View style={styles.timerContainer}>
          <Ionicons name="time" size={20} color="#000000" />
          <Text style={styles.timerText}>Maximimum delivery in 30-45 minutes</Text>
        </View>
      </ScrollView>

      <TouchableOpacity
        style={[
          styles.confirmButton,
          hasActiveOrders && styles.confirmButtonDisabled
        ]}
        onPress={handleConfirm}
        disabled={hasActiveOrders}
      >
        <Text style={styles.confirmText}>
          {hasActiveOrders ? "Active Order Exists" : "Confirm Order"}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default OrderScreen;

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
    fontWeight: "700",
    color: "#000000",
  },
  heading: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000000",
    lineHeight: 20,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  locationText: {
    flex: 1,
  },
  address: {
    fontSize: 16,
    color: "#000000",
    fontWeight: "500",
  },
  subText: {
    fontSize: 14,
    color: "6B6B6B",
    marginTop: 4,
  },
  amountContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#CAC4D0",
  },
  label: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000000",
  },
  amount: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000000",
  },
  paymentMethods: {
    paddingVertical: 10,
    gap: 14,
  },
  paymentOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#CAC4D0",
    paddingBottom: 10,
  },
  paymentOptionDisabled: {
    opacity: 0.5,
  },
  paymentLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  paymentLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000000",
  },
  paymentLabelDisabled: {
    color: "#6B6B6B",
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#E5E5E5",
    alignItems: "center",
    justifyContent: "center",
  },
  radioSelected: {
    borderColor: "#00BFA5",
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#00BFA5",
  },
  imageContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  gasImage: {
    width: 150,
    height: 180,
  },
  paymentIcon: {
    width: 24,
    height: 24,
  },
  paymentIconDisabled: {
    opacity: 0.5,
  },
  weightContainer: {
    alignItems: "center",
    paddingVertical: 10,
  },
  weight: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000000",
  },
  timerContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    justifyContent: "center",
  },
  timerText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000000",
  },
  confirmButton: {
    backgroundColor: "#000000",
    margin: 20,
    marginBottom: 37,
    padding: 16,
  },
  confirmButtonDisabled: {
    opacity: 0.5,
  },
  confirmText: {
    color: "#FFF",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "700",
  },
  warningContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFBEB",
    padding: 15,
    borderRadius: 8,
    margin: 20,
    marginBottom: 10,
  },
  warningText: {
    fontSize: 14,
    color: "#FF6B35",
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#000000",
  },
});
