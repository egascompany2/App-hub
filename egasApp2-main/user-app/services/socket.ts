import io, { Socket } from "socket.io-client";
import { SOCKET_URL } from "@/config";
import { tokenService } from "./token";

class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private connectionTimeout = 10000; // 10 seconds timeout

  async connect(userId: string): Promise<Socket> {
    return new Promise(async (resolve, reject) => {
      try {
        if (this.socket?.connected) {
          return resolve(this.socket);
        }

        const tokens = await tokenService.getTokens();
        if (!tokens?.accessToken) {
          throw new Error("No auth token available");
        }

        this.socket = io(SOCKET_URL, {
          auth: { token: tokens.accessToken },
          query: { userId },
          transports: ["websocket"],
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionAttempts: this.maxReconnectAttempts,
          timeout: this.connectionTimeout
        });

        // Set up connection promise
        const timeoutId = setTimeout(() => {
          reject(new Error("Socket connection timeout"));
        }, this.connectionTimeout);

        this.socket.on("connect", () => {
          clearTimeout(timeoutId);
          console.log("Socket connected successfully");
          this.reconnectAttempts = 0;
          resolve(this.socket!);
        });

        this.socket.on("connect_error", (error) => {
          console.error("Socket connection error:", error);
          this.reconnectAttempts++;
          
          if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            clearTimeout(timeoutId);
            reject(new Error("Max reconnection attempts reached"));
          }
        });

      } catch (error) {
        reject(error);
      }
    });
  }

  async subscribeToOrder(orderId: string, callbacks: {
    onLocationUpdate: (update: any) => void;
    onStatusUpdate: (update: any) => void;
  }) {
    if (!this.socket?.connected) {
      throw new Error("Socket not connected");
    }

    console.log(`Subscribing to order updates for order: ${orderId}`);
    this.socket.emit("join:order", orderId);

    this.socket.on("driverLocationUpdate", callbacks.onLocationUpdate);
    this.socket.on("orderUpdate", callbacks.onStatusUpdate);
  }

  unsubscribeFromOrder(orderId: string) {
    if (!this.socket?.connected) return;

    this.socket.emit("leave:order", orderId);
    this.socket.off("driverLocationUpdate");
    this.socket.off("orderUpdate");
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const socketService = new SocketService(); 