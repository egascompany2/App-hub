import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { ordersService} from '../services/orders';
import { formatDate } from '../utils/date';
import { EmptyState } from './EmptyState';
import { Button } from './ui/button';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import toast from 'react-hot-toast';
import { Order } from '@/types/order';
import { DriverAssignmentModal } from './DriverAssignmentModal';

const statusColors = {
  PENDING: 'bg-purple-100 text-purple-700',
  ASSIGNED: 'bg-blue-100 text-blue-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
  ACCEPTED: 'bg-yellow-100 text-yellow-700',
  PICKED_UP: 'bg-indigo-100 text-indigo-700',
  IN_TRANSIT: 'bg-cyan-100 text-cyan-700',
  DECLINED: 'bg-red-100 text-red-700'
};

interface OrdersTableProps {
  orders?: Order[];
}

export function OrdersTable({ orders }: OrdersTableProps) {
  const [showDriverModal, setShowDriverModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<{ id: string; status: string; driverName?: string | null } | null>(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const assignMutation = useMutation({
    mutationFn: (driverId: string) => {
      if (!selectedOrder) throw new Error('No order selected');
      return ordersService.assignDriver(selectedOrder.id, driverId);
    },
    onSuccess: (response) => {
      toast.success(response.message || 'Driver assignment updated');
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      if (selectedOrder) {
        queryClient.invalidateQueries({ queryKey: ["order", selectedOrder.id] });
      }
      setShowDriverModal(false);
      setSelectedOrder(null);

      if (response.meta?.previousDriverNotified) {
        toast.success('Previous driver notified to disengage from this order.');
      }
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (orderId: string) => ordersService.deleteOrder(orderId),
    onSuccess: () => {
      toast.success('Order deleted successfully');
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  if (!orders?.length) {
    return (
      <div className="p-6">
        <EmptyState
          // icon={<FiShoppingBag className="w-12 h-12 text-gray-400" />}
          title="No orders yet"
          description="There are no orders in the system yet."
        />
      </div>
    );
  }

  return (
    <>
    <div className="bg-white rounded-lg shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-gray-200">
            <tr>
              <th className="w-4 p-4">
                <input type="checkbox" className="rounded" />
              </th>
              <th className="px-2 py-3 text-left text-[14px] font-medium text-gray-600">Order Id</th>
              <th className="px-2 py-3 text-left text-[14px] font-medium text-gray-600">Customer</th>
              <th className="px-2 py-3 text-left text-[14px] font-medium text-gray-600">Product</th>
              <th className="px-2 py-3 text-left text-[14px] font-medium text-gray-600">Delivery Address</th>
              <th className="px-2 py-3 text-left text-[14px] font-medium text-gray-600">Delivery Driver</th>
              <th className="px-2 py-3 text-left text-[14px] font-medium text-gray-600">Date created</th>
              <th className="px-2 py-3 text-left text-[14px] font-medium text-gray-600">Price</th>
              <th className="px-2 py-3 text-left text-[14px] font-medium text-gray-600">Status</th>
              <th className="px-2 py-3 text-left text-[14px] font-medium text-gray-600">Assign</th>
              <th className="px-2 py-3 text-left text-[14px] font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {orders?.map((order) => (
              <tr key={order.id}>
                <td className="p-4">
                  <input type="checkbox" className="rounded" />
                </td>
                <td className="px-2 py-3 text-[14px]">{order.orderId}</td>
                <td className="px-2 py-3 text-[14px]">{order.customerName}</td>
                <td className="px-2 py-3 text-[14px]">{order.product}</td>
                <td className="px-2 py-3 text-[14px]">{order.deliveryAddress.length > 20 ? order.deliveryAddress.substring(0, 20) + '...' : order.deliveryAddress}</td>
                <td className="px-2 py-3 text-[14px]">{order.deliveryDriver}</td>
                <td className="px-2 py-3 text-[14px]">{formatDate(order.dateCreated)}</td>
                <td className="px-2 py-3 text-[14px]">₦{order.amountPaid}</td>
                <td className="px-2 py-3 text-[14px]">
                  <span className={`px-3 py-1 rounded-full text-xs ${statusColors[order.status as keyof typeof statusColors]}`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-2 py-3 text-[14px]">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!['PENDING', 'ASSIGNED', 'ACCEPTED'].includes(order.status)}
                    onClick={() => {
                      setSelectedOrder({
                        id: order.id,
                        status: order.status,
                        driverName: order.deliveryDriver,
                      });
                      setShowDriverModal(true);
                    }}
                    className="h-8 px-3 text-xs"
                  >
                    {order.deliveryDriver ? 'Reassign' : 'Assign'}
                  </Button>
                </td>
                <td className="px-1 py-1 text-[14px]">
                  <div className="flex items-center gap-1">
                    <Button onClick={() => navigate(`/orders/${order.id}`)} variant="link" className="p-0 h-5 hover:bg-gray-50">
                      <img src="/icons/eye.svg" alt="View order" />
                    </Button>
                    <Popover>
                      <PopoverTrigger>
                        <Button variant="link" className="p-0 h-5 hover:bg-gray-50">
                          <img src="/icons/more.svg" alt="Edit order" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="p-3 w-fit">
                       <span onClick={() => deleteMutation.mutate(order.id)} className="text-sm cursor-pointer text-primary">Delete</span>
                      </PopoverContent>
                    </Popover>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    {showDriverModal && selectedOrder && (
      <DriverAssignmentModal
        orderId={selectedOrder.id}
        currentDriverName={selectedOrder.driverName}
        onClose={() => {
          setShowDriverModal(false);
          setSelectedOrder(null);
        }}
        onAssign={(driverId) => assignMutation.mutate(driverId)}
      />
    )}
    </>
  );
}
