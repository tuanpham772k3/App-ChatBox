const buildLastMessagePayload = (conversationId, message) => {
  return {
    conversationId,
    lastMessage: {
      messageId: message._id,
      senderId: {
        _id: message.senderId?._id,
        username: message.senderId?.username,
        avatarUrl: message.senderId?.avatarUrl,
      },
      type: message.type,
      content: message.content || message.file?.filename || message.type || "",
      file: message.file || null,
      createdAt: message.createdAt,
      isDeleted: Boolean(message.isDeleted),
    },
  };
};

const emitToConversationAndParticipants = ({
  io,
  conversationId,
  participants,
  event,
  payload,
}) => {
  let target = io.to(`conversation_${conversationId}`);

  (participants || []).forEach((participant) => {
    const participantId = String(participant?.userId);
    if (!participantId) return;
    target = target.to(`user_${participantId}`);
  });

  target.emit(event, payload);
};

const emitMessageCreated = ({ io, message, conversation, senderId }) => {
  if (!message || !conversation) return;

  const participants = conversation?.participants || [];
  const conversationId = String(conversation?._id || message.conversationId);

  participants.forEach((participant) => {
    const participantId = String(participant?.userId);
    if (!participantId) return;

    io.to(`user_${participantId}`).emit("message_new", message);

    io.to(`user_${participantId}`).emit(
      "conversation:lastMessage",
      buildLastMessagePayload(conversationId, message)
    );

    if (participantId !== String(senderId)) {
      io.to(`user_${participantId}`).emit("conversation:unread", {
        conversationId,
        unreadCount: participant?.unreadCount,
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
  const participants = conversation?.participants || [];

  participants.forEach((participant) => {
    const participantId = String(participant?.userId);
    if (!participantId) return;
    io.to(`user_${participantId}`).emit("conversation:new", conversation);
  });
};

const emitMessageEditedWithConversationSync = ({ io, message, conversation }) => {
  if (!message || !conversation) return;

  const conversationId = String(conversation?._id || message.conversationId);

  emitMessageEdited({ io, message, conversationId });

  if (String(conversation.lastMessage?.messageId) !== String(message._id)) return;

  const payload = buildLastMessagePayload(conversationId, message);

  conversation.participants.forEach((participant) => {
    const participantId = String(participant?.userId);
    if (!participantId) return;
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
    const participantId = String(participant?.userId);
    if (!participantId) return;
    io.to(`user_${participantId}`).emit("conversation:lastMessage", payload);
  });
};

const emitConversationRead = ({
  io,
  conversationId,
  userId,
  lastReadAt,
  participants,
}) => {
  emitToConversationAndParticipants({
    io,
    conversationId,
    participants,
    event: "conversation:read",
    payload: {
      conversationId,
      userId,
      lastReadAt,
    },
  });
};

const emitConversationDelivered = ({
  io,
  conversationId,
  userId,
  lastDeliveredAt,
  participants,
}) => {
  emitToConversationAndParticipants({
    io,
    conversationId,
    participants,
    event: "conversation:delivered",
    payload: {
      conversationId,
      userId,
      lastDeliveredAt,
    },
  });
};

module.exports = {
  emitMessageCreated,
  emitMessageEdited,
  emitMessageEditedWithConversationSync,
  emitMessageDeleted,
  emitConversationCreated,
  emitConversationRead,
  emitConversationDelivered,
};
