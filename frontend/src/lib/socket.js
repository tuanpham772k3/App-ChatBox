import { io } from "socket.io-client";
import { useSelector } from "react-redux";

// URL backend
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:8383";

// Lấy accessToken
const { accessToken } = useSelector((state) => state.auth);

// Tạo instance socket
const socket = io(SOCKET_URL, {
  autoConnect: false, // Đợi login mới kết nối
  transports: ["websocket"], // Dùng websocket để giảm độ trễ
  auth: { accessToken }, // Gửi kèm token trong handShake
  reconnectionAttempts: 5, // Nếu mất kết nối thử lại 5 lần
  reconnectionDelay: 1000, // Delay 1s mỗi lần reconnect
});

// Hàm tiện ích để quản lý kêt nối
export const connectSocket = (accessToken) => {
  socket.auth = { accessToken };
  socket.connect();
};

export const disconnectSocket = () => {
  socket.disconnect();
};

export default socket;
