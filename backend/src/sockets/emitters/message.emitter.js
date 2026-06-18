const {
  emitToUser,
  emitToConversation,
  emitToParticipants,
} = require("../socket.helpers.js");

const buildLastMessagePayload = (conversationId, message) => ({
  conversationId,
  lastMessage: {
    messageId: message._id,
    senderId: {
      _id: message.senderId?._id,
      username: message.senderId?.username,
      avatarUrl: message.senderId?.avatar?.url,
    },
    type: message.type,
    content: message.content || message.file?.filename || message.type || "",
    file: message.file || null,
    createdAt: message.createdAt,
    isDeleted: Boolean(message.isDeleted),
  },
});

const emitMessageEvent = {
  created: ({ io, message, conversation, senderId }) => {
    if (!message || !conversation) return;

    const conversationId = String(conversation._id || message.conversationId);

    emitToParticipants(io, conversation.participants, "message:created", message);

    emitToParticipants(
      io,
      conversation.participants,
      "conversation:last_message_updated",
      buildLastMessagePayload(conversationId, message)
    );

    // Trường hợp đặc biệt: cần payload động cho từng participant để cập nhật unreadCount
    (conversation.participants || []).forEach((participant) => {
      const participantId = String(participant?.userId);

      if (!participantId || participantId === String(senderId)) return;

      emitToUser(io, participantId, "message:unread_updated", {
        conversationId,
        unreadCount: participant?.unreadCount,
        userId: participantId,
      });
    });
  },

  edited: ({ io, message, conversation }) => {
    if (!message || !conversation) return;

    const conversationId = String(conversation._id || message.conversationId);

    emitToConversation(io, conversationId, "message:edited", message);

    const isLastMessage =
      String(conversation.lastMessage?.messageId) === String(message._id);

    if (!isLastMessage) return;

    emitToParticipants(
      io,
      conversation.participants,
      "conversation:last_message_updated",
      buildLastMessagePayload(conversationId, message)
    );
  },

  deleted: ({ io, messageId, conversationId, conversation, lastMessage }) => {
    emitToConversation(io, conversationId, "message:deleted", messageId);

    if (!conversation || !lastMessage) return;

    emitToParticipants(
      io,
      conversation.participants,
      "conversation:last_message_updated",
      buildLastMessagePayload(conversationId, lastMessage)
    );
  },
};

module.exports = {
  emitMessageEvent,
};
