// Environment configuration for the driver app
export const environment = {
  API_URL: process.env.EXPO_PUBLIC_API_URL || "https://e22ed569c5f7.ngrok-free.app/api",
  SOCKET_URL: process.env.EXPO_PUBLIC_SOCKET_URL || "https://e22ed569c5f7.ngrok-free.app",
};

// Direct exports for backward compatibility
export const API_URL = environment.API_URL;
export const SOCKET_URL = environment.SOCKET_URL;

// Helper function to get API URL with fallback
export const getApiUrl = (): string => {
  if (__DEV__) {
    // In development, you might want to use localhost
    return environment.API_URL;
  }
  
  // In production, use the configured API URL
  return environment.API_URL;
};

// Helper function to get Socket URL with fallback
export const getSocketUrl = (): string => {
  if (__DEV__) {
    // In development, you might want to use localhost
    return environment.SOCKET_URL;
  }
  
  // In production, use the configured Socket URL
  return environment.SOCKET_URL;
};

// Helper function to get Google Maps API key
export const getGoogleMapsApiKey = (): string => {
  return process.env.GOOGLE_MAPS_API_KEY || "AIzaSyD-Vz-OkLGAeMiuT5_eUj2_V9x91FTrDM8";
};

// Log configuration in development
if (__DEV__) {
  console.log("🔧 Environment Configuration:", {
    API_URL: environment.API_URL,
    SOCKET_URL: environment.SOCKET_URL,
    GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY ? "***configured***" : "NOT CONFIGURED",
    NODE_ENV: process.env.NODE_ENV || "development",
    DEBUG: __DEV__,
  });
} 