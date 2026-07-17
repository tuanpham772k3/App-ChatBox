const {
  emitToUser,
  emitToConversation,
  emitToParticipants,
} = require("../socket.helpers.js");

const emitMessageEvent = {
  created: ({ io, message, conversation, senderId }) => {
    if (!message || !conversation) return;

    const conversationId = String(conversation._id || message.conversationId);
    const lastMessage = conversation.lastMessage;
    const participants = conversation.participants || [];

    emitToParticipants(io, participants, "message:created", message);

    emitToParticipants(io, participants, "conversation:last_message_updated", {
      conversationId,
      lastMessage,
    });

    // Trường hợp đặc biệt: cần payload động cho từng participant để cập nhật unreadCount
    participants.forEach((participant) => {
      const participantId = String(participant?.userId);

      if (!participantId || participantId === String(senderId)) return;

      emitToUser(io, participantId, "message:unread_updated", {
        conversationId,
        unreadCount: participant?.unreadCount,
        userId: participantId,
      });
    });
  },

  edited: ({ io, message, editBy, participants, lastMessage, isLastMessage }) => {
    if (!message) return;

    const conversationId = String(message.conversationId);

    emitToConversation(io, conversationId, "message:edited", { message, editBy });

    if (!isLastMessage) return;

    emitToParticipants(io, participants, "conversation:last_message_updated", {
      conversationId,
      lastMessage,
    });
  },

  deleted: ({
    io,
    messageId,
    conversationId,
    deletedBy,
    participants,
    lastMessage,
    isLastMessage,
  }) => {
    emitToConversation(io, conversationId, "message:deleted", { messageId, deletedBy });

    if (!isLastMessage) return;

    emitToParticipants(io, participants, "conversation:last_message_updated", {
      conversationId,
      lastMessage,
    });
  },
};

module.exports = {
  emitMessageEvent,
};
