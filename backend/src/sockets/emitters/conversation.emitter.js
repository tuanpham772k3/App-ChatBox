const {
  emitToParticipants,
  emitToUser,
  emitToConversation,
} = require("../socket.helpers.js");

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

  messageSeenUpdated: ({ io, userId, conversationId, lastReadAt }) => {
    const payload = {
      conversationId,
      userId,
      lastReadAt,
    };

    emitToConversation(io, conversationId, "message:seen_updated", payload);
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

  left: ({ io, userId, conversationId, participants }) => {
    const payload = {
      conversationId,
      userId,
    };

    emitToParticipants(io, participants, "conversation:member_left", payload);
  },

  addedMembers: ({ io, conversation, newMembers, participants }) => {
    emitToParticipants(io, participants, "conversation:members_added", conversation);

    emitToParticipants(io, newMembers, "conversation:created", conversation);
  },

  removedMember: ({ io, conversation, participants, memberId }) => {
    emitToParticipants(io, participants, "conversation:member_removed", conversation);

    emitToUser(io, memberId, "conversation:deleted", conversation._id);
  },
};

module.exports = {
  emitConversationEvent,
};
