import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import Session from "../models/session.model.js";
import Message from "../models/message.model.js";
import Conversation from "../models/conversation.model.js";
import { markMessageAsRead } from "../services/message.service.js";

/**
 * Socket.IO handler cho chat realtime
 * Xử lý kết nối, xác thực, và các sự kiện chat
 */
export const chatSocket = (io) => {
  // Middleware xác thực JWT cho socket connection
  io.use(async (socket, next) => {
    try {
      // Lấy token từ query hoặc headers
      const token = socket.handshake.auth.token || socket.handshake.query.token;

      if (!token) {
        return next(new Error("Authentication token required"));
      }

      // Verify JWT token
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

      // Kiểm tra user có tồn tại không
      const user = await User.findById(decoded.userId);
      if (!user) {
        return next(new Error("User not found"));
      }

      // Gắn thông tin user vào socket
      socket.userId = decoded.userId;
      socket.user = user;

      next();
    } catch (error) {
      console.error("Socket authentication error:", error.message);
      next(new Error("Authentication failed"));
    }
  });

  // Lắng nghe kết nối từ client
  io.on("connection", async (socket) => {
    console.log(`User connected: ${socket.user.username} (${socket.id})`);

    try {
      // Cập nhật socketId trong session
      await Session.findOneAndUpdate(
        { userId: socket.userId, valid: true },
        { socketId: socket.id }
      );

      // Join user vào room của chính họ (để gửi thông báo cá nhân)
      socket.join(`user_${socket.userId}`);

      /**
       * ================================
       *   BẮT ĐẦU: xử lý ONLINE tại đây
       * ================================
       */
      const conversations = await Conversation.find({
        participants: socket.userId,
        isActive: true,
      });

      const payload = {
        userId: socket.userId,
        status: "online",
        lastSeenAt: new Date(),
      };

      conversations.forEach((conversation) => {
        io.to(`conversation_${conversation._id}`).emit("user_status_changed", payload);
        console.log(
          `Notified conversation ${conversation._id} that user ${socket.user.username} is online`
        );
      });

      await User.findByIdAndUpdate(socket.userId, {
        lastSeenAt: new Date(),
        status: "online",
      });
      /**
       * ===============================
       *   KẾT THÚC: xử lý ONLINE
       * ===============================
       */

      
      // Lắng nghe sự kiện join conversation
      socket.on("join_conversation", (conversationId) => {
        // Join vào room của conversation
        socket.join(`conversation_${conversationId}`);
        console.log(`User ${socket.user.username} joined conversation ${conversationId}`);
      });

      // Lắng nghe sự kiện leave conversation
      socket.on("leave_conversation", (conversationId) => {
        socket.leave(`conversation_${conversationId}`);
        console.log(`User ${socket.user.username} left conversation ${conversationId}`);
      });

      // Lắng nghe sự kiện đánh dấu tin nhắn đã đọc
      socket.on("mark_as_read", async (data) => {
        try {
          const { messageId } = data;

          if (!messageId) {
            socket.emit("error", {
              message: "Message ID is required",
            });
            return;
          }

          // Đánh dấu tin nhắn đã đọc
          await markMessageAsRead(messageId, socket.userId);

          // Thông báo cho các user khác trong conversation
          const message = await Message.findById(messageId).populate("conversation");
          if (message) {
            io.to(`conversation_${message.conversation._id}`).emit("message_read", {
              messageId,
              readBy: socket.userId,
              readAt: new Date(),
            });
          }
        } catch (error) {
          console.error("Error marking message as read:", error);
          socket.emit("error", {
            message: error.message || "Failed to mark message as read",
          });
        }
      });

      // Lắng nghe sự kiện typing
      socket.on("typing_start", (data) => {
        const { conversationId } = data;
        socket.to(`conversation_${conversationId}`).emit("user_typing", {
          userId: socket.userId,
          username: socket.user.username,
          conversationId,
        });
      });

      socket.on("typing_stop", (data) => {
        const { conversationId } = data;
        socket.to(`conversation_${conversationId}`).emit("user_stop_typing", {
          userId: socket.userId,
          conversationId,
        });
      });
    } catch (error) {
      console.error("Error in socket connection:", error);
    }

    // Xử lý ngắt kết nối
    socket.on("disconnect", async () => {
      console.log(`User disconnected: ${socket.user?.username} (${socket.id})`);

      try {
        // Cập nhật trạng thái offline
        await User.findByIdAndUpdate(socket.userId, {
          lastSeenAt: new Date(),
        });

        // Xóa socketId khỏi session
        await Session.findOneAndUpdate(
          { userId: socket.userId, socketId: socket.id },
          { $unset: { socketId: 1 } }
        );

        // Thông báo cho tất cả conversation mà user tham gia
        const conversations = await Conversation.find({
          participants: socket.userId,
          isActive: true,
        });

        conversations.forEach((conversation) => {
          io.to(`conversation_${conversation._id}`).emit("user_status_changed", {
            userId: socket.userId,
            status: "offline",
            lastSeenAt: new Date(),
          });
          console.log(
            `Notified conversation ${conversation._id} that user ${socket.user.username} is offline`
          );
        });
      } catch (error) {
        console.error("Error handling disconnect:", error);
      }
    });
  });
};
