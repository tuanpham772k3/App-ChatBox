// socket.helpers.js

const emitToUser = (io, userId, event, payload) => {
  if (!io || !userId) return;

  io.to(`user_${userId}`).emit(event, payload);
};

const emitToConversation = (io, conversationId, event, payload) => {
  if (!io || !conversationId) return;

  io.to(`conversation_${conversationId}`).emit(event, payload);
};

const emitToParticipants = (io, participants, event, payload) => {
  (participants || []).forEach((participant) => {
    emitToUser(
      io,
      String(participant?.userId._id || participant?.userId),
      event,
      payload
    );
  });
};

module.exports = {
  emitToUser,
  emitToConversation,
  emitToParticipants,
};
