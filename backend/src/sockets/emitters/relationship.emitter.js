const { emitToUser } = require("../socket.helpers");

const emitRelationshipEvent = {
  friendRequestReceived: ({ io, recipientId, payload }) => {
    emitToUser(io, recipientId, "relationship:friend_request_received", payload);
  },

  friendRequestAccepted: ({ io, requesterId, payload }) => {
    emitToUser(io, requesterId, "relationship:friend_request_accepted", payload);
  },

  friendRequestRejected: ({ io, requesterId, relationshipId }) => {
    emitToUser(io, requesterId, "relationship:friend_request_rejected", {
      relationshipId,
    });
  },

  friendRequestCancelled: ({ io, recipientId, relationshipId }) => {
    emitToUser(io, recipientId, "relationship:friend_request_cancelled", {
      relationshipId,
    });
  },

  friendRemoved: ({ io, unfriendedUserId, relationshipId }) => {
    emitToUser(io, unfriendedUserId, "relationship:friend_removed", { relationshipId });
  },
};

module.exports = { emitRelationshipEvent };
