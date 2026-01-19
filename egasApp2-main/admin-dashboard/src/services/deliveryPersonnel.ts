/* eslint-disable @typescript-eslint/no-explicit-any */
import { api } from '../lib/api';

export interface DeliveryPersonnel {
  id: number;
  name: string;
  phoneNo: string;
  address: string;
  dateCreated: string;
}

export const deliveryPersonnelService = {
  async getDeliveryPersonnel() {
    try {
      const response = await api.get<{ success: boolean; data: DeliveryPersonnel[] }>('/admin/delivery-personnel');
      return response.data.data;
    } catch (error:any) {
      throw new Error(error.response.data.message);
    }
  }
}; 