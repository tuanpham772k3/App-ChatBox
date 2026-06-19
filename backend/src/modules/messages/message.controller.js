const MessageService = require("./message.service.js");
const { Types } = require("mongoose");
const { emitMessageEvent } = require("../../sockets/emitters/message.emitter.js");
const { getSocket } = require("../../sockets/socket.js");

/**
 * Tạo tin nhắn mới
 */
const createNewMessage = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { conversationId, content, file, clientMessageId = null } = req.body;

    if (!conversationId) {
      return res.status(400).json({
        success: false,
        message: "conversationId is required",
      });
    }

    const { message, isNew } = await MessageService.createMessage(
      conversationId,
      userId,
      content,
      file,
      clientMessageId
    );

    // Server-authoritative publish: chỉ emit realtime khi message thật sự được tạo mới
    if (isNew) {
      try {
        const io = getSocket();
        const { message, conversation } = await MessageService.getMessageRealtimeData(
          message._id
        );
        emitMessageEvent.created({ io, message, conversation, senderId: userId });
      } catch (err) {
        // Không fail request nếu realtime emit lỗi (demo-prod best practice)
        console.error("[REALTIME] emitMessageCreated failed:", err);
      }
    }

    return res.status(201).json({
      success: true,
      message: "Message created successfully",
      data: message,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Lấy danh sách tin nhắn trong conversation
 */
const getConversationMessages = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const { userId } = req.user;

    const before = req.query.before || null;
    const limit = Math.min(Number(req.query.limit) || 20, 50);

    if (!Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid conversation ID format",
      });
    }

    const results = await MessageService.getConversationMessages(
      conversationId,
      userId,
      before,
      limit
    );

    return res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Xóa tin nhắn
 */
const deleteMessageById = async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const { userId } = req.user;

    if (!Types.ObjectId.isValid(messageId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid message ID format",
      });
    }

    const message = await MessageService.deleteMessageById(messageId, userId);

    // Emit realtime delete (server-authoritative)
    try {
      const io = getSocket();
      const realtimeData = await MessageService.getMessageDeleteRealtimeData(messageId);
      emitMessageEvent.deleted({
        io,
        messageId: String(realtimeData.messageId),
        conversationId: String(realtimeData.conversationId),
        conversation: realtimeData.conversation,
        lastMessage: realtimeData.lastMessage,
      });
    } catch (err) {
      console.error("[REALTIME] emitMessageDeleted failed:", err);
    }

    return res.status(200).json({
      success: true,
      message: "Message deleted successfully",
      data: message,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Chỉnh sửa tin nhắn
 */
const editMessageById = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { messageId } = req.params;
    const newContent = req.body.content;

    if (!Types.ObjectId.isValid(messageId)) {
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

    const message = await MessageService.editMessageById(messageId, userId, newContent);

    // Emit realtime edit (server-authoritative)
    try {
      const io = getSocket();
      const realtimeData = await MessageService.getMessageRealtimeData(messageId);
      emitMessageEvent.edited({
        io,
        message: realtimeData.message,
        conversation: realtimeData.conversation,
      });
    } catch (err) {
      console.error("[REALTIME] emitMessageEdited failed:", err);
    }

    return res.status(200).json({
      success: true,
      message: "Message edited successfully",
      data: message,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createNewMessage,
  getConversationMessages,
  deleteMessageById,
  editMessageById,
};
