import { io } from "socket.io-client";

// URL backend
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:8383";

let socket = null;
let connected = false;

// Khởi tạo socket với token
export const initSocket = (token) => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false, // Không tự động kết nối
      transports: ["websocket"], // Chỉ sử dụng WebSocket
      auth: { token }, // Gửi token để xác thực
    });

    socket.on("connect", () => {
      connected = true;
      console.log("✅ Socket connected:", socket.id);
    });

    socket.on("disconnect", (reason) => {
      connected = false;
      console.log("❌ Socket disconnected:", reason);
    });

    socket.on("connect_error", (err) => {
      console.error("⚠️ Socket connection error:", err.message);
    });
  }

  return socket;
};

// Connect socket
export const connectSocket = () => {
  if (socket && !connected) socket.connect();
};

// Disconnect socket
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    connected = false;
  }
};

// Emit sự kiện qua socket
export const emitEvent = (event, data) => {
  if (connected) {
    socket.emit(event, data);
  } else {
    console.warn("Socket not connected, cannot emit:", event);
  }
};

// Lắng nghe sự kiện từ socket
export const onEvent = (event, callback) => {
  socket?.on(event, callback);
};

// Off sự kiện từ socket
export const offEvent = (event, callback) => {
  socket?.off(event, callback);
};

export const isSocketConnected = () => connected;
