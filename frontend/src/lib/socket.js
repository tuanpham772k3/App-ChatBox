import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:8383";

let socket = null;

export const initSocket = (token) => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }

  socket = io(SOCKET_URL, {
    autoConnect: false,
    transports: ["websocket"],
    auth: { token },
  });

  socket.on("connect", () => {
    console.log("✅ Socket connected:", socket.id);
  });

  socket.on("disconnect", (reason) => {
    console.log("❌ Socket disconnected:", reason);
  });

  socket.on("connect_error", (err) => {
    console.error("⚠️ Socket connection error:", err.message);
  });

  return socket;
};

export const connectSocket = () => {
  if (socket && !socket.connected) socket.connect();
};

export const disconnectSocket = () => {
  if (socket) {
    socket?.disconnect();
    socket = null;
  }
};

export const emitEvent = (event, data) => {
  socket?.emit(event, data);
};

export const onEvent = (event, callback) => {
  socket?.on(event, callback);
};

export const offEvent = (event, callback) => {
  socket?.off(event, callback);
};

export const isSocketConnected = () => socket?.connected ?? false;
