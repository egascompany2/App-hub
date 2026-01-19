import { api } from "../lib/api";

export interface DriverProfile {
  profile: {
    id: string;
    userId: string;
    isAvailable: boolean;
    currentLat: number | null;
    currentLong: number | null;
    vehicleType: string | null;
    vehiclePlate: string | null;
    licenseNumber: string | null;
    licenseExpiry: Date | null;
    rating: number | null;
    totalTrips: number;
    user: {
      firstName: string;
      lastName: string;
      phoneNumber: string;
      email: string;
    };
  };
}

export const profileService = {
  async getProfile() {
    const response = await api.get<DriverProfile>("/driver/profile");
    if (!response.data) {
      throw new Error("Failed to fetch profile data");
    }
    return response.data;
  },

  async updateAvailability(isAvailable: boolean) {
    const response = await api.patch<{ success: boolean; data: DriverProfile }>(
      "/driver/availability",
      { isAvailable }
    );
    return response.data;
  },
};
