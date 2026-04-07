import { getSocket } from "../../socket.js";
import {
  createMessage,
  deleteMessage,
  editMessage,
  getMessages,
} from "./message.service.js";

/**Tạo tin nhắn mới
 * POST /api/messages
 *
 * Flow:
 * 1. Lấy userId từ JWT token
 * 2. Nhận dữ liệu từ request body
 * 3. Validation cơ bản
 * 4. Gọi service tạo tin nhắn mới
 * 5. Trả về phản hồi cho client
 */
export const createNewMessage = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { tempId, conversationId, content, file } = req.body;

    if (!conversationId) {
      return res.status(400).json({
        success: false,
        message: "conversationId is required",
      });
    }

    const result = await createMessage(conversationId, userId, content, file);

    const { message, participants } = result;

    const io = getSocket();

    // 1. message_new
    participants.forEach((p) => {
      if (p.user.toString() !== userId) {
        io.to(`user_${p.user}`).emit("message_new", message);
      }
    });

    // 2. lastMessage
    const lastMessagePayload = {
      conversationId,
      lastMessage: {
        _id: message._id,
        sender: {
          _id: message.sender._id,
          username: message.sender.username,
          avatarUrl: message.sender.avatarUrl,
        },
        type: message.type,
        content:
          message.type === "text"
            ? message.content
            : message.file?.filename || message.type,
        file: message.file || null,
        createdAt: message.createdAt,
      },
    };

    participants.forEach((p) => {
      io.to(`user_${p.user}`).emit("conversation:lastMessage", lastMessagePayload);
    });

    // 3. unread
    participants.forEach((p) => {
      if (p.user.toString() !== userId) {
        io.to(`user_${p.user}`).emit("conversation:unread", {
          conversationId,
          unreadCount: p.unreadCount,
          userId: p.user.toString(),
        });
      }
    });

    return res.status(201).json({
      success: true,
      message: "Message created successfully",
      data: { newMessage: message, tempId },
    });
  } catch (error) {
    return next(error);
  }
};

/**Lấy danh sách tin nhắn trong conversation
 * GET /api/messages/:conversationId?page=1&limit=50
 *
 * Flow:
 * 1. Lấy conversationId từ params
 * 2. Lấy userId từ JWT token
 * 3. Lấy page và limit từ query parameters
 * 4. Validation cơ bản
 * 5. Gọi service lấy danh sách tin nhắn
 * 6. Trả về response với pagination
 */
export const getConversationMessages = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const { userId } = req.user;

    const before = req.query.before || null;
    const limit = Math.min(Number(req.query.limit) || 20, 50);

    if (!conversationId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid conversation ID format",
      });
    }

    const result = await getMessages(conversationId, userId, before, limit);

    return res.status(200).json({
      success: true,
      message: "Messages retrieved successfully",
      data: result,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Xóa tin nhắn
 * DELETE /api/messages/:messageId
 *
 * Flow:
 * 1. Lấy messageId từ URL params
 * 2. Lấy userId từ JWT token
 * 3. Validation cơ bản
 * 4. Gọi service để xóa tin nhắn
 * 5. Trả về phản hồi cho client
 */
export const deleteMessageById = async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const { userId } = req.user;

    if (!messageId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid message ID format",
      });
    }

    const { message, conversationId } = await deleteMessage(messageId, userId);

    let io = getSocket();

    io.to(`conversation_${conversationId}`).emit("message_delete", messageId);

    return res.status(200).json({
      success: true,
      message: "Message deleted successfully",
      data: message,
    });
  } catch (error) {
    return next(error);
  }
};

/** * Chỉnh sửa tin nhắn
 * PUT /api/messages/:messageId
 *
 * Flow:
 * 1. Lấy messageId từ URL params
 * 2. Lấy userId từ JWT token
 */
export const editMessageById = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { messageId } = req.params;
    const { content: newContent } = req.body;

    if (!messageId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid message ID format",
      });
    }

    if (typeof newContent !== "string") {
      return res.status(400).json({
        success: false,
        message: "Content is required and must be a string",
      });
    }

    const { message, conversationId } = await editMessage(messageId, userId, newContent);

    const io = getSocket();

    io.to(`conversation_${conversationId}`).emit("message_edit", message);

    return res.status(200).json({
      success: true,
      message: "Message edited successfully",
      data: message,
    });
  } catch (error) {
    return next(error);
  }
};
