import { useMutation, useQuery } from '@tanstack/react-query';
import { customersService } from '../services/customers';
import { format } from 'date-fns';
import { Button } from './ui/button';
import { toast } from 'react-hot-toast';
import { Popover, PopoverTrigger, PopoverContent } from './ui/popover';
import { useNavigate } from 'react-router-dom';
import SkeletonWrapper from './SkeletonWrapper';
import { useState } from 'react';
import { DriverAssignmentModal } from './DriverAssignmentModal';
import { ordersService } from '@/services/orders';

const statusColors = {
  CREATED: 'bg-purple-100 text-purple-700',
  ASSIGNED: 'bg-blue-100 text-blue-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700'
};

interface Props {
  userId: string;
}

export function CustomerOrdersTab({ userId }: Props) {
  const navigate = useNavigate();
  const [showDriverModal, setShowDriverModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<{ id: string; driverName?: string | null } | null>(null);
  const { data: orders, isLoading, refetch } = useQuery({
    queryKey: ['customer-orders', userId],
    queryFn: () => customersService.getCustomerOrders(userId),
  });

  const deleteMutation = useMutation({
    mutationFn: (orderId: string) => ordersService.deleteOrder(orderId),
    onSuccess: () => {
      toast.success('Order deleted successfully');
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const assignMutation = useMutation({
    mutationFn: (driverId: string) => {
      if (!selectedOrder) throw new Error('No order selected');
      return ordersService.assignDriver(selectedOrder.id, driverId);
    },
    onSuccess: (response) => {
      toast.success(response.message || 'Driver assignment updated');
      refetch();
      setShowDriverModal(false);
      setSelectedOrder(null);

      if (response.meta?.previousDriverNotified) {
        toast.success('Previous driver notified to disengage from this order.');
      }
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  return (
    <SkeletonWrapper isLoading={isLoading}>
    <div className="mt-4 w-[700px] bg-white p-6 rounded-lg overflow-x-auto">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-2 py-3 text-left text-[14px] font-medium text-gray-600">Order Id</th>
              <th className="px-2 py-3 text-left text-[14px] font-medium text-gray-600">Customer</th>
              <th className="px-2 py-3 text-left text-[14px] font-medium text-gray-600">Product</th>
              <th className="px-2 py-3 text-left text-[14px] font-medium text-gray-600">Delivery Address</th>
              <th className="px-2 py-3 text-left text-[14px] font-medium text-gray-600">Delivery Driver</th>
              <th className="px-2 py-3 text-left text-[14px] font-medium text-gray-600">Date created</th>
              <th className="px-2 py-3 text-left text-[14px] font-medium text-gray-600">Price</th>
              <th className="px-2 py-3 text-left text-[14px] font-medium text-gray-600">Payment</th>
              <th className="px-2 py-3 text-left text-[14px] font-medium text-gray-600">Status</th>
              <th className="px-2 py-3 text-left text-[14px] font-medium text-gray-600">Assign</th>
              <th className="px-2 py-3 text-left text-[14px] font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {orders?.map((order) => (
              <tr key={order.id}>
                <td className="px-2 py-3 text-[14px]">{order.orderId}</td>
                <td className="px-2 py-3 text-[14px]">{order.customer}</td>
                <td className="px-2 py-3 text-[14px]">{order.product}</td>
                <td className="px-2 py-3 text-[14px] max-w-[200px] truncate">
                  {order.deliveryAddress}
                </td>
                <td className="px-2 py-3 text-[14px]">{order.deliveryDriver}</td>
                <td className="px-2 py-3 text-[14px]">
                  {format(new Date(order.dateCreated), 'dd/MM/yyyy')}
                </td>
                <td className="px-2 py-3 text-[14px]">{order.amountPaid}</td>
                <td className="px-2 py-3 text-[14px]">{order.paymentMethod}</td>
                <td className="px-2 py-3 text-[14px]">
                  <span className={`px-2 py-1 rounded-full text-xs ${statusColors[order.status as keyof typeof statusColors]}`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-2 py-3 text-[14px]">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!['PENDING', 'ASSIGNED', 'ACCEPTED'].includes(order.status)}
                    onClick={() => {
                      setSelectedOrder({ id: order.id, driverName: order.deliveryDriver });
                      setShowDriverModal(true);
                    }}
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
                       <span onClick={() => deleteMutation.mutate(order.orderId)} className="text-sm cursor-pointer text-primary">Delete</span>
                      </PopoverContent>
                    </Popover>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showDriverModal && selectedOrder && (
        <DriverAssignmentModal
          orderId={selectedOrder.id}
          currentDriverName={selectedOrder.driverName}
          onClose={() => {
            setShowDriverModal(false);
            setSelectedOrder(null);
          }}
          onAssign={driverId => assignMutation.mutate(driverId)}
        />
      )}
    </div>
    </SkeletonWrapper>
  );
} 
