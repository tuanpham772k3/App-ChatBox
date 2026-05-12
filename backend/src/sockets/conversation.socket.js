const Conversation = require("../modules/conversations/conversation.model.js");
const ConversationService = require("../modules/conversations/conversation.service.js");
const {
  emitConversationCreated,
  emitConversationRead,
} = require("./realtime.emitter.js");

const getRefId = (ref) => ref?._id || ref;

const conversationSocket = (io, socket) => {
  socket.on("join_conversation", async ({ conversationId }) => {
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
        (p) => String(getRefId(p.userId)) === String(socket.userId)
      );

      if (!isParticipant) {
        return socket.emit("error", { type: "FORBIDDEN", message: "Not a participant" });
      }

      socket.join(`conversation_${conversationId}`);

      // 🔥 Log join thành công
      console.log(
        `[SOCKET] User ${socket.userId} joined room conversation_${conversationId}`
      );
    } catch (err) {
      console.error("join_conversation error:", {
        conversationId,
        userId: socket.userId,
        error: err,
      });

      socket.emit("error", { type: "SERVER_ERROR", message: "Join conversation failed" });
    }
  });

  socket.on("leave_conversation", ({ conversationId }) => {
    if (!conversationId) return;
    socket.leave(`conversation_${conversationId}`);

    // 🔥 Log leave
    console.log(
      `[SOCKET] User ${socket.userId} leave room conversation_${conversationId}`
    );
  });

  socket.on("conversation_mark_read", async ({ conversationId }) => {
    if (!conversationId) return;

    try {
      const readStatus = await ConversationService.getReadStatus(
        conversationId,
        socket.userId
      );
      emitConversationRead({
        io,
        conversationId: String(readStatus.conversationId),
        userId: String(readStatus.userId),
        lastReadMessageId: readStatus.lastReadMessageId,
      });
    } catch (err) {
      console.error("conversation_mark_read error:", err);
    }
  });

  socket.on("conversation_created", async ({ conversationId }) => {
    if (!conversationId) return;

    try {
      const conversation = await ConversationService.getConversationRealtimeData(
        conversationId
      );
      emitConversationCreated({ io, conversation });
    } catch (err) {
      console.error("conversation_created error:", err);
    }
  });
};

module.exports = { conversationSocket };
