import { Server } from "socket.io";

let io = null;

/**
 * Khởi tạo Socket.IO và lưu singleton
 */
export const initSocket = (server) => {
  io = new Server(server, { cors: { origin: "*" } });
  return io;
};

/**
 * Lấy instance Socket.IO ở bất cứ đâu
 */
export const getSocket = () => {
  if (!io) throw new Error("Socket.IO not initialized. Call initSocket first.");

  return io;
};
