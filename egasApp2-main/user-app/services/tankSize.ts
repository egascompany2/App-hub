import { api } from "@/lib/api";

export interface TankSize {
  id: string;
  size: string;
  price: number;
  status: string;
  _count?: {
    orders: number;
  };
}

export const tankSizeService = {
  getAllTankSizes: async (): Promise<TankSize[]> => {
    try {
      console.log("[TankSize] Fetching tank sizes from API...");
      const response = await api.get<TankSize[]>(`/tank-sizes`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log("[TankSize] Response received:", response);
      console.log("[TankSize] Response data:", response.data);
      // Ensure we always return an array
      const data = response.data;
      const result = Array.isArray(data) ? data : [];
      console.log("[TankSize] Returning:", result.length, "tank sizes");
      return result;
    } catch (error) {
      console.error("[TankSize] Error fetching tank sizes:", error);
      // Return empty array on error instead of throwing
      return [];
    }
  },
}; 