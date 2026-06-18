const Message = require("../../modules/messages/message.model.js");
const Conversation = require("../../modules/conversations/conversation.model.js");
const { emitConversationEvent } = require("../emitters/conversation.emitter.js");

const shouldAdvanceReceiptPointer = (currentAt, nextAt) => {
  if (!nextAt) return false;
  if (!currentAt) return true;

  return new Date(nextAt).getTime() > new Date(currentAt).getTime();
};

const registerMessageHandlers = (io, socket) => {
  // Delivered receipt
  const handleMarkDelivered = async ({ messageId }) => {
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

      emitConversationEvent.messageDeliveredUpdated({
        io,
        conversationId: String(message.conversationId),
        userId: String(socket.userId),
        lastDeliveredAt: message.createdAt,
        participants: conversation.participants,
      });
    } catch (error) {
      console.error("Error updating delivered pointer:", error);
    }
  };

  // Read receipt
  const handleMarkSeen = async ({ messageId }) => {
    try {
      if (!messageId) return;

      const message = await Message.findById(messageId)
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

      emitConversationEvent.messageSeenUpdated({
        io,
        conversationId: String(message.conversationId),
        userId: String(socket.userId),
        lastReadAt: message.createdAt,
        participants: conversation.participants,
      });
    } catch (error) {
      console.error("Error updating read pointer:", error);
    }
  };

  // Register events
  socket.on("message:mark_delivered", handleMarkDelivered);
  socket.on("message:mark_seen", handleMarkSeen);
};

module.exports = { registerMessageHandlers };
