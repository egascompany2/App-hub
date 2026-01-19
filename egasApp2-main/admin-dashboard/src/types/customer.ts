export interface CustomerDetails {
    id: string;
    name: string;
    phoneNumber: string;
    currentAddress: string;
    gasSize: string;
    isActive: boolean;
    recentActivity: {
      date: string;
      action: "CANCELLED" | "ASSIGNED" | "PLACED" | "DELIVERED"; // Extend as needed
      time: string;
    }[];
    stats: {
      cancelledOrders: number;
      completedOrders: number;
      totalOrders: number;
    };
  }
  