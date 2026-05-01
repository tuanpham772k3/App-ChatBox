const { broadcastPresence } = require("./presence.socket.js");

const disconnectSocket = (io, socket) => {
  // Xử lý disconnect
  socket.on("disconnect", async () => {
    try {
      console.log(`User disconnected: ${socket.user?.username} (${socket.id})`);

      const userRoom = io.sockets.adapter.rooms.get(`user_${socket.userId}`);
      const hasAnotherActiveSession = Boolean(userRoom && userRoom.size > 0);

      if (hasAnotherActiveSession) return;

      await broadcastPresence(io, socket.userId, "offline");
    } catch (err) {
      console.error("disconnect handler error:", {
        userId: socket.userId,
        error: err,
      });
    }
  });
};

module.exports = { disconnectSocket };
