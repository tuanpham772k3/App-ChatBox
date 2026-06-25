const Conversation = require("../../modules/conversations/conversation.model.js");

const registerConversationHandlers = (io, socket) => {
  // Join conversation room
  const handleJoinConversation = async ({ conversationId }) => {
    if (!conversationId) {
      return socket.emit("error", {
        type: "BAD_REQUEST",
        message: "conversationId required",
      });
    }

    try {
      const conversation = await Conversation.findById(conversationId).select(
        "participants"
      );

      if (!conversation) {
        return socket.emit("error", {
          type: "NOT_FOUND",
          message: "Conversation not found",
        });
      }

      const isParticipant = conversation.participants.some(
        (participant) => String(participant.userId) === String(socket.user._id)
      );

      if (!isParticipant) {
        return socket.emit("error", {
          type: "FORBIDDEN",
          message: "Not a participant",
        });
      }

      socket.join(`conversation_${conversationId}`);

      console.log(
        `[SOCKET] User ${socket.user._id} joined room conversation_${conversationId}`
      );
    } catch (error) {
      console.error("join_conversation error:", {
        conversationId,
        userId: socket.user._id,
        error,
      });

      socket.emit("error", {
        type: "SERVER_ERROR",
        message: "Join conversation failed",
      });
    }
  };

  // Leave conversation room
  const handleLeaveConversation = ({ conversationId }) => {
    if (!conversationId) return;

    socket.leave(`conversation_${conversationId}`);

    console.log(
      `[SOCKET] User ${socket.user._id} left room conversation_${conversationId}`
    );
  };

  // User typing
  const handleTypingStart = ({ conversationId }) => {
    if (!conversationId) return;

    socket.to(`conversation_${conversationId}`).emit("user_typing", {
      userId: socket.user._id,
      conversationId,
    });
  };

  // User stop typing
  const handleTypingStop = ({ conversationId }) => {
    if (!conversationId) return;

    socket.to(`conversation_${conversationId}`).emit("user_stop_typing", {
      userId: socket.user._id,
      conversationId,
    });
  };

  // Register events
  socket.on("conversation:join", handleJoinConversation);
  socket.on("conversation:leave", handleLeaveConversation);
  socket.on("typing_start", handleTypingStart);
  socket.on("typing_stop", handleTypingStop);
};

module.exports = { registerConversationHandlers };
