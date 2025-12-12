export const messageSocket = (io, socket) => {
  socket.on("typing_start", ({ conversationId }) => {
    if (!conversationId) return;
    socket.to(`conversation_${conversationId}`).emit("user_typing", {
      userId: socket.userId,
      username: socket.user.username,
      conversationId,
    });
  });

  socket.on("typing_stop", ({ conversationId }) => {
    if (!conversationId) return;
    socket.to(`conversation_${conversationId}`).emit("user_stop_typing", {
      userId: socket.userId,
      conversationId,
    });
  });
};
