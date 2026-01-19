export interface OrderStatus {
  status: string;
  timestamp: string;
  description: string;
}

export interface OrderDetails {
  id: string;
  status: 'PENDING' | 'ASSIGNED' | 'ACCEPTED' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';
  items: {
    name: string;
    price: number;
  }[];
  shippingFee: number;
  total: number;
  payment: {
    type: string;
    status: string;
  };
  customer: {
    name: string;
    phone: string;
    email: string;
  };
  driver: {
    name: string;
    phone: string;
  } | null;
  deliveryAddress: string;
  statusUpdates: OrderStatus[];
} 

export interface Order {
  id: string;
  orderId: string;
  customerName: string;
  product: string;
  deliveryAddress: string;
  deliveryDriver: string;
  dateCreated: string;
  amountPaid: number;
  status: string;
}