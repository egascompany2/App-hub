import { api } from "../lib/api";
import { DriverProfile } from "./profile";

export interface UpdateLocationPayload {
  currentLat: number;
  currentLong: number;
  isAvailable?: boolean;
}

export interface DocumentUpload {
  type: string;
  url: string;
  expiryDate?: Date;
}

export const driverService = {
  async updateLocation(data: UpdateLocationPayload) {
    console.log("update location", data);
    const response = await api.post<{ success: boolean; data: DriverProfile }>(
      "/driver/location",
      // {
      //   currentLat: 6.5935, // TODO: remove this after testing
      //   currentLong: 3.3561, // TODO: remove this after testing
      //   isAvailable: true, // TODO: remove this after testing
      // }
      data
    );
    return response.data;
  },

  async updateAvailability(isAvailable: boolean) {
    const response = await api.patch<{ success: boolean; data: DriverProfile }>(
      "/driver/availability",
      { isAvailable }
    );
    return response.data;
  },

  async getCurrentOrders() {
    const response = await api.get("/driver/orders/current");
    return response.data;
  },

  async getOrderHistory(page = 1, limit = 10) {
    const response = await api.get(
      `/driver/orders/history?page=${page}&limit=${limit}`
    );
    return response;
  },

  async getOngoingOrders() {
    const response = await api.get("/driver/orders/ongoing");
    return response.data;
  },

  async acceptOrder(orderId: string) {
    const response = await api.post(`/driver/orders/${orderId}/accept`);
    return response.data;
  },

  async declineOrder(orderId: string, reason: string = "Driver unavailable") {
    const response = await api.post(`/driver/orders/${orderId}/decline`, {
      reason,
    });
    return response.data;
  },

  startDelivery: async (orderId: string) => {
    const response = await api.post(`/driver/orders/${orderId}/start-delivery`);
    return response.data;
  },

  completeDelivery: async (orderId: string) => {
    const response = await api.post(
      `/driver/orders/${orderId}/complete-delivery`
    );
    return response.data;
  },

  async uploadDocument(document: DocumentUpload) {
    const response = await api.post("/driver/documents", document);
    return response.data;
  },

  async updateProfile(data: { vehicleType?: string; vehiclePlate?: string }) {
    const response = await api.patch("/driver/profile", data);
    return response.data;
  },

  async confirmReassignment(orderId: string) {
    const response = await api.post(`/driver/orders/${orderId}/reassignment/confirm`);
    return response.data;
  },

  async deleteAccount() {
    const response = await api.delete("/driver/profile");
    return response.data;
  },
};
