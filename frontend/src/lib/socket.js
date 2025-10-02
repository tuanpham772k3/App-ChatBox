import { io } from "socket.io-client";

// URL của server Socket.IO
const SOCKET_URL = "http://localhost:8383";

// io() Khởi tạo kết nối socket client đến server
export const socket = io(SOCKET_URL, {
    transports: ["websocket"], // dùng websocket để ổn định hơn
    autoConnect: true, // tự động kết nối khi import
});
