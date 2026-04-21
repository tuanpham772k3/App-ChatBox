const User = require("../modules/users/user.model.js");
const Conversation = require("../modules/conversations/conversation.model.js");

const userSocket = (io, socket) => {
  // Xử lý disconnect
  socket.on("disconnect", async () => {
    try {
      console.log(`User disconnected: ${socket.user?.username} (${socket.id})`);

      await User.findByIdAndUpdate(socket.userId, {
        lastSeenAt: new Date(),
      });

      const conversations = await Conversation.find({
        "participants.user": socket.userId,
        isActive: true,
      }).select("participants.user");

      const relatedUserIds = new Set();

      conversations.forEach((c) => {
        c.participants.forEach((p) => {
          const id = p.user.toString();
          if (id !== socket.userId) {
            relatedUserIds.add(id);
          }
        });
      });

      await User.findByIdAndUpdate(socket.userId, {
        presence: "offline",
        lastSeenAt: new Date(),
      });

      // Tạo payload trạng thái offline
      const payload = {
        userId: socket.userId,
        presence: "offline",
        lastSeenAt: new Date(),
      };

      // Offline: Cập nhật trạng thái user
      relatedUserIds.forEach((userId) => {
        io.to(`user_${userId}`).emit("user_status_changed", payload);
      });
    } catch (err) {
      console.error("disconnect handler error:", {
        userId: socket.userId,
        error: err,
      });
    }
  });
};

module.exports = { userSocket };
