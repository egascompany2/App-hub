export enum OrderStatus {
  PENDING = "PENDING",
  ASSIGNED = "ASSIGNED",
  ACCEPTED = "ACCEPTED",
  PICKED_UP = "PICKED_UP",
  IN_TRANSIT = "IN_TRANSIT",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED"
}

interface Driver {
  id: string;
  userId: string;
  currentLat: number | null;
  currentLong: number | null;
  isAvailable: boolean;
  user: {
    firstName: string;
    lastName: string;
    phoneNumber: string;
  };
}

export interface Order {
  id: string;
  status: OrderStatus;
  driver?: Driver | null;
  createdAt: string;
  completedAt?: string;
  deliveryLatitude: number;
  deliveryLongitude: number;
  deliveryAddress: string;
  tankSize: string;
  amount: number;
  paymentMethod: string;
  user: {
    firstName: string;
    lastName: string;
    phoneNumber: string;
  };
} 