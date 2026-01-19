import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Pressable,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Alert,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useOrderStore } from "@/store/orderStore";
import { Order, orderService } from "@/services/order";
import { OrderStatus } from "@/types/order";

// Helper function to format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Helper function to get status style
const getStatusStyle = (status: OrderStatus) => {
  const styles = {
    PENDING: { backgroundColor: "#FFA500" },
    ASSIGNED: { backgroundColor: "#4169E1" },
    ACCEPTED: { backgroundColor: "#4169E1" },
    IN_TRANSIT: { backgroundColor: "#4169E1" },
    DELIVERED: { backgroundColor: "#008000" },
    CANCELLED: { backgroundColor: "#FF0000" },
    PICKED_UP: { backgroundColor: "#4169E1" },
  };
  return styles[status] || { backgroundColor: "#000" };
};

const OrderCard = ({ order }: { order: Order }) => {
  const router = useRouter();
  const { fetchOrderHistory } = useOrderStore();
  const handleOrderPress = () => {
    if (order.status === "PENDING") {
      // TODO: show a toast message
      Alert.alert(
        "Order Status: Pending",
        "This order is currently pending and cannot be tracked until a driver accepts it."
      );
      return;
    }

    if (order.status === "CANCELLED") {
      // TODO: show a toast message
      Alert.alert(
        "Order Status: Cancelled",
        "This order has been cancelled and cannot be tracked."
      );
      return;
    }

    if (order.status === "DELIVERED") {
      router.push({
        pathname: "/order-summary",
        params: {
          orderId: order.orderId,
          status: order.status,
          createdAt: order.createdAt,
          amount: order.amount,
          tankSize: order.tankSize,
          phoneNumber: order.driver?.user.phoneNumber,
          deliveryAddress: order.deliveryAddress,
          driver: order.driver ? `${order.driver.user.firstName} ${order.driver.user.lastName}` : '',
          paymentMethod: order.paymentMethod,
          paymentStatus: order.paymentStatus,
        },
      });
      return;
    }

    router.push({
      pathname: "/ETA",
      params: {
        orderId: order.id,
        status: order.status,
        createdAt: order.createdAt,
      },
    });
  };

  const handleConfirmOrderDelivery = () => {
    Alert.alert(
      "Confirm Delivery",
      "Was the delivery successful? If yes, confirm the delivery.",
      [
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => {
            Alert.alert(
              "Order Not Confirmed",
              "If you're having issues with your delivery, please contact our support team at support@egas.com for immediate assistance.",
              [
                {
                  text: "OK",
                  style: "default"
                }
              ]
            );
          },
        },
        {
          text: "Confirm",
          style: "destructive",
          onPress: async () => {
            await orderService.confirmDelivery(order.orderId);
            await fetchOrderHistory();
            Alert.alert("Delivery Confirmed", "The delivery has been confirmed.");
          },
        },
      ]
    );
  };

  return (
    <Pressable onPress={handleOrderPress} style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.date}>{formatDate(order.createdAt)}</Text>
        <View
          style={[
            styles.statusBadge,
            getStatusStyle(order.status as OrderStatus),
          ]}
        >
          <Text style={styles.statusText}>{order.status}</Text>
        </View>
      </View>

      <Text style={styles.orderId}>Order Id: {order.orderId}</Text>

      <View style={styles.cardDetails}>
        <Text style={styles.detailText}>{order.tankSize}</Text>
        <Text style={styles.detailText}>₦{order.amount.toLocaleString()}</Text>
        <Text style={styles.detailText}>{order.deliveryAddress}</Text>
        <View style={styles.driverContainer}>
          {order.driver && (
            <Text style={styles.driverText}>
              Driver: {order.driver.user.firstName} {order.driver.user.lastName}
            </Text>
          )}
          {order.status === "DELIVERED" && !order.deliveryConfirmation && (
            <TouchableOpacity
              onPress={handleConfirmOrderDelivery}
              style={styles.confirmDeliveryButton}
            >
              <Text style={styles.confirmDeliveryText}>Confirm Delivery</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Pressable>
  );
};

const HistoryScreen = () => {
  const router = useRouter();
  const { fetchOrderHistory, orderHistory, isLoading, error } = useOrderStore();
  const [refreshing, setRefreshing] = useState(false);

  const loadOrders = async () => {
    try {
      await fetchOrderHistory();
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  useEffect(() => {
    loadOrders();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="close" color="#000000" size={36} />
        </Pressable>
        <Text style={styles.headerTitle}>e-gas history</Text>
      </View>

      {isLoading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000" />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable style={styles.retryButton} onPress={loadOrders}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {orderHistory.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No orders yet</Text>
            </View>
          ) : (
            orderHistory.map((order, index) => (
              <React.Fragment key={order.id}>
                <OrderCard order={order} />
                {index < orderHistory.length - 1 && (
                  <View style={styles.divider} />
                )}
              </React.Fragment>
            ))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default HistoryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingTop: 40,
  },
  driverContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  confirmDeliveryButton: {
    backgroundColor: "#000",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmDeliveryText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "700",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000000",
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100, // Add padding for tab bar
  },
  card: {
    borderWidth: 2,
    borderColor: "#000000",
    borderRadius: 12,
    padding: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  date: {
    fontSize: 14,
    color: "#666",
  },
  statusBadge: {
    backgroundColor: "#000",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "500",
  },
  orderId: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
  },
  cardDetails: {
    gap: 4,
  },
  detailText: {
    fontSize: 14,
    color: "#000",
    fontWeight: "700",
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#CAC4D0",
    marginVertical: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#FF0000",
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: "#000",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "500",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
  },
  driverText: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
  },
});
