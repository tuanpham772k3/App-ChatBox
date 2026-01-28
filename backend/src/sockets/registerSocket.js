import Session from "../modules/auth/session.model.js";
import { authSocket } from "./auth.socket.js";
import { userSocket } from "./user.socket.js";
import { messageSocket } from "./message.socket.js";
import { conversationSocket } from "./conversation.socket.js";
import Conversation from "../modules/conversations/conversation.model.js";
import Message from "../modules/messages/message.model.js";

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
        console.error("Session update failed:", error);
      }

      // Join room user_{userId}
      socket.join(`user_${socket.userId}`);

      try {
        const conversations = await Conversation.find({
          "participants.user": socket.userId,
          isActive: true,
          "lastMessage.sender": { $ne: socket.userId },
        }).select("_id lastMessage");

        const payload = {
          userId: socket.userId,
          status: "online",
          lastSeenAt: new Date(),
        };

        // Broadcast trạng thái online đến các cuộc trò chuyện có tham gia
        conversations.forEach((c) => {
          io.to(`conversation_${c._id}`).emit("user_status_changed", payload);
        });

        // Lặp qua các cuộc trò chuyện để emit delivered cho tin nhắn cuối cùng
        for (const conversation of conversations) {
          const lastMsgId = conversation.lastMessage?._id;
          if (!lastMsgId) continue;

          const message = await Message.findOneAndUpdate(
            {
              _id: lastMsgId,
              status: "sent",
            },
            {
              status: "delivered",
            },
            { new: true }
          );

          if (!message) continue;

          // Emit delivered
          io.to(`user_${message.sender}`).emit("message_delivered", {
            messageId: message._id,
            status: "delivered",
          });
        }
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
