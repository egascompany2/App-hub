import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  SafeAreaView,
  Pressable,
  Animated,
  Button,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
// import { useAuthStore } from "@/store/authStore";
import { useOrderStore } from "@/store/orderStore";
import { useOnboardingStore } from "@/store/onboardingStore";
import { getTankSizePrice } from "@/utils/tankSize";
import { OrderStatus } from "@/types/order";
import { useLocalSearchParams } from "expo-router";
import { socketService } from "@/services/socket";
import { orderService } from '@/services/order';
import { useAuth } from "@/contexts/AuthContext";
import { calculateETA } from "@/utils/calculateETA";
import { BackHandler } from "react-native";

const CLOSE_HIT_SLOP = { top: 8, right: 8, bottom: 8, left: 8 };
const CLOSE_ICON_SIZE = 40;

const EtaScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const progressAnimation = React.useRef(new Animated.Value(0)).current;
  const { user, refreshUser, isLoading: isUserLoading } = useAuth();
  const { currentOrder } = useOrderStore();
  const [orderStatus, setOrderStatus] = useState<OrderStatus | undefined>(currentOrder?.status);
  const [estimatedArrival, setEstimatedArrival] = useState("");
  const [screenState, setScreenState] = useState<'preparing' | 'almostThere' | 'delivered'>('preparing');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { tankSizes, fetchTankSizes } = useOnboardingStore();
  const amount = getTankSizePrice(tankSizes, user?.tankSize);
  const isHistoricalView = Boolean(params.orderId);
  const countdownInterval = useRef<NodeJS.Timeout>();
  const [socketError, setSocketError] = useState<string | null>(null);
  const socketInitialized = useRef(false);

  useEffect(() => {
    fetchTankSizes();
    refreshUser();
  }, []);

  // Force hardware back to land on home
  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      router.replace("/(tabs)/home");
      return true;
    });
    return () => sub.remove();
  }, [router]);

  // Fetch order status periodically
  useEffect(() => {
    const fetchOrderStatus = async () => {
      try {
        setIsLoading(true);
        const orderId = currentOrder?.id || params.orderId as string;
        
        if (!orderId) {
          throw new Error('No order ID provided');
        }

        const { order, driverLocation } = await orderService.getOrder(orderId);
        
        if (!order) {
          throw new Error('Order not found');
        }

        if (driverLocation) {
          const eta = await calculateETA(
            driverLocation.currentLat || 0,
            driverLocation.currentLong || 0,
            order.deliveryLatitude || 0,
            order.deliveryLongitude || 0
          );
          setEstimatedArrival(eta.duration);
        }

        setOrderStatus(order.status);
        
        // Update screen state based on status
        switch (order.status) {
          case OrderStatus.PENDING:
            router.replace("/(tabs)/history");
            break;
          case OrderStatus.ACCEPTED:
            setScreenState('preparing');
            break;
          case OrderStatus.IN_TRANSIT:
            setScreenState('almostThere');
            break;
          case OrderStatus.DELIVERED:
            setScreenState('delivered');
            break;
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch order status';
        setError(errorMessage);
        alert(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    // Fetch immediately
    fetchOrderStatus();

    // Then fetch every 5 seconds
    const intervalId = setInterval(fetchOrderStatus, 3000);

    return () => {
      clearInterval(intervalId);
    };
  }, [currentOrder?.id, user?.id]);

  // Socket connection effect
  useEffect(() => {
    if (!currentOrder?.id || !user?.id || socketInitialized.current) return;

    const initializeSocket = async () => {
      try {
        setSocketError(null);
        console.log('Initializing socket connection...');
        
        // Attempt to connect socket
        await socketService.connect(user.id);
        
        // Subscribe to order updates
        await socketService.subscribeToOrder(currentOrder.id, {
          onLocationUpdate: (update) => {
            console.log('Location update received:', update);
          },
          onStatusUpdate: (update) => {
            console.log('Status update received:', update);
            setOrderStatus(update.status);
            // handleStatusChange(update.status);
          }
        });

        socketInitialized.current = true;
      } catch (error) {
        console.error("Socket initialization error:", error);
        setSocketError("Failed to connect to real-time updates");
        
        // Optional: Implement retry logic here
        setTimeout(initializeSocket, 5000); // Retry after 5 seconds
      }
    };

    initializeSocket();

    return () => {
      if (currentOrder?.id) {
        socketService.unsubscribeFromOrder(currentOrder.id);
        socketService.disconnect();
        socketInitialized.current = false;
      }
    };
  }, [currentOrder?.id, user?.id]);





  React.useEffect(() => {
    Animated.timing(progressAnimation, {
      toValue: getProgress(orderStatus || ""),
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [orderStatus]);

  // Calculate progress based on status
  const getProgress = (status: string) => {
    switch (status) {
      case "PENDING":
        return 0.2;
      case "ACCEPTED":
        return 0.4;
      case "IN_TRANSIT":
        return 0.7;
      case "DELIVERED":
        return 1;
      default:
        return 0;
    }
  };

  // Get screen title based on state
  const getScreenTitle = () => {
    switch (screenState) {
      case 'preparing':
        return 'Preparing your egas...';
      case 'almostThere':
        return 'Almost there...';
      case 'delivered':
        return 'Enjoy your order';
    }
  };

  // Get screen message based on state
  const getScreenMessage = () => {
    switch (screenState) {
      case 'preparing':
        return `Your egas is arriving in ${estimatedArrival || "..."}`;
      case 'almostThere':
        return `Your egas is arriving in ${estimatedArrival || "..."}`;
      case 'delivered':
        return 'Congratulations on receiving your egas. We hope it serves you well. Always prioritize safety when handling gas. Make sure to follow proper usage guidelines. Enjoy your e-gas!';
    }
  };

  // Update screen state based on order status
  useEffect(() => {
    switch (orderStatus) {
      case OrderStatus.PENDING:
      case OrderStatus.ACCEPTED:
        setScreenState('preparing');
        break;
      case OrderStatus.IN_TRANSIT:
        setScreenState('almostThere');
        break;
      case OrderStatus.DELIVERED:
        setScreenState('delivered');
        break;
    }
  }, [orderStatus]);

  // Show error state if socket connection fails
  if (socketError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{socketError}</Text>
        <Button 
          title="Retry Connection" 
          onPress={() => {
            socketInitialized.current = false;
          }} 
        />
      </View>
    );
  }

  if (isUserLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable 
          onPress={() => router.replace("/(tabs)/home")} 
          hitSlop={CLOSE_HIT_SLOP}
        >
          <Ionicons name="close" size={CLOSE_ICON_SIZE} />
        </Pressable>
      </View>

      <View style={styles.content}>
        <View style={styles.statusSection}>
          <Text style={styles.title}>{getScreenTitle()}</Text>
          {/* <Text style={styles.arrivalTime}>
            {screenState === 'delivered' ? '' : `Arriving at ${estimatedArrival}`}
          </Text> */}

          {screenState !== 'delivered' && (
            <View style={styles.progressBar}>
              <Animated.View
                style={[
                  styles.progressFill,
                  {
                    width: progressAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: ["0%", "100%"],
                    }),
                  },
                ]}
              />
            </View>
          )}

          <Text style={styles.latestArrival}>{getScreenMessage() || "Loading..."}</Text>
        </View>

        <View style={styles.imageContainer}>
          <Image
            source={require("@/assets/images/gas-tank.png")}
            style={styles.gasImage}
            resizeMode="contain"
          />
        </View>

        {screenState !== 'delivered' && (
          <View style={styles.orderDetails}>
            <View style={styles.priceContainer}>
            <Text style={styles.price}>₦{amount.toLocaleString()}</Text>
              <Text style={styles.weight}>{user?.tankSize}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.locationContainer}>
              <Ionicons name="location" size={24} color="#000" />
              <View style={styles.locationText}>
                <Text style={styles.address}>{user?.address}</Text>
                <Text style={styles.subText}>
                  {user?.firstName} {user?.lastName}
                </Text>
              </View>
            </View>
          </View>
        )}

        {screenState === 'delivered' && (
          <Pressable 
            style={styles.closeButton}
            onPress={() => router.replace("/(tabs)/home")}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
};

export default EtaScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingTop: 40,
  },
  header: {
    padding: 10,
  },
  content: {
    flex: 1,
  },
  statusSection: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
  },
  arrivalTime: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000000",
    marginBottom: 16,
  },
  progressBar: {
    height: 4,
    backgroundColor: "#E5E5E5",
    borderRadius: 2,
    marginVertical: 8,
  },
  progressFill: {
    width: "40%", // Adjust this value based on actual progress
    height: "100%",
    backgroundColor: "#4CAF50", // Green color for progress
    borderRadius: 2,
  },
  latestArrival: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000000",
    lineHeight: 24,
  },
  imageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    marginVertical: 20,
  },
  gasImage: {
    width: 200,
    height: 240,
  },
  orderDetails: {
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  price: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginTop: 10,
  },
  locationText: {
    flex: 1,
  },
  address: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000000",
    lineHeight: 20,
  },
  subText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#6B6B6B",
    marginTop: 4,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  orderId: {
    fontSize: 16,
    fontWeight: "500",
  },
  weight: {
    fontSize: 16,
    fontWeight: "500",
  },
  closeButton: {
    backgroundColor: '#000',
    padding: 16,
    borderRadius: 8,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  closeButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: "#CAC4D0",
    marginVertical: 10,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    marginBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
