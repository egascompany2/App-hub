/* eslint-disable @typescript-eslint/no-explicit-any */
import { OrderDetails, Order } from '@/types/order';
import { api } from '../lib/api';

export const ordersService = {
  async getOrders() {
    try {
      const response = await api.get<{ success: boolean; data: Order[] }>('/admin/orders');
      return response.data.data;
    } catch (error:any) {
      throw new Error(error.response.data.message);
    }
  },
  async getOrderDetails(id: string) {
   try {
    const response = await api.get<{ success: boolean; data: OrderDetails }>(`/admin/orders/${id}`);
    return response.data.data;
   } catch (error:any) {
    throw new Error(error.response.data.message);
   }
  },

  async assignDriver(orderId: string, driverId: string) {
    try {
      const response = await api.post<{
        success: boolean;
        message: string;
        data: OrderDetails;
        meta?: {
          previousDriverNotified?: boolean;
          requiresAcknowledgement?: boolean;
        };
      }>("/admin/orders/assign-driver", {
        orderId,
        driverId,
      });

      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to assign driver");
    }
  },
  async cancelOrder(orderId: string) {
    try {
      const response = await api.post<{ success: boolean; data: OrderDetails }>(`/admin/orders/${orderId}/cancel`);
      return response.data.data;
    } catch (error:any) {
      throw new Error(error.response.data.message);
    }
  },

  async deleteOrder(orderId: string) {
    try {
      const response = await api.delete<{ success: boolean }>(`/admin/orders/${orderId}/delete`);
      return response.data;
    } catch (error:any) {
      throw new Error(error.response.data.message);
    }
  }
}; 
