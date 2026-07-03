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

    const { message, conversation, isNew } = await MessageService.createMessage(
      conversationId,
      userId,
      content,
      file,
      clientMessageId
    );

    // realtime
    if (isNew) {
      const io = getSocket();
      emitMessageEvent.created({ io, message, conversation, senderId: userId });
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
    const io = getSocket();

    if (!Types.ObjectId.isValid(messageId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid message ID format",
      });
    }

    const { message, conversation } = await MessageService.deleteMessageById(
      messageId,
      userId
    );

    // realtime
    emitMessageEvent.deleted({
      io,
      messageId: message._id,
      conversationId: message.conversationId,
      conversation,
      lastMessage: conversation?.lastMessage,
    });

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
    const io = getSocket();

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

    const result = await MessageService.editMessageById(messageId, userId, newContent);

    // realtime
    emitMessageEvent.edited({ io, ...result });

    return res.status(200).json({
      success: true,
      message: "Message edited successfully",
      data: result.message,
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
