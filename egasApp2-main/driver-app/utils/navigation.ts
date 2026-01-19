import { Alert, Linking, Platform } from "react-native";
import { Region } from "react-native-maps";
import { decode } from "@mapbox/polyline";

export const openExternalNavigation = async (destination: {
  latitude: number;
  longitude: number;
}) => {
  try {
    // Build navigation URL based on platform
    const url = Platform.select({
      ios: `maps:${destination.latitude},${destination.longitude}?dirflg=d`,
      android: `google.navigation:q=${destination.latitude}+${destination.longitude}`,
      default: `https://www.google.com/maps/dir/?api=1&destination=${destination.latitude},${destination.longitude}`,
    });

    if (!url) {
      throw new Error("Platform not supported");
    }

    // Check if URL can be opened
    const supported = await Linking.canOpenURL(url);

    if (!supported) {
      throw new Error("No navigation app available");
    }

    // Open navigation
    await Linking.openURL(url);
  } catch (error) {
    console.error("Navigation error:", error);
    Alert.alert(
      "Navigation Error",
      "Could not open navigation. Please make sure you have a maps app installed.",
      [{ text: "OK" }]
    );
  }
};

export const calculateRegion = (
  origin: { latitude: number; longitude: number },
  destination: { latitude: number; longitude: number }
): Region => {
  const midLat = (origin.latitude + destination.latitude) / 2;
  const midLng = (origin.longitude + destination.longitude) / 2;

  const deltaLat = Math.abs(origin.latitude - destination.latitude) * 1.5;
  const deltaLng = Math.abs(origin.longitude - destination.longitude) * 1.5;

  return {
    latitude: midLat,
    longitude: midLng,
    latitudeDelta: Math.max(deltaLat, 0.02),
    longitudeDelta: Math.max(deltaLng, 0.02),
  };
};

export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 10) / 10; // Round to 1 decimal place
};

const toRad = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

interface DirectionsResult {
  distance: number;
  duration: number;
  coordinates: { latitude: number; longitude: number }[];
}

export const getDirections = async (
  origin: { latitude: number; longitude: number },
  destination: { latitude: number; longitude: number }
): Promise<DirectionsResult> => {
  try {
    const GOOGLE_MAPS_API_KEY = "AIzaSyASxZFdQHrfeAdI72DR_198_aC46gw0VCQ"; // Add your API key here
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}&key=${GOOGLE_MAPS_API_KEY}`
    );
    const data = await response.json();

    if (!data.routes[0]) {
      throw new Error("No route found");
    }

    const route = data.routes[0].legs[0];
    const points = data.routes[0].overview_polyline.points;
    const coordinates = decode(points).map(point => ({
      latitude: point[0],
      longitude: point[1],
    }));

    return {
      distance: route.distance.value / 1000, // Convert to km
      duration: route.duration.value, // Seconds
      coordinates,
    };
  } catch (error) {
    console.error("Error fetching directions:", error);
    throw error;
  }
};

export const getNavigationRoute = async (
  origin: { latitude: number; longitude: number },
  destination: { latitude: number; longitude: number }
) => {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}&key=AIzaSyD-Vz-OkLGAeMiuT5_eUj2_V9x91FTrDM8`
    );
    const data = await response.json();
    
    if (!data.routes[0]) {
      throw new Error("No route found");
    }

    const points = decode(data.routes[0].overview_polyline.points);
    const coordinates = points.map((point: number[]) => ({
      latitude: point[0],
      longitude: point[1],
    }));

    return coordinates;
  } catch (error) {
    console.error("Error getting navigation route:", error);
    throw error;
  }
};
