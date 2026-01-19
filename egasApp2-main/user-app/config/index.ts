export const GOOGLE_MAPS_API_KEY =
  process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ||
  process.env.EXPO_GOOGLE_MAPS_API_KEY ||
  "AIzaSyD-Vz-OkLGAeMiuT5_eUj2_V9x91FTrDM8";
export const PAYSTACK_PUBLIC_KEY =
  process.env.EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY ||
  "pk_test_bee0cceeb470583b3b035d788c2e6a05b88df9d3";
export const environment = {
  API_URL: process.env.EXPO_PUBLIC_API_URL || "http://localhost:5000/api",
  SOCKET_URL: process.env.EXPO_PUBLIC_SOCKET_URL || "http://localhost:5000",
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

export const INTERSWITCH_MERCHANT_CODE = "MX150444";
export const INTERSWITCH_PAY_ITEM_ID = "4592173";
// API_BASE_URL alias for clarity in payment logic
export const API_BASE_URL = environment.SOCKET_URL;
