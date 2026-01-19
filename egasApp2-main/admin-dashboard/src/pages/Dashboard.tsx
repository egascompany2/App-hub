import { useQuery } from '@tanstack/react-query';
import { StatCard } from '../components/StatCard';
import { RecentOrdersTable } from '../components/RecentOrdersTable';
import { dashboardService } from '../services/dashboard';
import SkeletonWrapper from '@/components/SkeletonWrapper';

export function Dashboard() {
  const { data: stats, isLoading: isStatsLoading, isRefetching: isStatsRefetching } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: dashboardService.getStats
  });

  const { data: recentOrders, isLoading: isOrdersLoading, isRefetching: isOrdersRefetching } = useQuery({
    queryKey: ['recentOrders'],
    queryFn: dashboardService.getRecentOrders
  });


  return (
    <>
      <h1 className="text-2xl font-semibold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
        <SkeletonWrapper isLoading={isStatsLoading || isStatsRefetching}>
          <StatCard title="Total Orders" value={stats?.totalOrders.toString() || '0'} />
        </SkeletonWrapper>
        <SkeletonWrapper isLoading={isStatsLoading || isStatsRefetching}>
          <StatCard title="Active Orders" value={stats?.activeOrders.toString() || '0'} />
        </SkeletonWrapper>
        <SkeletonWrapper isLoading={isStatsLoading || isStatsRefetching}>
          <StatCard title="Completed Orders" value={stats?.completedOrders.toString() || '0'} />
        </SkeletonWrapper>
        <SkeletonWrapper isLoading={isStatsLoading || isStatsRefetching}>
          <StatCard title="Canceled Orders" value={stats?.canceledOrders.toString() || '0'} />
        </SkeletonWrapper>
      </div>
      
      <SkeletonWrapper isLoading={isOrdersLoading || isOrdersRefetching}>
        <RecentOrdersTable orders={recentOrders || []} />
      </SkeletonWrapper>
    </>
  );
}