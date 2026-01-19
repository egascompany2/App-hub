import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import React from "react";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useOrderHistory } from "@/hooks/useDriver";
import { Order, OrderStatus } from "../../types/order";
import { format } from "date-fns";

const Orders = () => {
  const router = useRouter();
  const {
    data,
    isLoading,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useOrderHistory();
  const [refreshing, setRefreshing] = React.useState(false);

  const orders = React.useMemo(() => {
    return data?.pages.flatMap((page: any) => page.orders) ?? [];
  }, [data]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleLoadMore = () => {
    if (!isFetchingNextPage && hasNextPage) {
      fetchNextPage();
    }
  };

  const isCloseToBottom = ({
    layoutMeasurement,
    contentOffset,
    contentSize,
  }: any) => {
    const paddingToBottom = 20;
    return (
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom
    );
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM d yyyy, HH:mm");
  };

  const getStatusStyle = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.DELIVERED:
        return styles.statusDelivered;
      case OrderStatus.CANCELLED:
        return styles.statusCanceled;
      default:
        return styles.statusDelivered;
    }
  };

  const getStatusTextStyle = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.CANCELLED:
        return styles.statusTextCanceled;
      default:
        return styles.statusTextDelivered;
    }
  };

  console.log("orders", orders)

  const handleViewDetails = (order: Order) => {
    router.push({
      pathname: `/order/${order.id}` as any,
      params: {
        customerName: `${order.user.firstName} ${order.user.lastName}`,
        phoneNumber: order.user.phoneNumber,
        deliveryAddress: order.deliveryAddress,
        deliveryLat: order.deliveryLatitude,
        deliveryLong: order.deliveryLongitude,
        tankSize: order.tankSize,
        amount: order.amount.toString(),
        paymentMethod: order.paymentMethod,
        status: order.status,
        distance: order.distance,
        createdAt: order.createdAt,
        orderId: order.orderId,
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>History</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onScroll={({ nativeEvent }) => {
          if (isCloseToBottom(nativeEvent)) {
            handleLoadMore();
          }
        }}
        scrollEventThrottle={400}
      >
        {isLoading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color="#0066CC" />
          </View>
        ) : error ? (
          <View style={styles.centered}>
            <Text>Failed to load order history</Text>
            <TouchableOpacity onPress={() => refetch()}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : orders.length === 0 ? (
          <Text style={styles.emptyText}>No order history</Text>
        ) : (
          <>
            {orders.map(order => (
              <View key={order.id} style={styles.orderCard}>
                <Text style={styles.orderId}>#{order.orderId}</Text>
                <Text style={styles.date}>{formatDate(order.createdAt)}</Text>
                <Text style={styles.details}>{order.tankSize} Gas</Text>
                <Text style={styles.location}>{order.deliveryAddress}</Text>

                <View style={styles.bottomRow}>
                  <View
                    style={[styles.statusBadge, getStatusStyle(order.status)]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        getStatusTextStyle(order.status),
                      ]}
                    >
                      {order.status}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => handleViewDetails(order)}>
                    <Text style={styles.viewDetails}>View details</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            {isFetchingNextPage && (
              <View style={styles.loadingMore}>
                <ActivityIndicator size="small" color="#0066CC" />
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    textAlign: "center",
  },
  scrollView: {
    padding: 16,
  },
  orderCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  orderId: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  date: {
    color: "#000000",
    fontSize: 14,
    marginBottom: 8,
  },
  details: {
    fontSize: 15,
    marginBottom: 4,
  },
  location: {
    color: "#000000",
    fontSize: 14,
    marginBottom: 16,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  statusDelivered: {
    backgroundColor: "#009A49",
  },
  statusCanceled: {
    backgroundColor: "#FF2828",
  },
  statusText: {
    fontSize: 14,
    fontWeight: "500",
  },
  statusTextDelivered: {
    color: "#fff",
  },
  statusTextCanceled: {
    color: "#fff",
  },
  viewDetails: {
    color: "#111827",
    fontSize: 14,
    fontWeight: "500",
  },
  emptyText: {
    textAlign: "center",
    color: "#666",
    marginTop: 20,
  },
  retryText: {
    color: "#0066CC",
    marginTop: 8,
    textDecorationLine: "underline",
  },
  loadingMore: {
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default Orders;
