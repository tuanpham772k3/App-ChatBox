const Message = require("../modules/messages/message.model.js");
const MessageService = require("../modules/messages/message.service.js");
const {
  emitMessageCreated,
  emitMessageDeleted,
  emitMessageEditedWithConversationSync,
} = require("./realtime.emitter.js");

const messageSocket = (io, socket) => {
  socket.on("typing_start", ({ conversationId }) => {
    if (!conversationId) return;
    socket.to(`conversation_${conversationId}`).emit("user_typing", {
      userId: socket.userId,
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

  socket.on("message_delivered", async ({ messageId, conversationId }) => {
    if (!messageId) return;
    if (!conversationId) return;

    try {
      const message = await Message.findByIdAndUpdate(
        messageId,
        { status: "delivered" },
        { new: true }
      );

      if (!message) return;

      // Emit status update
      io.to(`user_${message.senderId}`).emit("message_delivered", {
        messageId: messageId,
        status: "delivered",
      });
    } catch (err) {
      console.error("Error updating message status to delivered:", err);
    }
  });

  socket.on("message_created", async ({ messageId }) => {
    if (!messageId) return;

    try {
      const { message, conversation } = await MessageService.getMessageRealtimeData(messageId);
      emitMessageCreated({
        io,
        message,
        conversation,
        senderId: socket.userId,
      });
    } catch (err) {
      console.error("message_created error:", err);
    }
  });

  socket.on("message_edited", async ({ messageId }) => {
    if (!messageId) return;

    try {
      const { message, conversation } = await MessageService.getMessageRealtimeData(messageId);
      emitMessageEditedWithConversationSync({
        io,
        message,
        conversation,
      });
    } catch (err) {
      console.error("message_edited error:", err);
    }
  });

  socket.on("message_deleted", async ({ messageId }) => {
    if (!messageId) return;

    try {
      const realtimeData = await MessageService.getMessageDeleteRealtimeData(messageId);
      emitMessageDeleted({
        io,
        messageId: String(realtimeData.messageId),
        conversationId: String(realtimeData.conversationId),
        conversation: realtimeData.conversation,
        lastMessage: realtimeData.lastMessage,
      });
    } catch (err) {
      console.error("message_deleted error:", err);
    }
  });
};

module.exports = { messageSocket };
