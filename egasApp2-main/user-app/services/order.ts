import { api } from "@/lib/api";
import { OrderStatus } from "@/types/order";

export interface CreateOrderInput {
  tankSize: string;
  deliveryAddress: string;
  paymentMethod: "CARD" | "CASH" | "BANK_TRANSFER" | "POS" | "ONLINE";
  amount: number;
  notes?: string;
  deliveryLatitude: number;
  deliveryLongitude: number;
  paymentReference?: string;
  paymentStatus?: string;
}

export interface Order {
  id: string;
  status: OrderStatus;
  tankSize: string;
  deliveryAddress: string;
  amount: number;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
  orderId: string;
  deliveryLatitude: number;
  deliveryLongitude: number;
  deliveryStatus: string;
  deliveryConfirmation: string;
  driver?: {
    user: {
      firstName: string;
      lastName: string;
      phoneNumber: string;
    };
  };
}

export interface ActiveOrdersResponse {
  success: boolean;
  hasActiveOrders: boolean;
  activeOrders: Order[];
  message: string;
}

export interface POSPaymentEligibilityResponse {
  success: boolean;
  canUsePOS: boolean;
  message: string;
}

export const orderService = {
  createOrder: async (data: CreateOrderInput) => {
    const response = await api.post<Order>("/client/orders", data);
    return response.data;
  },

  getOrderStatus: async (orderId: string) => {
    const response = await api.get<Order>(`/client/orders/${orderId}`);
    return response.data;
  },

  getOrderHistory: async () => {
    const response = await api.get<Order[]>("/client/orders");
    return response.data;
  },

  getActiveOrders: async () => {
    const response = await api.get<ActiveOrdersResponse>("/client/orders/active");
    return response.data;
  },

  checkPOSPaymentEligibility: async () => {
    const response = await api.get<POSPaymentEligibilityResponse>("/client/payment/pos-eligibility");
    return response.data;
  },

  trackOrder: async (trackingId: string) => {
    const response = await api.get<Order>(`/orders/track/${trackingId}`);
    return response.data;
  },

  confirmDelivery: async (orderId: string) => {
    const response = await api.post(`/client/orders/${orderId}/confirm-delivery`);
    return response.data;
  },

  async getOrder(orderId: string): Promise<any> {
    const response = await api.get(`/client/orders/${orderId}`);
    return response.data;
  },
};
