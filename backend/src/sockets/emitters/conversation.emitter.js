// conversation.emitter.js

const { emitToParticipants } = require("../socket.helpers.js");

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

    emitToParticipants(io, participants, "message:delivered_updated", payload);
  },
};

module.exports = {
  emitConversationEvent,
};
