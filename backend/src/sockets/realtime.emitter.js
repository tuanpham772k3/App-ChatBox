const buildLastMessagePayload = (conversationId, message) => ({
  conversationId,
  lastMessage: {
    _id: message._id,
    sender: {
      _id: message.sender?._id || message.sender,
      username: message.sender?.username,
      avatarUrl: message.sender?.avatarUrl,
    },
    type: message.type,
    content:
      message.type === "text" ? message.content : message.file?.filename || message.type,
    file: message.file || null,
    createdAt: message.createdAt,
    isDeleted: Boolean(message.isDeleted),
  },
});

const emitMessageCreated = ({ io, message, conversation, senderId }) => {
  if (!message || !conversation) return;

  const participants = conversation.participants || [];
  const conversationId = String(conversation._id || message.conversation);

  participants.forEach((participant) => {
    const participantId = String(participant.user?._id || participant.user);

    if (participantId !== String(senderId)) {
      io.to(`user_${participantId}`).emit("message_new", message);
    }

    io.to(`user_${participantId}`).emit(
      "conversation:lastMessage",
      buildLastMessagePayload(conversationId, message)
    );

    if (participantId !== String(senderId)) {
      io.to(`user_${participantId}`).emit("conversation:unread", {
        conversationId,
        unreadCount: participant.unreadCount,
        userId: participantId,
      });
    }
  });
};

const emitMessageEdited = ({ io, message, conversationId }) => {
  io.to(`conversation_${conversationId}`).emit("message_edit", message);
};

const emitConversationCreated = ({ io, conversation }) => {
  if (!conversation) return;
  const participants = conversation.participants || [];

  participants.forEach((participant) => {
    const participantId = String(participant.user?._id || participant.user);
    io.to(`user_${participantId}`).emit("conversation:new", conversation);
  });
};

const emitMessageEditedWithConversationSync = ({ io, message, conversation }) => {
  if (!message || !conversation) return;

  const conversationId = String(conversation._id || message.conversation);
  emitMessageEdited({ io, message, conversationId });

  if (String(conversation.lastMessage?._id || "") !== String(message._id)) return;

  const payload = buildLastMessagePayload(conversationId, message);
  (conversation.participants || []).forEach((participant) => {
    const participantId = String(participant.user?._id || participant.user);
    io.to(`user_${participantId}`).emit("conversation:lastMessage", payload);
  });
};

const emitMessageDeleted = ({ io, messageId, conversationId, conversation, lastMessage }) => {
  io.to(`conversation_${conversationId}`).emit("message_delete", messageId);

  if (!conversation || !lastMessage) return;

  const payload = buildLastMessagePayload(conversationId, lastMessage);
  conversation.participants.forEach((participant) => {
    const participantId = String(participant.user?._id || participant.user);
    io.to(`user_${participantId}`).emit("conversation:lastMessage", payload);
  });
};

const emitConversationRead = ({ io, conversationId, userId, lastReadMessage }) => {
  io.to(`conversation_${conversationId}`).emit("conversation:read", {
    conversationId,
    userId: String(userId),
    lastReadMessage,
  });
};

module.exports = {
  emitMessageCreated,
  emitMessageEdited,
  emitMessageEditedWithConversationSync,
  emitMessageDeleted,
  emitConversationCreated,
  emitConversationRead,
};
