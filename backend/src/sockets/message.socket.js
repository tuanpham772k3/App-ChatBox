const Message = require("../modules/messages/message.model.js");
const Conversation = require("../modules/conversations/conversation.model.js");
const {
  emitConversationDelivered,
  emitConversationRead,
} = require("./realtime.emitter.js");

const shouldAdvanceReceiptPointer = (currentAt, nextAt) => {
  if (!nextAt) return false;
  if (!currentAt) return true;
  return new Date(nextAt).getTime() > new Date(currentAt).getTime();
};

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

  socket.on("message_delivered", async ({ messageId }) => {
    try {
      if (!messageId) return;

      const message = await Message.findOne({
        _id: messageId,
        senderId: { $ne: socket.userId },
      })
        .select("_id conversationId createdAt")
        .lean();

      if (!message) return;

      const conversation = await Conversation.findOne({
        _id: message.conversationId,
        "participants.userId": socket.userId,
        isActive: true,
      }).select("participants");

      if (!conversation) return;

      const participant = conversation.participants.find((p) =>
        p.userId?.equals(socket.userId)
      );

      if (!participant) return;

      if (!shouldAdvanceReceiptPointer(participant.lastDeliveredAt, message.createdAt)) {
        return;
      }

      participant.lastDeliveredAt = message.createdAt;

      await conversation.save();

      emitConversationDelivered({
        io,
        conversationId: String(message.conversationId),
        userId: String(socket.userId),
        lastDeliveredAt: message.createdAt,
        participants: conversation.participants,
      });
    } catch (err) {
      console.error("Error updating delivered pointer:", err);
    }
  });

  socket.on("message_read", async ({ messageId }) => {
    try {
      if (!messageId) return;

      const message = await Message.findOne({ _id: messageId })
        .select("_id conversationId createdAt")
        .lean();

      if (!message) return;

      const conversation = await Conversation.findOne({
        _id: message.conversationId,
        "participants.userId": socket.userId,
        isActive: true,
      }).select("participants");

      if (!conversation) return;

      const participant = conversation.participants.find((p) =>
        p.userId?.equals(socket.userId)
      );

      if (!participant) return;

      if (!shouldAdvanceReceiptPointer(participant.lastReadAt, message.createdAt)) {
        return;
      }

      participant.lastReadAt = message.createdAt;
      participant.unreadCount = 0;

      await conversation.save();

      emitConversationRead({
        io,
        conversationId: String(message.conversationId),
        userId: String(socket.userId),
        lastReadAt: message.createdAt,
        participants: conversation.participants,
      });
    } catch (err) {
      console.error("Error updating read pointer:", err);
    }
  });
};

module.exports = { messageSocket };
