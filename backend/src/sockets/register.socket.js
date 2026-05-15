const Conversation = require("../modules/conversations/conversation.model.js");
const Message = require("../modules/messages/message.model.js");
const { authSocket } = require("./auth.socket.js");
const { disconnectSocket } = require("./disconnect.socket.js");
const { messageSocket } = require("./message.socket.js");
const { conversationSocket } = require("./conversation.socket.js");
const { broadcastPresence } = require("./presence.socket.js");

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
        await broadcastPresence(io, socket.userId, "online");

        const conversations = await Conversation.find({
          "participants.userId": socket.userId,
          isActive: true,
        }).select("lastMessage");

        const conversationIds = conversations.map((c) => c._id);

        if (conversationIds.length > 0) {
          const filter = {
            conversationId: { $in: conversationIds },
            senderId: { $ne: socket.userId },
            status: "sent",
          };

          const pendingMessages = await Message.find(filter).select("_id senderId");

          if (pendingMessages.length > 0) {
            await Message.updateMany(filter, { $set: { status: "delivered" } });

            pendingMessages.forEach((message) => {
              io.to(`user_${message.senderId}`).emit("message_delivered", {
                messageId: message._id,
                status: "delivered",
              });
            });
          }
        }
      } catch (err) {
        console.error("Broadcast online error:", err);
      }

      // Xử lý disconnect
      disconnectSocket(io, socket);

      // Đăng ký socket handlers
      messageSocket(io, socket);
      conversationSocket(io, socket);
    } catch (err) {
      console.error("Error in socket connection handler:", err);
      socket.disconnect(true);
    }
  });
};

module.exports = { registerSocket };
