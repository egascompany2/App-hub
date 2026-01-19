export interface Order {
  id: string;
  orderId: string;
  userId: string;
  driverId?: string;
  tankSize: string;
  amount: number;
  paymentMethod: string;
  deliveryAddress: string;
  deliveryLatitude: number;
  deliveryLongitude: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  distance: any;
  driver: {
    id: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
  };
  user: {
    id: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
  };
}

export enum OrderStatus {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  IN_TRANSIT = "IN_TRANSIT",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED"
} 