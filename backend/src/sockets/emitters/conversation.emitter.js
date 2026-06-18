// conversation.emitter.js

const { emitToConversation, emitToParticipants } = require("../socket.helpers.js");

const emitConversationEvent = {
  created: ({ io, conversation }) => {
    if (!conversation) return;

    emitToParticipants(
      io,
      conversation.participants,
      "conversation:created",
      conversation
    );
  },

  messageSeenUpdated: ({ io, conversationId, userId, lastReadAt, participants }) => {
    const payload = {
      conversationId,
      userId,
      lastReadAt,
    };

    emitToConversation(io, conversationId, "message:seen_updated", payload);

    emitToParticipants(io, participants, "message:seen_updated", payload);
  },

  messageDeliveredUpdated: ({
    io,
    conversationId,
    userId,
    lastDeliveredAt,
    participants,
  }) => {
    const payload = {
      conversationId,
      userId,
      lastDeliveredAt,
    };

    emitToConversation(io, conversationId, "message:delivered_updated", payload);

    emitToParticipants(io, participants, "message:delivered_updated", payload);
  },
};

module.exports = {
  emitConversationEvent,
};
