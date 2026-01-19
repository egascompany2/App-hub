import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Linking,
  StatusBar,
  Alert,
  Image,
  Dimensions,
} from "react-native";
import { useState, useEffect, useRef, useCallback } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { orderKeys } from "@/utils/queryKeys";
import { driverService } from "@/services/driver";
import * as Location from "expo-location";
import { locationService } from "@/services/location";
import { dismissDriverAlarm } from "@/lib/notifications";
import {
  openExternalNavigation,
  calculateRegion,
  calculateDistance,
} from "@/utils/navigation";
import MapViewDirections from "react-native-maps-directions";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
  withTiming,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { driverKeys } from "@/hooks/useDriver";
import { calculateETA } from '@/utils/calculateETA';
import { useLocationDisclosure } from "@/hooks/useLocationDisclosure";
const GOOGLE_MAPS_API_KEY = "AIzaSyD-Vz-OkLGAeMiuT5_eUj2_V9x91FTrDM8";

const OrderDetails = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [status, setStatus] = useState(params.status as string);
  const queryClient = useQueryClient();
  const [driverLocation, setDriverLocation] =
    useState<Location.LocationObject | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const mapRef = useRef<MapView>(null);
  const [distance, setDistance] = useState<number | null>(() => {
    if (params.deliveryLat && params.deliveryLong && driverLocation) {
      return calculateDistance(
        driverLocation.coords.latitude,
        driverLocation.coords.longitude,
        parseFloat(params.deliveryLat as string),
        parseFloat(params.deliveryLong as string)
      );
    }
    return null;
  });
  console.log(params.deliveryLat, params.deliveryLong)
  const [showNavigation, setShowNavigation] = useState(false);
  const [duration, setDuration] = useState<number | null>(null);
  const [isCalculatingETA, setIsCalculatingETA] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const { ensurePermission, disclosureModal } = useLocationDisclosure();
  const locationRequiredMessage =
    "Allow location to enable delivery tracking and navigation, but location-based features will be limited.";

  const { height: SCREEN_HEIGHT } = Dimensions.get('window');
  const INITIAL_MAP_HEIGHT = 210;
  const HEADER_HEIGHT = 90;
  const sheetHeight = SCREEN_HEIGHT - INITIAL_MAP_HEIGHT - HEADER_HEIGHT;
  const MAX_TRANSLATE_Y = sheetHeight;
  
  const translateY = useSharedValue(0);
  const context = useSharedValue({ y: 0 });
  const active = useSharedValue(false);

  // Add default region (Lagos coordinates as fallback)
  const DEFAULT_REGION = {
    latitude: 6.5244,
    longitude: 3.3792,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  const scrollTo = useCallback((destination: number) => {
    'worklet';
    active.value = destination !== 0;
    translateY.value = withSpring(destination, { 
      damping: 50,
      stiffness: 300,
    });
  }, []);

  const gesture = Gesture.Pan()
    .onStart(() => {
      context.value = { y: translateY.value };
    })
    .onUpdate((event) => {
      translateY.value = Math.max(
        0,
        Math.min(context.value.y + event.translationY, MAX_TRANSLATE_Y)
      );
    })
    .onEnd((event) => {
      if (event.velocityY > 500) {
        scrollTo(MAX_TRANSLATE_Y);
      } else if (event.velocityY < -500) {
        scrollTo(0);
      } else if (translateY.value > MAX_TRANSLATE_Y / 2) {
        scrollTo(MAX_TRANSLATE_Y);
      } else {
        scrollTo(0);
      }
    });

  const rMapStyle = useAnimatedStyle(() => {
    return {
      height: interpolate(
        translateY.value,
        [0, MAX_TRANSLATE_Y],
        [INITIAL_MAP_HEIGHT, SCREEN_HEIGHT],
        Extrapolation.CLAMP
      ),
    };
  });

  const rSheetStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  // Accept order mutation
  const { mutateAsync: acceptOrder, isPending: isAccepting } = useMutation({
    mutationFn: (orderId: string) => driverService.acceptOrder(orderId),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orderKeys.new() });
        queryClient.invalidateQueries({ queryKey: orderKeys.ongoing() });
        if (typeof params.id === 'string') {
          dismissDriverAlarm(params.id).catch(() => undefined);
        }
        setStatus('ACCEPTED');
    },
  });

  // Decline order mutation
  const { mutateAsync: declineOrder, isPending: isDeclining } = useMutation({
    mutationFn: (orderId: string) => driverService.declineOrder(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.new() });
      queryClient.invalidateQueries({ queryKey: orderKeys.ongoing() });
    },
  });

  const startDeliveryMutation = useMutation({
    mutationFn: driverService.startDelivery,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      queryClient.invalidateQueries({ queryKey: orderKeys.ongoing() });
      queryClient.invalidateQueries({ queryKey: orderKeys.new() });
      if (typeof params.id === 'string') {
        dismissDriverAlarm(params.id).catch(() => undefined);
      }
      setStatus('IN_TRANSIT');
    },
  });

  const completeDeliveryMutation = useMutation({
    mutationFn: driverService.completeDelivery,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: driverKeys.current });
      queryClient.invalidateQueries({ queryKey: driverKeys.ongoing });
      if (typeof params.id === 'string') {
        dismissDriverAlarm(params.id).catch(() => undefined);
      }
      setStatus('DELIVERED');
    },
  });

  const calculateCurrentDistance = useCallback(
    (location: Location.LocationObject) => {
      if (params.deliveryLat && params.deliveryLong) {
        const dist = calculateDistance(
          location.coords.latitude,
          location.coords.longitude,
          parseFloat(params.deliveryLat as string),
          parseFloat(params.deliveryLong as string)
        );
        setDistance(dist);
      }
    },
    [params.deliveryLat, params.deliveryLong]
  );

  // Add ETA calculation function
  const calculateDeliveryTime = useCallback(async () => {
    if (!driverLocation || !params.deliveryLat || !params.deliveryLong) return;
    
    try {
      setIsCalculatingETA(true);
      const eta = await calculateETA(
        driverLocation.coords.latitude,
        driverLocation.coords.longitude,
        parseFloat(params.deliveryLat as string),
        parseFloat(params.deliveryLong as string)
      );
      setDuration(eta.durationInSeconds / 60); // Convert seconds to minutes
    } catch (error) {
      console.error('Error calculating ETA:', error);
    } finally {
      setIsCalculatingETA(false);
    }
  }, [driverLocation, params.deliveryLat, params.deliveryLong]);

  // Update ETA when location changes
  useEffect(() => {
    if (driverLocation && params.deliveryLat && params.deliveryLong) {
      calculateDeliveryTime();
    }
  }, [driverLocation, params.deliveryLat, params.deliveryLong, calculateDeliveryTime]);

  useEffect(() => {
    if (typeof params.id === 'string' && status !== 'ASSIGNED') {
      dismissDriverAlarm(params.id).catch(() => undefined);
    }
  }, [status, params.id]);

  useEffect(() => {
    let locationSubscription: Location.LocationSubscription;

    const startLocationTracking = async () => {
      try {
        if (isNavigating) {
          const consent = await ensurePermission();
          if (!consent) {
            Alert.alert("Location required", locationRequiredMessage);
            return;
          }
          locationSubscription = await locationService.startTracking(
            params.id as string
          );
        }
      } catch (error) {
        console.error("Failed to start location tracking:", error);
        Alert.alert("Error", "Failed to start location tracking");
      }
    };

    startLocationTracking();

    return () => {
      if (locationSubscription) {
        locationService.stopTracking(locationSubscription);
      }
    };
  }, [isNavigating]);

  useEffect(() => {
    const getInitialLocation = async () => {
      try {
        setIsLoadingLocation(true);
        const consent = await ensurePermission();
        if (!consent) {
          Alert.alert("Location required", locationRequiredMessage);
          setIsLoadingLocation(false);
          return;
        }

        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        setDriverLocation(location);
        calculateCurrentDistance(location);
      } catch (error) {
        console.error("Error getting location:", error);
        Alert.alert("Error", "Failed to get current location");
      } finally {
        setIsLoadingLocation(false);
      }
    };

    getInitialLocation();
  }, [calculateCurrentDistance]);

  useEffect(() => {
    // Automatically activate navigation if order is IN_TRANSIT
    if (status === "IN_TRANSIT") {
      setShowNavigation(true);
      setIsNavigating(true);
      
      // Zoom and orient the map for navigation if we have driver location
      if (mapRef.current && driverLocation) {
        mapRef.current.animateCamera({
          center: {
            latitude: driverLocation.coords.latitude,
            longitude: driverLocation.coords.longitude,
          },
          heading: driverLocation.coords.heading || 0,
          pitch: 45,
          zoom: 18,
        });
      }
    }
  }, [status, driverLocation]); 

  const handleStartNavigation = async () => {
    try {
      await startDeliveryMutation.mutateAsync(params.id as string);

      setShowNavigation(true);
      setIsNavigating(true);
      setStatus("IN_TRANSIT");

      // Zoom and orient the map for navigation
      if (mapRef.current && driverLocation) {
        mapRef.current.animateCamera({
          center: { 
            latitude: driverLocation.coords.latitude,
            longitude: driverLocation.coords.longitude,
          },
          heading: driverLocation.coords.heading || 0,
          pitch: 45,
          zoom: 18,
        });
      }
    } catch (error) {
      console.error("Navigation error:", error);
      Alert.alert("Error", "Could not start navigation");
    }
  };

  const handleCall = () => {
    Linking.openURL(`tel:${params.phoneNumber}`);
  };

  const handleDecline = () => {
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
              await declineOrder(params.id as string);
              router.back();
            } catch (error) {
              Alert.alert("Error", "Failed to decline order");
            }
          },
        },
      ]
    );
  };

  const handleAccept = async () => {
    const consent = await ensurePermission();
    if (!consent) {
      Alert.alert("Location required", locationRequiredMessage);
      return;
    }
    try {
      await acceptOrder(params.id as string);
      setStatus("ACCEPTED");
    } catch (error) {
      Alert.alert("Error", "Failed to accept order");
    }
  };

  const handleCompleteDelivery = () => {
    Alert.alert(
      "Confirm Delivery",
      "Are you sure you want to mark this order as delivered?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Confirm",
          onPress: async () => {
            try {
              await completeDeliveryMutation.mutateAsync(params.id as string);
              router.back();
            } catch (error) {
              Alert.alert("Error", "Failed to complete delivery");
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order #{params.orderId}</Text>
      </View>

      {/* Map Container */}
      <Animated.View style={[styles.mapContainer, rMapStyle]}>
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          showsUserLocation={true}
          followsUserLocation={isNavigating}
          showsMyLocationButton={true}
          showsCompass={true}
          loadingEnabled={true}
          userLocationAnnotationTitle="Your location"
          userLocationUpdateInterval={5000}
          userLocationFastestInterval={5000}
          initialRegion={
            driverLocation && params.deliveryLat && params.deliveryLong
              ? calculateRegion(
                  {
                    latitude: driverLocation.coords.latitude,
                    longitude: driverLocation.coords.longitude,
                  },
                  {
                    latitude: parseFloat(params.deliveryLat as string),
                    longitude: parseFloat(params.deliveryLong as string),
                  }
                )
              : DEFAULT_REGION
          }
        >
          {!isLoadingLocation && driverLocation && (
            <Marker
              coordinate={{ 
                latitude: driverLocation.coords.latitude,
                longitude: driverLocation.coords.longitude,
              }}
              draggable
              onDragEnd={e => {
                console.log(e.nativeEvent.coordinate);
              }}
              title="Your Location"
            >
              <MaterialIcons name="local-shipping" size={24} color="black" />
            </Marker>
          )}

          {params.deliveryLat && params.deliveryLong && (
            <Marker
              coordinate={{
                latitude: parseFloat(params.deliveryLat as string),
                longitude: parseFloat(params.deliveryLong as string),
              }}
              title="Delivery Location"
            />
          )}

          {showNavigation &&
            !isLoadingLocation &&
            driverLocation &&
            params.deliveryLat &&
            params.deliveryLong && (
              <MapViewDirections
                origin={{ 
                  latitude: driverLocation.coords.latitude,
                  longitude: driverLocation.coords.longitude,
                }}
                destination={{
                  latitude: parseFloat(params.deliveryLat as string),
                  longitude: parseFloat(params.deliveryLong as string),
                }}
                apikey={GOOGLE_MAPS_API_KEY}
                strokeWidth={6}
                strokeColor="#08875D"
                mode="DRIVING"
                precision="high"
                timePrecision="now"
                onReady={result => {
                  // Update the map view to show the route
                  mapRef.current?.fitToCoordinates(result.coordinates, {
                    edgePadding: { top: 100, right: 50, bottom: 300, left: 50 },
                    animated: true,
                  });

                  // Update distance and duration in real-time
                  setDistance(result.distance);
                  setDuration(result.duration);
                }}
                onError={(error) => {
                  console.error("Directions error:", error);
                  Alert.alert("Navigation Error", "Could not load directions");
                }}
              />
            )}
        </MapView>
      </Animated.View>

      {/* Details Sheet */}
      <GestureDetector gesture={gesture}>
        <Animated.View style={[styles.detailsContainer, rSheetStyle, { height: sheetHeight }]}>
          <View style={styles.drawerHandle} />
          
          <View style={styles.content}>
            {/* Customer Details */}
            <View style={styles.customerHeader}>
              <View>
              <Text style={styles.customerName}>{params.customerName}</Text>
              <View style={styles.phoneContainer}>
              <Image
                source={require("@/assets/images/call.png")}
                style={{ width: 16, height: 16 }}
              />
              <Text style={styles.phoneNumber}>{params.phoneNumber}</Text>
            </View>
              </View>
              <TouchableOpacity style={styles.callButton} onPress={handleCall}>
                <Text style={styles.callButtonText}>Call</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.distance}>
              Distance from you - {distance ? `${distance}km` : '5km'} away
            </Text>

            {/* Delivery Time */}
            <View style={styles.deliveryTimeContainer}>
              <Image
                source={require("@/assets/images/clock.png")}
                style={{ width: 16, height: 16 }}
              />
              <Text style={styles.deliveryTimeLabel}>Delivery time</Text>
              <Text style={styles.deliveryTimeValue}>
                {isCalculatingETA ? 'Calculating...' : duration ? `${Math.ceil(duration)} mins` : 'Not available'}
              </Text>
            </View>

            {/* Address */}
            <Text style={styles.sectionTitle}>Delivery address</Text>
            <View style={styles.locationContainer}>
              <Image
                source={require("@/assets/images/location.png")}
                style={{ width: 16, height: 16 }}
              />
              <Text style={styles.location}>{params.deliveryAddress}</Text>
            </View>

            {/* Order Details */}
            <View style={styles.orderInfo}>
              <View style={styles.orderRow}>
                <Text style={styles.orderLabel}>{params.tankSize} Gas</Text>
                <Text style={styles.orderValue}>₦{params.amount}</Text>
              </View>
              <View style={styles.orderRow}>
                <Text style={styles.orderLabel}>Payment</Text>
                <Text style={styles.orderValue}>{params.paymentMethod}</Text>
              </View>
            </View>
          </View>

          {/* Action Buttons - Now inside the sheet */}
          <View style={styles.actionButtons}>
            {status === "ASSIGNED" && (
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.declineButton}
                  onPress={handleDecline}
                  disabled={isDeclining || isAccepting}
                >
                  <Text style={styles.declineButtonText}>Decline</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.acceptButton}
                  onPress={handleAccept}
                  disabled={isDeclining || isAccepting}
                >
                  <Text style={styles.acceptButtonText}>Accept Order</Text>
                </TouchableOpacity>
              </View>
            )}
            {status === "ACCEPTED" && (
              <TouchableOpacity
                style={styles.navigationButton}
                onPress={handleStartNavigation}
              >
                <Text style={styles.navigationButtonText}>Start Navigation</Text>
              </TouchableOpacity>
            )}
            {status === "IN_TRANSIT" && (
              <TouchableOpacity
                style={styles.completeButton}
                onPress={handleCompleteDelivery}
              >
                <Text style={styles.buttonText}>Complete Delivery</Text>
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>
      </GestureDetector>
      {disclosureModal}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingTop: 40,
    padding: 16,
    gap: 16,
    height: 90, // Fixed header height
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  mapContainer: {
    width: '100%',
    height: '100%', // Initial height
  },

  map: {
    width: '100%',
    height: '100%',
  },

  detailsContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },

  drawerHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#DDD',
    borderRadius: 2,
    alignSelf: 'center',
    marginVertical: 12,
  },

  content: {
    flex: 1,
    paddingHorizontal: 16,
  },

  actionButtons: {
    padding: 16,
    paddingBottom: 20,
  },

  customerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  customerName: {
    fontSize: 20,
    fontWeight: "600",
  },
  distance: {
    color: "#000000",
    fontSize: 14,
    fontWeight: "500",
    marginTop: 8,
  },
  phoneContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    marginTop: 4,
  },
  phoneNumber: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "500",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 20,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  location: {
    color: "#3B3B3B",
    fontSize: 14,
    fontWeight: "500",
    flexWrap: "wrap",
    width: "90%",
  },
  orderInfo: {
    gap: 12,
  },
  orderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 24,
  },
  orderLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000000",
  },
  orderValue: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000000",
  },
  actions: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
  },
  declineButton: {
    flex: 1,
    backgroundColor: "#E8E8E8",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  acceptButton: {
    flex: 1,
    backgroundColor: "#000000",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  completeButton: {
    backgroundColor: "#08875D",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    width: "90%",
    alignSelf: "center",
    marginBottom: 24,
  },
  navigationButton: {
    backgroundColor: "#08875D",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    width: "100%",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  buttonText2: {
    color: "#2F2E2E",
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  // declineButton: {
  //   flex: 1,
  //   backgroundColor: '#E8E8E8',
  //   padding: 16,
  //   borderRadius: 14,
  //   alignItems: 'center',
  // },
  // acceptButton: {
  //   flex: 1,
  //   backgroundColor: '#000000',
  //   padding: 16,
  //   borderRadius: 14,
  //   alignItems: 'center',
  // },
  // navigationButton: {
  //   backgroundColor: '#08875D',
  //   padding: 16,
  //   borderRadius: 14,
  //   alignItems: 'center',
  // },
  callButton: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  callButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '500',
  },
  declineButtonText: {
    color: '#2F2E2E',
    fontSize: 16,
    fontWeight: '500',
  },
  acceptButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  navigationButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  deliveryTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 16,
  },
  deliveryTimeLabel: {
    flex: 1,
    color: "#000000",
    fontSize: 16,
    fontWeight: "500",
  },
  deliveryTimeValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
  },
});

export default OrderDetails;
