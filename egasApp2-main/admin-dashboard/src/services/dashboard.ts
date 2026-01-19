/* eslint-disable @typescript-eslint/no-explicit-any */
import { api } from '../lib/api';

export interface OrderStats {
  totalOrders: number;
  activeOrders: number;
  completedOrders: number;
  canceledOrders: number;
}

export interface RecentOrder {
  id: string;
  customerName: string;
  product: string;
  deliveryAddress: string;
  dateCreated: string;
  status: string;
  amountPaid: number;
  paymentMethod: string;
  paymentStatus: string;
}

export const dashboardService = {
  async getStats() {
    try {
      const response = await api.get<{ success: boolean; data: OrderStats }>('/admin/dashboard/orders-stats');
      return response.data.data;
    } catch (error:any) {
      throw new Error(error.response.data.message);
    }
  },

  async getRecentOrders() {
    try {
      const response = await api.get<{ success: boolean; data: RecentOrder[] }>('/admin/dashboard/recent-orders');
      return response.data.data;
    } catch (error:any) {
      throw new Error(error.response.data.message);
    }
  }
}; 