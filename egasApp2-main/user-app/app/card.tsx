import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Image,
  Switch,
  Pressable,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { paymentService } from "@/services/payment";
import { useAuthStore } from "@/store/authStore";
import { CardPaymentRequest } from "@/types/payment";
import { useOnboardingStore } from "@/store/onboardingStore";
import { getTankSizePrice } from "@/utils/tankSize";
import { useAuth } from "@/contexts/AuthContext";

const CardScreen = () => {
  const router = useRouter();
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [pin, setPin] = useState("");
  const [saveCard, setSaveCard] = useState(false);
  const [processing, setProcessing] = useState(false);
  const { user, refreshUser } = useAuth();
  const { tankSizes } = useOnboardingStore();
  const amount = getTankSizePrice(tankSizes, user?.tankSize);

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\s/g, "");
    const formatted = cleaned.match(/.{1,4}/g)?.join(" ") || "";
    return formatted;
  };

  const formatExpiry = (text: string) => {
    const cleaned = text.replace(/\D/g, "");
    if (cleaned.length >= 2) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
    }
    return cleaned;
  };

  const handlePayment = async () => {
    try {
      setProcessing(true);

      //validation
      if (!cardNumber || !expiry || !cvv) {
        Alert.alert("Error", "Please fill in all fields");
        return;
      }

      const [month, year] = expiry.split("/");

      const paymentData: CardPaymentRequest = {
        amount: amount,
        cardDetails: {
          cardNumber: cardNumber.replace(/\s/g, ""),
          cvv,
          expiryMonth: month,
          expiryYear: year,
          pin,
          currency: "NGN",
          customerId: user?.email || user?.phoneNumber || "",
        },
      };

      const response = await paymentService.initiateCardPayment(paymentData);

      if (response.requiresOtp) {
        router.push({
          pathname: "/payment/otp",
          params: {
            paymentId: response?.data?.paymentId,
            transactionRef: response?.data?.transactionRef,
          },
        });
        return;
      }

      if (response.data?.status === "success") {
        router.replace("/payment/success");
      }
    } catch (error) {
      Alert.alert(
        "Payment Failed",
        error instanceof Error ? error.message : "An error occurred"
      );
    } finally {
      setProcessing(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="close" color="#000000" size={36} />
        </Pressable>
        <Text style={styles.headerTitle}>Pay with card</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.amountContainer}>
          <Text style={styles.label}>Amount</Text>
          <Text style={styles.amount}>₦{amount.toLocaleString()}</Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Card</Text>
          <TextInput
            style={styles.input}
            placeholder="4445 5788 5678 6789"
            value={cardNumber}
            onChangeText={text => setCardNumber(formatCardNumber(text))}
            keyboardType="numeric"
            maxLength={19}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: 12 }]}>
            <Text style={styles.label}>Expiry</Text>
            <TextInput
              style={styles.input}
              placeholder="05/24"
              value={expiry}
              onChangeText={text => setExpiry(formatExpiry(text))}
              keyboardType="numeric"
              maxLength={5}
            />
          </View>

          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>Cvv</Text>
            <TextInput
              style={styles.input}
              placeholder="345"
              value={cvv}
              onChangeText={setCvv}
              keyboardType="numeric"
              maxLength={3}
              secureTextEntry
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Pin</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter pin"
            value={pin}
            onChangeText={setPin}
            keyboardType="numeric"
            maxLength={4}
            secureTextEntry
          />
        </View>

        <View style={styles.saveCardContainer}>
          <Switch
            value={saveCard}
            onValueChange={setSaveCard}
            trackColor={{ false: "#E5E5E5", true: "#2D68FE" }}
            thumbColor="#FFF"
          />
          <Text style={styles.saveCardText}>Save card details</Text>
        </View>

        <TouchableOpacity
          style={[styles.payButton, processing && styles.disabledButton]}
          onPress={handlePayment}
          disabled={processing}
        >
          {processing ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.payButtonText}>
              Pay ₦{amount.toLocaleString()}
            </Text>
          )}
        </TouchableOpacity>

        <Image
          source={require("@/assets/images/interswitch.png")}
          style={styles.interswitchLogo}
          resizeMode="contain"
        />
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
    marginBottom: 8,
  },
  amount: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000000",
  },
  inputGroup: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  saveCardContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
    gap: 12,
  },
  saveCardText: {
    fontSize: 16,
  },
  payButton: {
    backgroundColor: "#000000",
    padding: 16,
    alignItems: "center",
    marginTop: 20,
  },
  payButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
  interswitchLogo: {
    width: 120,
    height: 40,
    alignSelf: "center",
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: "#CCC",
  },
});

export default CardScreen;
