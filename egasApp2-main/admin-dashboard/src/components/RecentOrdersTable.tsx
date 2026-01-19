// import { OrderCard } from './OrderCard';
import { RecentOrder } from '../services/dashboard';
import { formatDate } from '../utils/date';
import { Link } from 'react-router-dom';


const statusColors = {
  PENDING: 'bg-purple-100 text-purple-700',
  ASSIGNED: 'bg-blue-100 text-blue-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
  ACCEPTED: 'bg-yellow-100 text-yellow-700',
  PICKED_UP: 'bg-indigo-100 text-indigo-700',
  IN_TRANSIT: 'bg-cyan-100 text-cyan-700'
};

interface RecentOrdersTableProps {
  orders: RecentOrder[];
}

export function RecentOrdersTable({ orders }: RecentOrdersTableProps) {
  console.log(orders);
  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 flex justify-between items-center">
        <h2 className="text-xl font-semibold">Recent Order</h2>
        <Link to="/orders" className="text-blue-600 text-sm">View all</Link>
      </div>
      
      {/* Mobile view */}
      {/* <div className="lg:hidden">
        {orders.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </div> */}
      
      {/* Desktop view */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-y border-gray-200">
            <tr>
              <th className="text-left py-3 px-3 text-sm font-medium text-gray-600">Order Id</th>
              <th className="text-left py-3 px-3 text-sm font-medium text-gray-600">Customer name</th>
              <th className="text-left py-3 px-3 text-sm font-medium text-gray-600">Product</th>
              <th className="text-left py-3 px-3 text-sm font-medium text-gray-600">Delivery Address</th>
              <th className="text-left py-3 px-3 text-sm font-medium text-gray-600">Date created</th>
              <th className="text-left py-3 px-3 text-sm font-medium text-gray-600">Status</th>
              <th className="text-left py-3 px-3 text-sm font-medium text-gray-600">Price</th>
             
              <th className="text-left py-3 px-3 text-sm font-medium text-gray-600">Payment Status</th>
              <th className="text-left py-3 px-3 text-sm font-medium text-gray-600">Payment Method</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="py-3 px-3">{order.id}</td>
                <td className="py-3 px-3">{order.customerName}</td>
                <td className="py-3 px-3">{order.product}</td>
                <td className="py-3 px-3">{order.deliveryAddress.length > 20 ? order.deliveryAddress.substring(0, 50) + '...' : order.deliveryAddress}</td>
                <td className="py-3 px-3">{formatDate(order.dateCreated)}</td>
                <td className="py-3 px-3">
                  <span className={`px-3 py-1 rounded-full text-xs ${statusColors[order.status as keyof typeof statusColors]}`}>
                    {order.status}
                  </span>
                </td>
                <td className="py-3 px-3">₦{order.amountPaid}</td>
                
                <td className="py-3 px-3">{order.paymentStatus}</td>
                <td className="py-3 px-3">{order.paymentMethod}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}