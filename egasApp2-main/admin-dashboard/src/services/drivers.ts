/* eslint-disable @typescript-eslint/no-explicit-any */
import { api } from '@/lib/api';
import { Driver } from '../types/driver';
import toast from 'react-hot-toast';

interface CreateDriverData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber: string;
  address: string;
}

export const driversService = {
  async getAvailableDrivers() {
    try {
      const response = await api.get<{ success: boolean; data: Driver[] }>('/admin/drivers/available');
      return response.data.data;
    } catch (error:any) {
      toast.error(error.response?.data?.message || 'Failed to fetch drivers');
      throw error;
    }
  },

  async getDrivers() {
    try {
      const response = await api.get<{ success: boolean; data: Driver[] }>('/admin/drivers');
      return response.data.data;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch drivers');
      throw error;
    }
  },

  async addDriver(data: CreateDriverData) {
    try {
      const response = await api.post('/admin/drivers', data);
      toast.success('Driver added successfully');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to add driver');
    }
  },

  async deleteDriver(id: string) {
    try {
      await api.delete(`/admin/drivers/${id}`);
      toast.success('Driver deleted successfully');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete driver');
    }
  },

  async updateDriver(id: string, data: Partial<CreateDriverData>) {
    try {
      const response = await api.put(`/admin/drivers/${id}`, data);
      toast.success('Driver updated successfully');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update driver');
    }
  }
}; 