import { create } from "zustand";
import { orderService, CreateOrderInput, Order } from "@/services/order";

interface OrderState {
  currentOrder: Order | null;
  orderHistory: Order[];
  isLoading: boolean;
  error: string | null;
  createOrder: (data: CreateOrderInput) => Promise<void>;
  fetchOrderHistory: () => Promise<void>;
  getOrderStatus: (orderId: string) => Promise<void>;
  trackOrder: (trackingId: string) => Promise<void>;
  clearOrder: () => void;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  currentOrder: null,
  orderHistory: [],
  isLoading: false,
  error: null,

  createOrder: async (data: CreateOrderInput) => {
    try {
      set({ isLoading: true, error: null });
      const order = await orderService.createOrder(data);
      set({ currentOrder: order });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Failed to create order" });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  fetchOrderHistory: async () => {
    try {
      set({ isLoading: true, error: null });
      const orders = await orderService.getOrderHistory();
      set({ orderHistory: orders });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Failed to fetch order history" });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  getOrderStatus: async (orderId: string) => {
    try {
      set({ isLoading: true, error: null });
      const order = await orderService.getOrderStatus(orderId);
      set({ currentOrder: order });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Failed to get order status" });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  trackOrder: async (trackingId: string) => {
    try {
      set({ isLoading: true, error: null });
      const order = await orderService.trackOrder(trackingId);
      set({ currentOrder: order });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Failed to track order" });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  clearOrder: () => set({ currentOrder: null, error: null })
})); 