import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ordersService } from "../services/orders";
import { toast } from "react-hot-toast";
import { format } from "date-fns";
import { useState } from "react";
import { Button } from "./ui/button";
import SkeletonWrapper from "./SkeletonWrapper";
import { ConfirmationModal } from "./ConfirmationModal";
import { DriverAssignmentModal } from "./DriverAssignmentModal";
import { OrderDetails as OrderDetailsType } from "@/types/order";
const statusColors = {
  PENDING: "bg-yellow-100 text-yellow-700",
  ASSIGNED: "bg-blue-100 text-blue-700",
  ACCEPTED: "bg-purple-100 text-purple-700",
  IN_TRANSIT: "bg-indigo-100 text-indigo-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export function OrderDetails({ orderId }: { orderId: string }) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showDriverModal, setShowDriverModal] = useState(false);
  const queryClient = useQueryClient();

  const { data: _orderDetails, isLoading, refetch } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => ordersService.getOrderDetails(orderId),
  });

  const formattedOrderDetails = _orderDetails as OrderDetailsType;

  const assignMutation = useMutation({
    mutationFn: (driverId: string) => ordersService.assignDriver(orderId, driverId),
    onSuccess: (response) => {
      toast.success(response.message || "Driver assignment updated");
      queryClient.invalidateQueries({ queryKey: ["order", orderId] });
      setShowDriverModal(false);
      refetch();

      if (response.meta?.previousDriverNotified) {
        toast.success("Previous driver notified to disengage from this order.");
      }
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const canAssign = ["PENDING", "ASSIGNED", "ACCEPTED"].includes(
    formattedOrderDetails?.status ?? ""
  );

  const cancelMutation = useMutation({
    mutationFn: () => ordersService.cancelOrder(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order", orderId] });
      toast.success("Order cancelled successfully");
    },
    onError: error => {
      toast.error(error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => ordersService.deleteOrder(orderId),
    onSuccess: () => {
      toast.success("Order deleted successfully");
      // Navigate back to orders list
      window.history.back();
    },
    onError: error => {
      toast.error(error.message);
    },
  });

  // if (!orderDetails) return null;

  const handleAssign = () => {
    setShowDriverModal(true);
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const handleCancel = () => {
    setShowCancelModal(true);
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Header section with status and actions */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-4">
          <SkeletonWrapper isLoading={isLoading}>
          <h1 className="text-xl font-semibold">Order {formattedOrderDetails?.id}</h1>
          </SkeletonWrapper>
          <SkeletonWrapper isLoading={isLoading}>
          <span
            className={`px-3 py-1 rounded-full text-sm ${
              statusColors[formattedOrderDetails?.status]
            }`}
          >
            {formattedOrderDetails?.status}
          </span>
          </SkeletonWrapper>
        </div>
        <div className="flex gap-2">
          <SkeletonWrapper isLoading={isLoading}>
          <Button
            onClick={handleAssign}
            disabled={!canAssign || assignMutation.isPending}
            className="px-4 py-2 bg-transparent text-primary text-sm border rounded-lg hover:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-400"
          >
            {formattedOrderDetails?.driver ? "Reassign" : "Assign"}
          </Button>
          </SkeletonWrapper>
          <SkeletonWrapper isLoading={isLoading}>
          <Button
            onClick={handleDelete}
            className="px-4 py-2 bg-transparent text-primary text-sm border rounded-lg hover:bg-gray-50"
          >
            Delete
          </Button>
          </SkeletonWrapper>
          <SkeletonWrapper isLoading={isLoading}>
          <Button
            disabled={formattedOrderDetails?.status == "CANCELLED"}
            onClick={handleCancel}
            className="px-4 py-2 bg-transparent text-red-600 text-sm border border-red-600 rounded-lg hover:bg-red-50"
          >
            Cancel order
          </Button>
          </SkeletonWrapper>
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left column */}
        <div className="space-y-6">
          {/* Order Items */}
          <SkeletonWrapper isLoading={isLoading}>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-medium mb-4">Order Items</h2>
            <div className="space-y-3">
              {formattedOrderDetails?.items.map((item, index) => (
                <div key={index} className="flex justify-between">
                  <span>{item.name}</span>
                  <span>₦{item.price.toFixed(2)}</span>
                </div>
              ))}
              <div className="flex justify-between border-t pt-3">
                <span>Shipping fee</span>
                <span>₦{formattedOrderDetails?.shippingFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Total</span>
                <span>₦{formattedOrderDetails?.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
          </SkeletonWrapper>

          {/* Payment Details */}
          <SkeletonWrapper isLoading={isLoading}>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-medium mb-4">Payment Details</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Payment type</span>
                <span>{formattedOrderDetails?.payment.type}</span>
              </div>
              <div className="flex justify-between">
                <span>Payment status</span>
                <span>{formattedOrderDetails?.payment.status}</span>
              </div>
            </div>
          </div>
          </SkeletonWrapper>

          {/* Delivery Address */}
          <SkeletonWrapper isLoading={isLoading}>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-medium mb-4">Delivery Address</h2>
            <p>{formattedOrderDetails?.deliveryAddress}</p>
          </div>
          </SkeletonWrapper>
          {/* Order Status Updates */}
          <SkeletonWrapper isLoading={isLoading}>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-medium mb-4">Order Status Updates</h2>
            <div className="space-y-4">
              {formattedOrderDetails?.statusUpdates.map((update, index) => (
                <div key={index} className="flex justify-between">
                  <div>
                    <p className="text-sm text-gray-600">
                      {update.description}
                    </p>
                    <p className="text-sm">{update.status}</p>
                  </div>
                  <span className="text-sm text-gray-600">
                    {format(new Date(update.timestamp), "MMM d, h:mm a")}
                  </span>
                </div>
              ))}
              </div>
            </div>
          </SkeletonWrapper>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Customer Details */}
          <SkeletonWrapper isLoading={isLoading}>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-medium mb-4">#Customer</h2>
            <p className="mb-2">{formattedOrderDetails?.customer.name}</p>
            <p className="mb-2">{formattedOrderDetails?.customer.phone}</p>
            <p className="mb-3">{formattedOrderDetails?.customer.email}</p>
            <button className="text-sm border border-primary rounded-lg px-4 py-2 text-primary">
              Contact customer
            </button>
          </div>
          </SkeletonWrapper>
          {/* Driver Details */}
          
          {formattedOrderDetails?.driver && (
            <SkeletonWrapper isLoading={isLoading}>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-lg font-medium mb-4">#Driver</h2>
              <p className="mb-2">{formattedOrderDetails?.driver.name}</p>
              <p className="mb-3">{formattedOrderDetails?.driver.phone}</p>
              <button className="text-sm border border-primary rounded-lg px-4 py-2 text-primary">
                Contact driver
              </button>
            </div>
            </SkeletonWrapper>
          )}
        </div>
      </div>

      
      {showDriverModal && (
        <DriverAssignmentModal
          orderId={orderId}
          currentDriverName={formattedOrderDetails?.driver?.name}
          onClose={() => setShowDriverModal(false)}
          onAssign={(driverId) => assignMutation.mutate(driverId)}
        />
      )}

      {showDeleteModal && (
        <ConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={() => deleteMutation.mutate()}
          title="Delete Order"
          description="Are you sure you want to delete this order? This action cannot be undone."
          confirmText="Delete"
          variant="destructive"
        />
      )}

      {showCancelModal && (
        <ConfirmationModal
          isOpen={showCancelModal}
          onClose={() => setShowCancelModal(false)}
          onConfirm={() => cancelMutation.mutate()}
          title="Cancel Order"
          description="Are you sure you want to cancel this order?"
          confirmText="Cancel Order"
          variant="destructive"
        />
      )}


      {/* Driver Assignment Modal */}
    </div>
  );
}
