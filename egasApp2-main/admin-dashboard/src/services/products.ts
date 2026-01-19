/* eslint-disable @typescript-eslint/no-explicit-any */
import { api } from '../lib/api';

export interface Product {
  id: string;
  name: string;
  weight: string;
  price: number;
  dateCreated: string;
  status: string;
}

export const productsService = {
  async getProducts() {
    try {
      const response = await api.get<{ success: boolean; data: Product[] }>('/admin/tank-sizes');
      return response.data.data;
    } catch (error:any) {
      throw new Error(error.response.data.message);
    }
  },

  async createProduct(data: { name: string; weight: string; price: number }) {
    const payload = {
      name: data.name,
      size: data.weight,
      price: data.price
    };
    
    try {
      const response = await api.post('/admin/tank-sizes', payload);
      return response.data;
    } catch (error:any) {
      throw new Error(error.response.data.message);
    }
  },

  async updateProduct(id: string, data: Partial<Product>) {
    const payload = {
      name: data.name,
      size: data.weight,
      price: data.price,
      status: data.status
    };
    
    try {
      const response = await api.put(`/admin/tank-sizes/${id}`, payload);
      return response.data;
    } catch (error:any) {
      throw new Error(error.response.data.message);
    }
  }
}; 