import io, { Socket } from "socket.io-client";
import { SOCKET_URL } from "@/config";
import { tokenService } from "./token";
import { Order } from "../types/order";

interface LocationUpdate {
  orderId: string;
  driverLocation: {
    latitude: number;
    longitude: number;
  };
}

class DriverSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  async connect(driverId: string) {
    if (this.socket?.connected) return this.socket;

    const tokens = await tokenService.getTokens();
    
    this.socket = io(SOCKET_URL, {
      auth: { token: tokens?.accessToken },
      query: { driverId },
      transports: ["websocket"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: this.maxReconnectAttempts,
      rejectUnauthorized: false,
      timeout: 10000
    });

    this.setupEventListeners();
    return this.socket;
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      console.log("Socket connected successfully");
      this.reconnectAttempts = 0;
    });

    this.socket.on("connect_error", (error: any) => {
      console.error("Socket connection error:", error.message);
      console.error("Error details:", error);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error("Max reconnection attempts reached");
        this.disconnect();
      }
    });

    this.socket.on("error", (error: any) => {
      console.error("Socket error:", error);
    });

    this.socket.on("disconnect", (reason: any) => {
      console.log("Socket disconnected:", reason);
    });
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  subscribeToNewOrders(
    callback: (order: Order | { orderId: string; status: string }) => void,
    onReassignment?: (payload: { orderId: string; newDriverId: string; newDriverName?: string }) => void
  ) {
    if (!this.socket) {
      console.warn("Socket not connected");
      return () => {};
    }

    this.socket.off("newOrder");
    this.socket.off("orderUpdate");
    this.socket.off("orderReassignment");

    const newOrderHandler = (order: Order) => {
      console.log("New order received:", order);
      callback(order);
    };

    const updateHandler = (update: { orderId: string; status: string }) => {
      console.log("Order update received:", update);
      callback(update as any);
    };

    const reassignmentHandler = (payload: { orderId: string; newDriverId: string; newDriverName?: string }) => {
      console.log("Order reassignment received:", payload);
      onReassignment?.(payload);
    };

    this.socket.on("newOrder", newOrderHandler);
    this.socket.on("orderUpdate", updateHandler);
    this.socket.on("orderReassignment", reassignmentHandler);

    return () => {
      this.socket?.off("newOrder", newOrderHandler);
      this.socket?.off("orderUpdate", updateHandler);
      this.socket?.off("orderReassignment", reassignmentHandler);
    };
  }

  unsubscribeFromNewOrders() {
    if (!this.socket) return;
    this.socket.off("newOrder");
    this.socket.off("orderUpdate");
    this.socket.off("orderReassignment");
  }

  emitLocationUpdate(update: LocationUpdate) {
    if (!this.socket?.connected) {
      console.warn("Socket not connected, location update skipped");
      return;
    }

    this.socket.emit("driver:location", update);
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const socketService = new DriverSocketService();
