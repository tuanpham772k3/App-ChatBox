const MessageService = require("./message.service.js");

/**
 * Tạo tin nhắn mới
 */
const createNewMessage = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { tempId, conversationId, content, file } = req.body;

    if (!conversationId) {
      return res.status(400).json({
        success: false,
        message: "conversationId is required",
      });
    }

    const result = await MessageService.createMessage(
      conversationId,
      userId,
      content,
      file
    );

    const { message } = result;

    return res.status(201).json({
      success: true,
      message: "Message created successfully",
      data: { newMessage: message, tempId },
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

    if (!conversationId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid conversation ID format",
      });
    }

    const result = await MessageService.getConversationMessages(
      conversationId,
      userId,
      before,
      limit
    );

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
 */
const deleteMessageById = async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const { userId } = req.user;

    if (!messageId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid message ID format",
      });
    }

    const { message } = await MessageService.deleteMessageById(messageId, userId);

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

    const { message } = await MessageService.editMessageById(messageId, userId, newContent);

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
