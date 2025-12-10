import Conversation from "../modules/conversations/conversation.model.js";

export const conversationSocket = (io, socket) => {
  socket.on("join_conversation", async (conversationId) => {
    if (!conversationId) {
      return socket.emit("error", {
        type: "BAD_REQUEST",
        message: "conversationId required",
      });
    }
    try {
      // Optional: validate user is participant
      const conv = await Conversation.findById(conversationId).select("participants");

      if (!conv)
        return socket.emit("error", {
          type: "NOT_FOUND",
          message: "Conversation not found",
        });

      const isParticipant = conv.participants.some(
        (p) => String(p.user._id) === String(socket.userId)
      );

      if (!isParticipant) {
        return socket.emit("error", { type: "FORBIDDEN", message: "Not a participant" });
      }

      socket.join(`conversation_${conversationId}`);
    } catch (err) {
      console.error("join_conversation error:", {
        conversationId,
        userId: socket.userId,
        error: err,
      });

      socket.emit("error", { type: "SERVER_ERROR", message: "Join conversation failed" });
    }
  });

  socket.on("leave_conversation", (conversationId) => {
    if (!conversationId) return;
    socket.leave(`conversation_${conversationId}`);
  });
};
