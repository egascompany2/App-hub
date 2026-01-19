export interface Order {
  id: string;
  customerName: string;
  product: string;
  deliveryAddress: string;
  dateCreated: string;
  status: 'Created' | 'Assigned' | 'Completed' | 'Canceled';
  amount: string;
}

export const orders: Order[] = [
  {
    id: '12344',
    customerName: 'Masud Rana',
    product: 'Gas 5kg',
    deliveryAddress: '13 bayode',
    dateCreated: '13 bayode',
    status: 'Created',
    amount: 'N400'
  },
  {
    id: '22344',
    customerName: 'Masud Rana',
    product: 'Gas 5kg',
    deliveryAddress: 'Gas 5kg',
    dateCreated: 'Gas 5kg',
    status: 'Assigned',
    amount: 'N400'
  }
];

export const statusColors = {
  Created: 'bg-purple-100 text-purple-700',
  Assigned: 'bg-blue-100 text-blue-700',
  Completed: 'bg-green-100 text-green-700',
  Canceled: 'bg-red-100 text-red-700'
};