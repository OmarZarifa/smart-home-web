import { io } from "socket.io-client";

export const socket = io(import.meta.env.VITE_WS_URL || "ws://localhost:5001", {
  autoConnect: true,
  transports: ['websocket'],
}); 