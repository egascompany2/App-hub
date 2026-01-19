import { useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Pressable,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Image,
} from "react-native";
import React, { useState } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Alert } from "react-native";
import { Order } from "@/types/order";
import {
  useCurrentOrders,
  useDeclineOrder,
  useAcceptOrder,
  useOngoingOrders,
  useUpdateAvailability,
} from "@/hooks/useDriver";
import { StatusBar } from "expo-status-bar";
import { useSocket } from "../../hooks/useSocket";
import { useLocationTracking } from "../../hooks/useLocationTracking";
import { useProfile } from "../../hooks/useProfile";
import { calculateDistance } from "@/utils/navigation";
import { useQueryClient } from "@tanstack/react-query";

const Home = () => {
  const [activeTab, setActiveTab] = useState("new");
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    data: currentOrder,
    isLoading: currentOrderLoading,
    error: currentOrderError,
    refetch: refetchCurrentOrder,
  } = useCurrentOrders();

  const {
    data: ongoingOrders,
    isLoading: ongoingOrdersLoading,
    error: ongoingOrdersError,
    refetch: refetchOngoingOrders,
  } = useOngoingOrders();

  const acceptOrderMutation = useAcceptOrder();
  const declineOrderMutation = useDeclineOrder();
  const updateAvailabilityMutation = useUpdateAvailability();

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchCurrentOrder(), refetchOngoingOrders()]);
    setRefreshing(false);
  };

  useEffect(() => {
    refetchCurrentOrder();
    refetchOngoingOrders();

    // Poll for new orders every 10 seconds
    const pollInterval = setInterval(() => {
      refetchCurrentOrder();
      refetchOngoingOrders();
    }, 10000);

    return () => clearInterval(pollInterval);
  }, []);

  const handleAccept = async (orderId: string) => {
    const consent = await ensurePermission();
    if (!consent) {
      Alert.alert(
        "Location required",
        "Allow location to enable delivery tracking and navigation, but location-based features will be limited."
      );
      return;
    }
    setIsAccepting(true);
    try {
      await acceptOrderMutation.mutateAsync(orderId);
      setIsAccepting(false);
    } catch (error) {
      Alert.alert("Error", "Failed to accept order");
    } finally {
      setIsAccepting(false);
    }
  };

  const handleDecline = async (orderId: string) => {
    Alert.alert(
      "Decline Order",
      "Are you sure you want to decline this order?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Decline",
          style: "destructive",
          onPress: async () => {
            try {
              await declineOrderMutation.mutateAsync(orderId);
            } catch (error) {
              Alert.alert("Error", "Failed to decline order");
            }
          },
        },
      ]
    );
  };

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
        orderId: order.orderId,
      },
    });
  };

  const {
    currentLocation,
    error: locationError,
    disclosureModal: locationDisclosureModal,
    ensurePermission,
  } = useLocationTracking();

  const calculateOrderDistance = (order: Order) => {
    if (
      !currentLocation ||
      !order.deliveryLatitude ||
      !order.deliveryLongitude
    ) {
      return "Distance N/A";
    }

    const distance = calculateDistance(
      currentLocation.coords.latitude,
      currentLocation.coords.longitude,
      order.deliveryLatitude,
      order.deliveryLongitude
    );

    return `${distance}km away`;
  };

  const renderNewOrderCard = (order: Order) => (
    <View key={order.id} style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <Text style={styles.customerName}>
          {order.user.firstName} {order.user.lastName}
        </Text>
        <Text style={styles.distance}>{calculateOrderDistance(order)}</Text>
      </View>

      <Text style={styles.orderDetails}>{order.tankSize} Gas</Text>

      <View style={styles.locationContainer}>
        <MaterialIcons name="location-on" size={20} color="#666" />
        <Text style={styles.location}>{order.deliveryAddress}</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.declineButton}
          onPress={() => handleDecline(order.id)}
        >
          <Text style={styles.declineText}>Decline</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.acceptButton}
          onPress={() => handleAccept(order.id)}
          disabled={isAccepting}
        >
          {!isAccepting && <Text style={styles.acceptText}>Accept</Text>}
          {isAccepting && <ActivityIndicator size="small" color="#039855" />}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.viewDetails}
          onPress={() => handleViewDetails(order)}
        >
          <Text style={styles.viewDetailsText}>View details</Text>
          <MaterialIcons name="arrow-forward" size={20} color="#000" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderOngoingOrderCard = (order: Order) => (
    <View key={order.id} style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <Text style={styles.customerName}>
          {order.user.firstName} {order.user.lastName}
        </Text>
        <Text style={styles.distance}>{calculateOrderDistance(order)}</Text>
      </View>

      <Text style={styles.orderDetails}>{order.tankSize} Gas</Text>

      <View style={styles.locationContainer}>
        <Image
          source={require("@/assets/images/location.png")}
          style={{ width: 20, height: 20 }}
        />
        <Text style={styles.location}>{order.deliveryAddress}</Text>
      </View>

      <View style={styles.actions}>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>Delivering In Progress</Text>
        </View>

        <TouchableOpacity
          style={styles.viewDetails}
          onPress={() => handleViewDetails(order)}
        >
          <Text style={styles.viewDetailsText}>View details</Text>
          <MaterialIcons name="arrow-forward" size={20} color="#000" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const { data: profile, refetch: refetchProfile, isLoading: profileLoading } = useProfile();
  const [isAvailable, setIsAvailable] = useState(
    profile?.profile.isAvailable
  );

  // Initialize socket connection
  useSocket();

  useEffect(() => {
    refetchProfile();
  }, [isAvailable]);

  const handleAvailabilityToggle = async (value: boolean) => {
    try {
      await updateAvailabilityMutation.mutateAsync(value);
      setIsAvailable(value);
    } catch (error) {
      console.error('Failed to update availability:', error);
      Alert.alert(
        'Error',
        'Failed to update availability status. Please try again.'
      );
      // Revert the toggle if the update failed
      setIsAvailable(!value);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        style="dark"
        translucent={true}
        backgroundColor="transparent"
      />
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Home</Text>
          <TouchableOpacity style={styles.availabilityButton} onPress={() => handleAvailabilityToggle(!isAvailable)}>
            {profileLoading ? (
              <ActivityIndicator color="#FFF8F9" size="small" />
            ) : (
              <Text style={styles.availabilityText}>{profile?.profile.isAvailable ? 'Available' : 'Unavailable'}</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.tabs}>
          <Pressable
            style={[styles.tab, activeTab === "new" && styles.activeTab]}
            onPress={() => setActiveTab("new")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "new" && styles.activeTabText,
              ]}
            >
              New Orders
            </Text>
          </Pressable>
          <Pressable
            style={[styles.tab, activeTab === "ongoing" && styles.activeTab]}
            onPress={() => setActiveTab("ongoing")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "ongoing" && styles.activeTabText,
              ]}
            >
              Ongoing orders
            </Text>
          </Pressable>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {locationError && (
            <Text style={styles.errorText}>{locationError}</Text>
          )}
          {activeTab === "new" ? (
            <>
              {currentOrderLoading && (
                <ActivityIndicator style={{ marginTop: 20 }} />
              )}
              {currentOrderError && (
                <Text style={styles.errorText}>
                  {currentOrderError.message}
                </Text>
              )}
              {!currentOrderLoading &&
                !currentOrderError &&
                currentOrder?.length === 0 && (
                  <Text style={styles.emptyText}>No new orders available</Text>
                )}
              {(currentOrder || []).map((order: any) =>
                renderNewOrderCard(order)
              )}
            </>
          ) : (
            <>
              {ongoingOrdersLoading && (
                <ActivityIndicator style={{ marginTop: 20 }} />
              )}
              {ongoingOrdersError && (
                <Text style={styles.errorText}>
                  {ongoingOrdersError.message}
                </Text>
              )}
              {!ongoingOrdersLoading &&
                !ongoingOrdersError &&
                ongoingOrders?.length === 0 && (
                  <Text style={styles.emptyText}>No ongoing orders</Text>
                )}
              {(ongoingOrders || []).map((order: any) =>
                renderOngoingOrderCard(order)
              )}
            </>
          )}
        </ScrollView>
        {locationDisclosureModal}
      </View>
    </SafeAreaView>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  availabilityButton: {
    backgroundColor: "#000",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  availabilityText: {
    color: "#FFF8F9",
  },
  availabilityTextAvailable: {
    color: "#039855",
  },
  availabilityTextUnavailable: {
    color: "#A30620",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  tabs: {
    flexDirection: "row",
    marginBottom: 20,
  },
  tab: {
    paddingBottom: 8,
    marginRight: 24,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#000",
  },
  tabText: {
    fontSize: 16,
    color: "#6C6C6C",
    fontWeight: "500",
  },
  activeTabText: {
    color: "#000",
    fontWeight: "800",
  },
  orderCard: {
    backgroundColor: "#fff",
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#F2F4F7",
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  customerName: {
    fontSize: 16,
    fontWeight: "800",
  },
  distance: {
    color: "#000000",
    fontWeight: "800",
  },
  orderDetails: {
    fontSize: 15,
    marginBottom: 8,
    fontWeight: "500",
    color: "#333333",
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  location: {
    marginLeft: 4,
    color: "#33333",
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
  },
  declineButton: {
    backgroundColor: "#A30620",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
  },
  declineText: {
    color: "#FFF8F9",
  },
  acceptButton: {
    backgroundColor: "#34A853",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
  },
  acceptText: {
    color: "#FFF8F9",
  },
  viewDetails: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: "auto",
  },
  viewDetailsText: {
    marginRight: 4,
  },
  statusBadge: {
    backgroundColor: "#D1FADF",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  statusText: {
    color: "#039855",
    fontSize: 12,
  },
  errorText: {
    color: "#D92D20",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 20,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    color: "#666",
  },
});
