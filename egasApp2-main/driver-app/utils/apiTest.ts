import { api } from "@/lib/api";
import { getApiUrl } from "@/config/environment";

export const testApiConnectivity = async () => {
  try {
    console.log("🔍 Testing API connectivity...");
    console.log("API URL:", getApiUrl());
    
    // Test health endpoint
    const healthResponse = await api.get("/health");
    console.log("✅ Health check passed:", healthResponse.data);
    
    return {
      success: true,
      message: "API connectivity test passed",
      data: healthResponse.data,
    };
  } catch (error) {
    console.error("❌ API connectivity test failed:", error);
    return {
      success: false,
      message: "API connectivity test failed",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

export const testDriverLogin = async (email: string, password: string) => {
  try {
    console.log("🔍 Testing driver login...");
    
    const response = await api.post("/auth/driver/login", {
      email,
      password,
    });
    
    console.log("✅ Driver login test passed:", {
      success: response.data.success,
      message: response.data.message,
      hasUser: !!response.data.data?.user,
      hasTokens: !!(response.data.data?.accessToken && response.data.data?.refreshToken),
    });
    
    return {
      success: true,
      message: "Driver login test passed",
      data: response.data,
    };
  } catch (error) {
    console.error("❌ Driver login test failed:", error);
    
    if (error instanceof Error) {
      return {
        success: false,
        message: "Driver login test failed",
        error: error.message,
      };
    }
    
    return {
      success: false,
      message: "Driver login test failed",
      error: "Unknown error",
    };
  }
};

export const runApiTests = async () => {
  console.log("🧪 Running API tests...");
  
  // Test 1: API connectivity
  const connectivityTest = await testApiConnectivity();
  console.log("Connectivity test result:", connectivityTest);
  
  // Test 2: Driver login with test credentials
  const loginTest = await testDriverLogin("driver1@example.com", "12345678");
  console.log("Login test result:", loginTest);
  
  return {
    connectivityTest,
    loginTest,
  };
}; 