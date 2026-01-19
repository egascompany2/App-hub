import { useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { useOrderStore } from "@/store/orderStore";
import { useOnboardingStore } from "@/store/onboardingStore";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import { getTankSizePrice } from "@/utils/tankSize";
import axios from "axios";
import { INTERSWITCH_MERCHANT_CODE, INTERSWITCH_PAY_ITEM_ID, SOCKET_URL } from "@/config/index";

const PAYMENT_TIMEOUT = 1800000;

const PayOnline = () => {
  const [showPayment, setShowPayment] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationAttempts, setVerificationAttempts] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const paymentTimeout = useRef<NodeJS.Timeout | null>(null);
  const txnRef = useRef("TXN-" + Date.now());

  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const { createOrder, fetchOrderHistory } = useOrderStore();
  const { tankSizes } = useOnboardingStore();
  const amount = getTankSizePrice(tankSizes, user?.tankSize);
  const formattedAmount = amount * 100;

  useEffect(() => {
    refreshUser();

    // brief preloader before showing WebView
    const revealTimer = setTimeout(() => setShowPayment(true), 600);

    const timeout = setTimeout(() => {
      setShowPayment(false);
      setError("Payment timed out. Please try again.");
      router.push("/payment-failed");
    }, PAYMENT_TIMEOUT);

    paymentTimeout.current = timeout;

    return () => {
      if (paymentTimeout.current) {
        clearTimeout(paymentTimeout.current);
      }
      clearTimeout(revealTimer);
    };
  }, []);

  const getPaymentHTML = () => {
    return `
      <html>
        <body style="display: none;" onload="document.forms[0].submit();">
          <form 
            method="post"
            action="https://newwebpay.interswitchng.com/collections/w/pay">
            <input name="merchant_code" value="${INTERSWITCH_MERCHANT_CODE}" />
            <input name="pay_item_id" value="${INTERSWITCH_PAY_ITEM_ID}" />
            <input name="amount" value="${formattedAmount}" />
            <input name="currency" value="566" />
            <input name="txn_ref" value="${txnRef.current}" />
            <input name="customer_id" value="${user?.id}" />
            <input name="customer_email" value="${user?.email}" />
            <input name="customer_name" value="${user?.firstName} ${user?.lastName}" />
            <input name="site_redirect_url" value="gasapp://payment-callback?txn_ref=${txnRef.current}" />
            <input name="site_name" value="GasApp" />
          </form>
        </body>
      </html>
    `;
  };

  const handleNavigationStateChange = async (newNavState: any) => {
    if (newNavState.url.includes("gasapp://")) {
      try {
        if (paymentTimeout.current) clearTimeout(paymentTimeout.current);
        setShowPayment(false);

        const params = new URLSearchParams(newNavState.url.split("?")[1]);
        const txn = params.get("txn_ref");

        if (!txn) throw new Error("Missing transaction reference");

        await verifyPaymentAndCreateOrder(txn);
      } catch (error) {
        console.error("Payment redirect error:", error);
        setError("Failed to process payment");
        router.push("/payment-failed");
      }
    }
  };

  const verifyPaymentAndCreateOrder = async (txnRefValue: string) => {
    setIsVerifying(true);
    setVerificationAttempts((prev) => prev + 1);

    try {
      const response = await axios.post(`${SOCKET_URL}/api/payonline/payments/verify`, {
        transactionRef: txnRefValue,
        amount: formattedAmount,
      });

      if (!response.data.success) {
        setError(response.data.error || "Payment verification failed");
        router.push("/payment-failed");
      } else {
        await createOrder({
          tankSize: user?.tankSize || "",
          deliveryAddress: user?.address || "",
          paymentMethod: "ONLINE",
          amount,
          deliveryLatitude: user?.latitude || 0,
          deliveryLongitude: user?.longitude || 0,
          paymentReference: txnRefValue,
          notes: "Payment made online",
          paymentStatus: "PAID",
        });

        await fetchOrderHistory();
        router.push("/ETA");
      }
    } catch (error) {
      console.error("Verify payment failed:", error);
      setError("Verification error");
      router.push("/payment-failed");
    } finally {
      setIsVerifying(false);
    }
  };

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isVerifying) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>Verifying payment...</Text>
          {verificationAttempts > 1 && (
            <Text style={styles.retryText}>Attempt {verificationAttempts}</Text>
          )}
        </View>
      </SafeAreaView>
    );
  }

  if (showPayment) {
    return (
      <SafeAreaView style={styles.webviewContainer}>
        <WebView
          source={{ html: getPaymentHTML() }}
          onNavigationStateChange={handleNavigationStateChange}
          startInLoadingState={true}
          renderLoading={() => (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" />
              <Text style={styles.loadingText}>Loading payment page...</Text>
            </View>
          )}
          style={styles.webview}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Preparing payment...</Text>
      </View>
    </SafeAreaView>
  );
};

export default PayOnline;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  webviewContainer: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    textAlign: "center",
    color: "#333",
  },
  retryText: {
    marginTop: 10,
    fontSize: 14,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#ff0000",
    textAlign: "center",
  },
});
