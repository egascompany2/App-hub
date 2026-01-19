import React from "react";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Pressable,
  ScrollView,
  TouchableOpacity,
  Linking,
  Platform,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { printToFileAsync } from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { Image } from 'react-native';

const COMPANY_NAME = "Egas Company";
const COMPANY_LOGO_URL = "https://res.cloudinary.com/dassyugcv/image/upload/v1753884896/egas-logo_tzx7cl.png";

const OrderSummaryScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();

  const handleCall = (phoneNumber: string) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  // Helper function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  // Helper to generate HTML for PDF
  const generateReceiptHtml = () => {
    return `
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <style>
            @page {
              size: auto;
              margin: 0;
              padding: 0;
            }
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 0;
              background: #f5f7fa;
            }
            .pdf-bg {
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 0;
            }
            .pdf-container {
              max-width: 720px;
              max-height: 2500px;
              height: 100%;
              width: 100%;
              background: #fff;
              border-radius: 18px;
              box-shadow: 0 4px 24px rgba(0,0,0,0.08);
              margin: 24px auto;
              padding: 24px 28px 32px 28px;
              box-sizing: border-box;
            }
            .header {
              text-align: center;
              margin-bottom: 18px;
            }
            .logo {
              width: 120px;
              height: 120px;
              object-fit: contain;
              margin-bottom: 8px;
            }
            .company {
              font-size: 38px;
              font-weight: bold;
              margin-bottom: 4px;
              color: #00BFA5;
            }
            .receipt-title {
              font-size: 32px;
              font-weight: 600;
              margin-bottom: 8px;
              color: #222;
            }
            .section {
              margin-bottom: 18px;
            }
            .row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 8px;
              font-size: 22px;
            }
            .label {
              font-weight: 500;
              color: #333;
              font-size: 22px;
            }
            .value {
              font-weight: 500;
              color: #111;
              font-size: 22px;
              word-break: break-all;
              max-width: 600px;
              text-align: right;
            }
            .amount {
              font-weight: bold;
              color: #000;
              font-size: 27px;
            }
            .total {
              font-size: 30px;
              font-weight: bold;
              color: #00BFA5;
              margin-top: 10px;
            }
            .section-title {
              color: #00BFA5;
              font-size: 24px;
              font-weight: 600;
              margin-bottom: 8px;
            }
          </style>
        </head>
        <body>
          <div class="pdf-bg">
            <div class="pdf-container">
              <div class="header">
                <img src="${COMPANY_LOGO_URL}" class="logo" />
                <div class="company">${COMPANY_NAME}</div>
                <div class="receipt-title">Order Receipt</div>
              </div>
              <div class="section">
                <div class="row"><span class="label">Order ID:</span><span class="value">#${params.orderId}</span></div>
                <div class="row"><span class="label">Status:</span><span class="value">Completed</span></div>
                <div class="row"><span class="label">Ordered on:</span><span class="value">${formatDate(params.createdAt as string)}</span></div>
                <div class="row"><span class="label">Delivery Address:</span><span class="value">${params.deliveryAddress}</span></div>
                <div class="row"><span class="label">Assigned Driver:</span><span class="value">${params.driver || "-"}</span></div>
                <div class="row"><span class="label">Driver Phone:</span><span class="value">${params.phoneNumber || "-"}</span></div>
              </div>
              <div class="section">
                <div class="row"><span class="label">Item:</span><span class="value">Gas ${params.tankSize}</span></div>
                <div class="row"><span class="label">Paid With:</span><span class="value">${params.paymentMethod}</span></div>
              </div>
              <div class="section">
                <div class="row"><span class="label">Subtotal:</span><span class="amount">₦${Number(params.amount).toLocaleString()}</span></div>
                <div class="row"><span class="label">Shipping fee:</span><span class="amount">0</span></div>
                <div class="row total"><span>Total:</span><span>₦${Number(params.amount).toLocaleString()}</span></div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
  };

  const handleDownloadReceipt = async () => {
    try {
      const html = generateReceiptHtml();
      const { uri } = await printToFileAsync({ html });
      await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    } catch (e) {
      Alert.alert('Error', 'Failed to generate receipt PDF.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="close" size={24} color="black" />
        </Pressable>
        <Text style={styles.headerTitle}>Order details</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <View style={styles.row}>
            <View>
              <Text style={styles.label}>Order ID</Text>
              <Text style={styles.value}>#{params.orderId}</Text>
            </View>
            <Text style={styles.statusText}>Completed</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Ordered on</Text>
          <Text style={styles.value}>{formatDate(params.createdAt as string)}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Delivery Address</Text>
          <Text style={styles.value}>{params.deliveryAddress}</Text>
        </View>

        {params.driver && (
          <View style={styles.section}>
            <Text style={styles.label}>Assigned Driver</Text>
            <View style={styles.driverRow}>
              <View>
                <Text style={styles.value}>{params.driver}</Text>
                <View style={styles.phoneNumberContainer}>
                  <Ionicons name="call" size={16} color="black" />
                  <Text style={styles.phoneNumber}>{params.phoneNumber}</Text>
                </View>
              </View>
              <TouchableOpacity 
                style={styles.callButton}
                onPress={() => handleCall(params.phoneNumber as string)}
              >
                <Text style={styles.callButtonText}>Call</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.label}>Item</Text>
          <View style={styles.row}>
            <Text style={styles.value}>Gas {params.tankSize}</Text>
            <Text style={styles.amount}>₦{Number(params.amount).toLocaleString()}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Paid With</Text>
          <Text style={styles.value}>{params.paymentMethod}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.row}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.amount}>₦{Number(params.amount).toLocaleString()}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.summaryLabel}>Shipping fee</Text>
            <Text style={styles.amount}>0</Text>
          </View>
          <View style={[styles.row, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalAmount}>₦{Number(params.amount).toLocaleString()}</Text>
          </View>
        </View>
        {/* Place the button at the end of the ScrollView */}
        <TouchableOpacity
          style={{
            backgroundColor: '#000',
            padding: 16,
            borderRadius: 8,
            marginTop: 32,
            marginBottom: 32,
          }}
          onPress={handleDownloadReceipt}
        >
          <Text style={{ color: '#fff', textAlign: 'center', fontWeight: 'bold' }}>
            Download PDF Receipt
          </Text>
        </TouchableOpacity>
      </ScrollView>
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
    gap: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 24,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  label: {
    fontSize: 16,
    color: "#000000",
    marginBottom: 8,
    fontWeight: "500",
  },
  value: {
    fontSize: 16,
    color: "#000000",
    fontWeight: "500",
  },
  statusText: {
    color: "#008000",
    fontSize: 16,
    fontWeight: "500",
  },
  driverRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  phoneNumber: {
    fontSize: 14,
    color: "#212121",
    marginTop: 4,
    fontWeight: "500",
  },
  phoneNumberContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  callButton: {
    borderWidth: 1,
    borderColor: "#000000",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  callButtonText: {
    fontSize: 14,
    color: "#000000",
  },
  amount: {
    fontSize: 16,
    color: "#000000",
    fontWeight: "700",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
  },
  summaryLabel: {
    fontSize: 16,
    color: "#212121",
    fontWeight: "500",
    marginBottom: 15,
  },
  totalRow: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: "700",
  },
  totalAmount: {
    fontSize: 14,
    fontWeight: "700",
  },
});

export default OrderSummaryScreen;
