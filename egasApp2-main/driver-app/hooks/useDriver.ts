import {
  useMutation,
  useQuery,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import {
  driverService,
  UpdateLocationPayload,
  DocumentUpload,
} from "../services/driver";
import { api } from "@/lib/api";

export const driverKeys = {
  all: ["driver"] as const,
  orders: ["driver", "orders"] as const,
  current: ["driver", "orders", "current"] as const,
  ongoing: ["driver", "orders", "ongoing"] as const,
  history: ["driver", "orders", "history"] as const,
  detail: (id: string) => [...driverKeys.all, "detail", id] as const,
};

export function useUpdateLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateLocationPayload) =>
      driverService.updateLocation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: driverKeys.all });
    },
  });
}

export function useCurrentOrders() {
  return useQuery({
    queryKey: driverKeys.current,
    queryFn: () => driverService.getCurrentOrders(),
  });
}

export function useOngoingOrders() {
  return useQuery({
    queryKey: driverKeys.ongoing,
    queryFn: () => driverService.getOngoingOrders(),
  });
}

export function useOrderHistory() {
  return useInfiniteQuery({
    queryKey: ["orderHistory"],
    queryFn: async ({ pageParam = 1 }) => {
      try {
        const response = await api.get(`/driver/orders/history`, {
          params: {
            page: pageParam,
            limit: 10,
          },
        });

        return {
          orders: response.data.orders,
          pagination: response.data.pagination,
        };
      } catch (error: any) {
        console.error("Order history fetch error:", error);
        if (error.response) {
          console.log("Error response:", error.response.data);
        }
        throw error;
      }
    },
    getNextPageParam: lastPage => {
      if (!lastPage?.pagination) return undefined;

      const { page, pages } = lastPage.pagination;
      if (page < pages) {
        return page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
}

export function useAcceptOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId: string) => driverService.acceptOrder(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: driverKeys.all });
    },
  });
}

export function useDeclineOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId: string) => driverService.declineOrder(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: driverKeys.all });
    },
  });
}

export function useUploadDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (document: DocumentUpload) =>
      driverService.uploadDocument(document),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: driverKeys.all });
    },
  });
}

export function useUpdateAvailability() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (isAvailable: boolean) =>
      driverService.updateAvailability(isAvailable),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: driverKeys.all });
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { vehicleType?: string; vehiclePlate?: string }) =>
      driverService.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: driverKeys.all });
    },
  });
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => driverService.deleteAccount(),
    onSuccess: () => {
      queryClient.clear(); // Clear all queries on account deletion
    },
  });
}
