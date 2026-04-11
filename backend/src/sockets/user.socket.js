const User = require("../modules/users/user.model.js");
const Conversation = require("../modules/conversations/conversation.model.js");

const userSocket = (io, socket) => {
  // Xử lý disconnect
  socket.on("disconnect", async () => {
    try {
      console.log(`User disconnected: ${socket.user?.username} (${socket.id})`);

      await User.findByIdAndUpdate(socket.userId, {
        status: "inactive",
        lastSeenAt: new Date(),
      });

      const conversations = await Conversation.find({
        "participants.user": socket.userId,
        isActive: true,
      }).select("_id");

      // Tạo payload trạng thái offline
      const payload = {
        userId: socket.userId,
        status: "offline",
        lastSeenAt: new Date(),
      };

      // Offline: Cập nhật trạng thái user
      conversations.forEach((conversation) => {
        io.to(`conversation_${conversation._id}`).emit("user_status_changed", payload);
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
