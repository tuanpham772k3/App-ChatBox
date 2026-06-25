const emitToUser = (io, userId, event, payload) => {
  if (!io || !userId) return;

  io.to(`user_${userId}`).emit(event, payload);
};

const emitRelationshipEvent = {
  friendRequestReceived: ({ io, recipientId, relationship }) => {
    console.log("friend_request_received:", relationship);

    emitToUser(io, recipientId, "relationship:friend_request_received", relationship);
  },

  friendRequestSent: ({ io, requesterId, relationship }) => {
    emitToUser(io, requesterId, "relationship:friend_request_sent", relationship);
  },

  friendRequestAccepted: ({ io, requesterId, recipientId, relationship }) => {
    emitToUser(io, requesterId, "relationship:friend_request_accepted", relationship);
    emitToUser(io, recipientId, "relationship:friend_request_received", relationship);
  },

  friendRequestRejected: ({ io, requesterId, recipientId, relationshipId }) => {
    emitToUser(io, requesterId, "relationship:friend_request_rejected", {
      relationshipId,
    });

    emitToUser(io, recipientId, "relationship:friend_request_rejected", {
      relationshipId,
    });
  },

  friendRequestCancelled: ({ io, requesterId, recipientId, relationshipId }) => {
    emitToUser(io, requesterId, "relationship:friend_request_cancelled", {
      relationshipId,
    });

    emitToUser(io, recipientId, "relationship:friend_request_cancelled", {
      relationshipId,
    });
  },

  friendRemoved: ({ io, requesterId, recipientId, relationshipId }) => {
    emitToUser(io, requesterId, "relationship:friend_removed", { relationshipId });
    emitToUser(io, recipientId, "relationship:friend_removed", { relationshipId });
  },

  userBlocked: ({ io, blockerId, blockedUserId, relationship }) => {
    emitToUser(io, blockerId, "relationship:user_blocked", relationship);
    emitToUser(io, blockedUserId, "relationship:user_blocked", relationship);
  },

  userUnblocked: ({ io, userId, relationshipId }) => {
    emitToUser(io, userId, "relationship:user_unblocked", {
      relationshipId,
    });
  },
};

module.exports = { emitRelationshipEvent };
