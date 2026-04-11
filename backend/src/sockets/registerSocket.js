const Conversation = require("../modules/conversations/conversation.model.js");
const Message = require("../modules/messages/message.model.js");
const { authSocket } = require("./auth.socket.js");
const { userSocket } = require("./user.socket.js");
const { messageSocket } = require("./message.socket.js");
const { conversationSocket } = require("./conversation.socket.js");

/**
 * Đăng ký middleware auth, và xử lý connection/disconnect chung ở đây.
 * Đây là nơi cập nhật Session/socketId và broadcast online/offline.
 */
const registerSocket = (io) => {
  // Auth middleware
  authSocket(io);

  // Xử lý connection
  io.on("connection", async (socket) => {
    try {
      console.log(`User connected: ${socket.user.username} (${socket.id})`);

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

module.exports = { registerSocket };
