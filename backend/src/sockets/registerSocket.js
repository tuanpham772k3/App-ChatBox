import Session from "../modules/auth/session.model.js";
import { authSocket } from "./auth.socket.js";
import { userSocket } from "./user.socket.js";
import { messageSocket } from "./message.socket.js";
import { conversationSocket } from "./conversation.socket.js";
import Conversation from "../modules/conversations/conversation.model.js";

/**
 * Đăng ký middleware auth, và xử lý connection/disconnect chung ở đây.
 * Đây là nơi cập nhật Session/socketId và broadcast online/offline.
 */
export const registerSocket = (io) => {
  // Auth middleware
  authSocket(io);

  // Xử lý connection
  io.on("connection", async (socket) => {
    try {
      console.log(`User connected: ${socket.user.username} (${socket.id})`);

      // Cập nhật session: gán socketId
      try {
        await Session.findOneAndUpdate(
          { userId: socket.userId, valid: true },
          { socketId: socket.id }
        );
      } catch (error) {
        console.error("Session update failed:", err);
      }

      // Join room user_{userId}
      socket.join(`user_${socket.userId}`);

      // Online
      try {
        const conversations = await Conversation.find({
          "participants.user": socket.userId,
          isActive: true,
        }).select("_id");

        const payload = {
          userId: socket.userId,
          status: "online",
          lastSeenAt: new Date(),
        };

        conversations.forEach((c) => {
          io.to(`conversation_${c._id}`).emit("user_status_changed", payload);
        });
      } catch (err) {
        console.error("Broadcast online error:", err);
      }

      // Đăng ký các socket handler
      userSocket(io, socket); // Xử lý disconnect
      messageSocket(io, socket);
      conversationSocket(io, socket);
    } catch (err) {
      console.error("Error in socket connection handler:", err);
      socket.disconnect(true);
    }
  });
};
