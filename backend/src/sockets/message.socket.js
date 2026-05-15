const Message = require("../modules/messages/message.model.js");
const Conversation = require("../modules/conversations/conversation.model.js");

const messageSocket = (io, socket) => {
  socket.on("typing_start", ({ conversationId }) => {
    if (!conversationId) return;
    socket.to(`conversation_${conversationId}`).emit("user_typing", {
      userId: socket.userId,
      conversationId,
    });
  });

  socket.on("typing_stop", ({ conversationId }) => {
    if (!conversationId) return;
    socket.to(`conversation_${conversationId}`).emit("user_stop_typing", {
      userId: socket.userId,
      conversationId,
    });
  });

  socket.on("message_delivered", async ({ messageId, conversationId }) => {
    try {
      const isParticipant = await Conversation.exists({
        _id: conversationId,
        "participants.userId": socket.userId,
        isActive: true,
      });

      if (!isParticipant) return;

      const message = await Message.findOneAndUpdate(
        {
          _id: messageId,
          conversationId,
          senderId: { $ne: socket.userId },
          status: "sent",
        },
        { status: "delivered" },
        { new: true }
      );

      if (!message) return;

      // Emit status update
      io.to(`user_${message.senderId}`).emit("message_delivered", {
        messageId: messageId,
        status: "delivered",
      });
    } catch (err) {
      console.error("Error updating message status to delivered:", err);
    }
  });
};

module.exports = { messageSocket };
