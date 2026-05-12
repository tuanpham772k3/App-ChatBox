const getRefId = (ref) => ref?._id || ref;

const buildLastMessagePayload = (conversationId, message) => {
  const senderId = message.senderId;

  return {
    conversationId,
    lastMessage: {
      messageId: message.messageId || message._id,
      senderId: {
        _id: getRefId(senderId),
        username: senderId?.username,
        avatarUrl: senderId?.avatarUrl,
      },
      type: message.type,
      content: message.content || message.file?.filename || message.type || "",
      file: message.file || null,
      createdAt: message.createdAt,
      isDeleted: Boolean(message.isDeleted),
    },
  };
};

const emitMessageCreated = ({ io, message, conversation, senderId }) => {
  if (!message || !conversation) return;

  const participants = conversation.participants || [];
  const conversationId = String(conversation._id || message.conversationId);

  participants.forEach((participant) => {
    const participantId = String(participant.userId?._id || participant.userId);

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
    const participantId = String(participant.userId?._id || participant.userId);
    io.to(`user_${participantId}`).emit("conversation:new", conversation);
  });
};

const emitMessageEditedWithConversationSync = ({ io, message, conversation }) => {
  if (!message || !conversation) return;

  const conversationId = String(conversation._id || message.conversationId);
  emitMessageEdited({ io, message, conversationId });

  if (String(conversation.lastMessage?.messageId || "") !== String(message._id)) return;

  const payload = buildLastMessagePayload(conversationId, message);
  (conversation.participants || []).forEach((participant) => {
    const participantId = String(participant.userId?._id || participant.userId);
    io.to(`user_${participantId}`).emit("conversation:lastMessage", payload);
  });
};

const emitMessageDeleted = ({
  io,
  messageId,
  conversationId,
  conversation,
  lastMessage,
}) => {
  io.to(`conversation_${conversationId}`).emit("message_delete", messageId);

  if (!conversation || !lastMessage) return;

  const payload = buildLastMessagePayload(conversationId, lastMessage);
  conversation.participants.forEach((participant) => {
    const participantId = String(participant.userId?._id || participant.userId);
    io.to(`user_${participantId}`).emit("conversation:lastMessage", payload);
  });
};

const emitConversationRead = ({ io, conversationId, userId, lastReadMessageId }) => {
  io.to(`conversation_${conversationId}`).emit("conversation:read", {
    conversationId,
    userId: String(userId),
    lastReadMessageId,
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
