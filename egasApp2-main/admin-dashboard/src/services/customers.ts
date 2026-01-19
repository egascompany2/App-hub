/* eslint-disable @typescript-eslint/no-explicit-any */
import { api } from '../lib/api';

interface Customer {
  id: number;
  name: string;
  tankSize: string;
  phoneNo: string;
  address: string;
  dateCreated: string;
}

interface CustomerDetails {
  id: string;
  name: string;
  phoneNumber: string;
  currentAddress: string;
  gasSize: string;
  isActive: boolean;
  stats: {
    totalOrders: number;
    completedOrders: number;
    cancelledOrders: number;
  };
  recentActivity: {
    date: string;
    action: string;
    time: string;
  }[];
}

export interface CustomerOrder {
  id: string;
  orderId: string;
  customer: string;
  product: string;
  deliveryAddress: string;
  deliveryDriver: string;
  dateCreated: string;
  selected?: boolean;
}

export const customersService = {
  async getCustomers() {
    try {
      const response = await api.get<{ success: boolean; data: Customer[] }>('/admin/customers');
      return response.data.data;
    } catch (error:any) {
      throw new Error(error.response.data.message);
    }
  },

  async getCustomerDetails(userId: string) {
    try {
      const response = await api.get<{ success: boolean; data: CustomerDetails }>(
        `/admin/customers/${userId}`
      );
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response.data.message);
    }
  },

  async contactCustomer(userId: string) {
    try {
      const response = await api.post<{ success: boolean; message: string }>(
        `/admin/customers/${userId}/contact`
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response.data.message);
    }
  },

  async getCustomerOrders(userId: string) {
    try {
      const response = await api.get<{ success: boolean; data: any[] }>(`/admin/customers/${userId}/orders`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch customer orders');
    }
  },

  async updateCustomerStatus(userId: string, isActive: boolean) {
    try {
      const response = await api.patch<{ success: boolean; message: string }>(
        `/admin/customers/${userId}/status`,
        { isActive }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response.data.message);
    }
    },

  async updateCustomer(customerId: string, data: any) {
    try {
      const response = await api.patch<{ success: boolean; data: Customer }>(
        `/admin/customers/${customerId}`,
        data
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update customer');
    }
  },

  async deleteCustomer(userId: string) {
    try {
      const response = await api.delete<{ success: boolean; message: string }>(
        `/admin/customers/${userId}`
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response.data.message);
    }
  }
}; 