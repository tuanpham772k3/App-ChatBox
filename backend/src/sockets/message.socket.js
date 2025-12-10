// message.socket.js
import { markMessageAsRead } from "../modules/messages/message.service.js";
import Message from "../modules/messages/message.model.js";

export const messageSocket = (io, socket) => {
  socket.on("mark_as_read", async (payload) => {
    const { messageId } = payload || {};

    if (!messageId) {
      return socket.emit("error", { type: "BAD_REQUEST", message: "messageId required" });
    }

    try {
      await markMessageAsRead(messageId, socket.userId);

      const message = await Message.findById(messageId).populate("conversation");

      if (!message || !message.conversation) {
        return socket.emit("error", {
          type: "NOT_FOUND",
          message: "Message or conversation not found",
        });
      }

      io.to(`conversation_${message.conversation._id}`).emit("message_read", {
        messageId,
        readBy: socket.userId,
        readAt: new Date(),
      });
    } catch (err) {
      console.error("mark_as_read error:", {
        messageId,
        userId: socket.userId,
        error: err,
      });

      socket.emit("error", {
        type: "SERVER_ERROR",
        message: "Failed to mark message as read",
      });
    }
  });

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
