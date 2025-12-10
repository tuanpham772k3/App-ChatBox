// user.socket.js
import User from "../modules/users/user.model.js";
import Session from "../modules/auth/session.model.js";
import Conversation from "../modules/conversations/conversation.model.js";

export const userSocket = (io, socket) => {
  // already joined user_{id} in registerSocket
  socket.on("disconnect", async () => {
    try {
      console.log(`User disconnected: ${socket.user?.username} (${socket.id})`);

      // Cập nhật user offline
      await User.findByIdAndUpdate(socket.userId, {
        status: "inactive",
        lastSeenAt: new Date(),
      });

      // Xóa socketId trong session (nếu có)
      await Session.findOneAndUpdate(
        { userId: socket.userId, socketId: socket.id },
        { $unset: { socketId: 1 } }
      );

      // Phát tin trạng thái người dùng đến toàn bộ conver mà người dùng tham gia
      const conversations = await Conversation.find({
        "participants.user": socket.userId,
        isActive: true,
      }).select("_id");

      const payload = {
        userId: socket.userId,
        status: "offline",
        lastSeenAt: new Date(),
      };

      conversations.forEach((c) => {
        io.to(`conversation_${c._id}`).emit("user_status_changed", payload);
      });
    } catch (err) {
      console.error("disconnect handler error:", {
        userId: socket.userId,
        error: err,
      });
    }
  });
};
