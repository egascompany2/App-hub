import { useQuery } from "@tanstack/react-query";
import { OrdersTable } from "../components/OrdersTable";
import { ordersService } from "../services/orders";
import SkeletonWrapper from "@/components/SkeletonWrapper";

export function Orders() {
  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: ordersService.getOrders,
  });

  const totalOrders = orders?.length || 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-semibold">Orders({totalOrders})</h1>
      </div>
      <SkeletonWrapper isLoading={isLoading}>
        <OrdersTable orders={orders} />
      </SkeletonWrapper>
    </div>
  );
}