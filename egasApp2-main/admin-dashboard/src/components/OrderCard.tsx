import { RecentOrder } from '../services/dashboard';
import { formatDate } from '../utils/date';
import { statusColors } from '../data/orders';

interface OrderCardProps {
  order: RecentOrder;
}

export function OrderCard({ order }: OrderCardProps) {
  return (
    <div className="p-4 border-b border-gray-200">
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="font-medium">Order #{order.id}</p>
          <p className="text-sm text-gray-600">{order.customerName}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm ${statusColors[order.status as keyof typeof statusColors]}`}>
          {order.status}
        </span>
      </div>
      <div className="space-y-1 text-sm">
        <p><span className="text-gray-600">Product:</span> {order.product}</p>
        <p><span className="text-gray-600">Delivery:</span> {order.deliveryAddress}</p>
        <p><span className="text-gray-600">Date:</span> {formatDate(order.dateCreated)}</p>
        <p><span className="text-gray-600">Amount:</span> ₦{order.amountPaid}</p>
      </div>
    </div>
  );
}