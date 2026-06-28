const { Server } = require("socket.io");
const { registerMessageHandlers } = require("./handlers/message.handler.js");
const { registerConversationHandlers } = require("./handlers/conversation.handler.js");
const { socketAuthMiddleware } = require("./socket.middleware.js");
const { broadcastPresence } = require("./emitters/user.emitter.js");

let io = null;

/**
 * Khởi tạo Socket.IO và lưu singleton
 */
const initSocket = (server) => {
  io = new Server(server, { cors: { origin: "*" } });

  // Auth middleware
  io.use(socketAuthMiddleware);

  // Xử lý connection
  io.on("connection", async (socket) => {
    try {
      console.log(`User connected: ${socket.user.displayName} (${socket.id})`);

      // Join room user_{userId}
      socket.join(`user_${socket.user._id}`);

      try {
        await broadcastPresence(io, socket.user._id, "online");
      } catch (err) {
        console.error("Broadcast online error:", err);
      }

      // Xử lý disconnect
      socket.on("disconnect", async () => {
        try {
          console.log(`User disconnected: ${socket.user?.displayName} (${socket.id})`);

          const userRoom = io.sockets.adapter.rooms.get(`user_${socket.user._id}`);
          const hasAnotherActiveSession = Boolean(userRoom && userRoom.size > 0);

          if (hasAnotherActiveSession) return;

          await broadcastPresence(io, socket.user._id, "offline");
        } catch (err) {
          console.error("disconnect handler error:", {
            userId: socket.user._id,
            error: err,
          });
        }
      });

      // Đăng ký socket handlers
      registerMessageHandlers(io, socket);
      registerConversationHandlers(io, socket);
    } catch (err) {
      console.error("Error in socket connection handler:", err);
      socket.disconnect(true);
    }
  });
};

/**
 * Lấy instance Socket.IO ở bất cứ đâu
 */
const getSocket = () => {
  if (!io) throw new Error("Socket.IO not initialized. Call initSocket first.");

  return io;
};

module.exports = { initSocket, getSocket };
