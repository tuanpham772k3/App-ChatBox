const { Server } = require("socket.io");

let io = null;

/**
 * Khởi tạo Socket.IO và lưu singleton
 */
const initSocket = (server) => {
  io = new Server(server, { cors: { origin: "*" } });
  return io;
};

/**
 * Lấy instance Socket.IO ở bất cứ đâu
 */
const getSocket = () => {
  if (!io) throw new Error("Socket.IO not initialized. Call initSocket first.");

  return io;
};

module.exports = { initSocket, getSocket };
