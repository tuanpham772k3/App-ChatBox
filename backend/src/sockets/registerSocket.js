const Conversation = require("../modules/conversations/conversation.model.js");
const Message = require("../modules/messages/message.model.js");
const { authSocket } = require("./auth.socket.js");
const { userSocket } = require("./user.socket.js");
const { messageSocket } = require("./message.socket.js");
const { conversationSocket } = require("./conversation.socket.js");
const User = require("../modules/users/user.model.js");

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
          presence: "online",
          lastSeenAt: new Date(),
        });

        const payload = {
          userId: socket.userId,
          presence: "online",
          lastSeenAt: new Date(),
        };

        // Broadcast trạng thái online đến các cuộc trò chuyện có tham gia
        relatedUserIds.forEach((userId) => {
          io.to(`user_${userId}`).emit("user_status_changed", payload);
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
