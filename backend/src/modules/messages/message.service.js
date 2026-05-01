const Message = require("./message.model.js");
const Conversation = require("../conversations/conversation.model.js");
const { AppError } = require("../../utils/AppError.js");

const MessageService = {
  /**Tạo tin nhắn mới
   * @param {string} conversationId - ID của conversation
   * @param {string} senderId - ID của người gửi
   * @param {string} content - Nội dung tin nhắn
   * @param {string} type - Loại tin nhắn (text, image, file, emoji)
   * @param {object} fileInfo - Thông tin file (nếu có)
   * @param {string} replyTo - ID của tin nhắn được trả lời (nếu có)
   * @returns {object} - Tin nhắn đã được tạo
   */
  createMessage: async (conversationId, senderId, content, fileInfo) => {
    const conversation = await Conversation.findOne({
      _id: conversationId,
      "participants.user": senderId,
      isActive: true,
    }).lean();

    if (!conversation) {
      throw new AppError("Conversation not found or access denied", 404);
    }

    // Xác định message type (BACKEND QUYẾT)
    let type = "text";

    if (fileInfo) {
      type = fileInfo.mimeType.startsWith("image/") ? "image" : "file";
    }

    if (type === "text") {
      if (!content || !content.trim()) {
        throw new AppError("Message content cannot be empty", 400);
      }
      if (content.length > 2000) {
        throw new AppError("Message content too long (max 2000 characters)", 400);
      }
    }

    if ((type === "image" || type === "file") && !fileInfo?.url) {
      throw new AppError("File info is required for file/image message", 400);
    }

    // Tạo message object & thêm file nếu có
    const messageData = {
      conversation: conversationId,
      sender: senderId,
      type,
      content: content ? content.trim() : null,
      file: fileInfo
        ? {
            url: fileInfo.url,
            public_id: fileInfo.public_id,
            filename: fileInfo.filename,
            mimeType: fileInfo.mimeType,
            size: fileInfo.size,
          }
        : null,
    };

    const savedMessage = await Message.create(messageData);

    const populatedMessage = await Message.findById(savedMessage._id)
      .populate("sender", "username email avatarUrl")
      .lean();

    // Cập nhật conversation.lastMessage và tăng unreadCount cho participants khác
    const updatedConv = await Conversation.findOneAndUpdate(
      { _id: conversationId },
      {
        $set: {
          lastMessage: {
            _id: savedMessage._id,
            sender: senderId,
            type,
            content: type === "text" ? content.trim() : fileInfo?.filename || type,
            file: fileInfo
              ? {
                  url: fileInfo.url,
                  filename: fileInfo.filename,
                  size: fileInfo.size,
                }
              : null,
            isDeleted: false,
            createdAt: savedMessage.createdAt,
          },
          updatedAt: new Date(),
          "participants.$[p].deletedAt": null,
        },
        $inc: {
          "participants.$[p].unreadCount": 1,
        },
      },
      {
        arrayFilters: [{ "p.user": { $ne: senderId } }],
        new: true,
        lean: true,
      }
    );

    return {
      message: populatedMessage,
      conversation: updatedConv,
    };
  },

  /**
   *Lấy danh sách tin nhắn trong một conversation với pagination
   * @param {string} conversationId - ID của conversation
   * @param {string} userId - ID của user (để kiểm tra quyền truy cập)
   * @param {number} page - Trang hiện tại (mặc định 1)
   * @param {number} limit - Số tin nhắn trên mỗi trang (mặc định 20)
   * @returns {object} - Danh sách tin nhắn với pagination
   */
  getConversationMessages: async (conversationId, userId, before, limit = 20) => {
    // 1. Kiểm tra user có quyền truy cập conversation không
    const conversation = await Conversation.findOne({
      _id: conversationId,
      "participants.user": userId,
      isActive: true,
    });

    if (!conversation) {
      throw new AppError("Conversation not found or access denied", 404);
    }

    // Lấy người tham gia hiện tại để xác định mốc thời gian lấy tin nhắn
    const participant = conversation.participants.find(
      (p) => p.user.toString() === userId
    );

    const fromTime = participant.clearedMessagesHistoryAt || participant.joinedAt;

    const query = {
      conversation: conversationId,
      createdAt: { $gte: fromTime },
    };

    if (before) {
      query.createdAt.$lt = new Date(before);
    }

    // 2. Lấy danh sách tin nhắn (không bao gồm tin nhắn đã xóa)
    const messages = await Message.find(query)
      .populate("sender", "username email avatarUrl")
      .sort({ createdAt: -1 }) // Sắp xếp từ mới nhất đến cũ nhất
      .limit(limit)
      .lean();

    // 3. Xác định còn tin nhắn để load thêm không
    const hasMore = messages.length === limit;

    // 4. Đảo ngược để UI hiển thị từ cũ → mới
    messages.reverse();

    return {
      messages,
      nextCursor: messages.length ? messages[0].createdAt : null,
      hasMore,
    };
  },

  /**
   *Xóa tin nhắn
   * @param {string} messageId - ID của tin nhắn
   * @param {string} userId - ID của user
   * @returns {object} - Kết quả xóa tin nhắn
   */
  deleteMessageById: async (messageId, userId) => {
    const message = await Message.findById(messageId).populate(
      "sender",
      "username email avatarUrl"
    );

    if (!message) {
      throw new AppError("Message not found", 404);
    }

    if (message.sender._id.toString() !== userId) {
      throw new AppError("You can only delete your own messages", 403);
    }

    if (message.isDeleted) {
      return message;
    }

    // ===== Soft delete =====
    message.isDeleted = true;
    message.content = "This message has been deleted.";
    message.file = null;

    await message.save();

    // ===== Update lastMessage nếu cần =====
    const conversation = await Conversation.findOneAndUpdate(
      {
        _id: message.conversation,
        "lastMessage._id": message._id,
      },
      {
        $set: {
          "lastMessage.content": "This message has been deleted.",
          "lastMessage.file": null,
          "lastMessage.isDeleted": true,
        },
      },
      {
        new: true,
        select: "participants",
      }
    ).lean();

    return {
      message,
      conversation,
      conversationId: message.conversation,
    };
  },

  /**
   * Chỉnh sửa tin nhắn
   * @param {string} messageId - ID của tin nhắn
   * @param {string} userId - ID của user
   * @param {string} newContent - Nội dung mới của tin nhắn
   * @returns {object} - Tin nhắn đã được chỉnh sửa
   */
  editMessageById: async (messageId, userId, newContent) => {
    const message = await Message.findById(messageId)
      .populate("sender", "username email avatarUrl")
      .populate("replyTo", "content sender createdAt")
      .populate("replyTo.sender", "username avatarUrl");

    if (!message) {
      throw new AppError("Message not found", 404);
    }

    if (message.sender._id.toString() !== userId) {
      throw new AppError("You can only edit your own messages", 403);
    }

    if (message.isDeleted) {
      throw new AppError("Cannot edit a deleted message", 400);
    }

    if (!newContent || newContent.trim().length === 0) {
      throw new AppError("Message content cannot be empty", 400);
    }

    if (newContent.length > 2000) {
      throw new AppError("Message content too long(max 2000 characters)", 400);
    }

    message.content = newContent.trim();
    message.isEdited = true;
    message.editedAt = new Date();

    const updatedMessage = await message.save();

    // Nếu là lastMessage thì cập nhật
    const conversation = await Conversation.findOne(updatedMessage.conversation);
    if (conversation.lastMessage._id.toString() === messageId) {
      conversation.lastMessage.content = updatedMessage.content;
      await conversation.save();
    }

    return {
      message: updatedMessage,
      conversationId: updatedMessage.conversation,
    };
  },

  getMessageRealtimeData: async (messageId) => {
    const message = await Message.findById(messageId)
      .populate("sender", "username email avatarUrl")
      .lean();
    if (!message) {
      throw new AppError("Message not found", 404);
    }

    const conversation = await Conversation.findById(message.conversation)
      .select("participants lastMessage")
      .lean();
    if (!conversation) {
      throw new AppError("Conversation not found", 404);
    }

    return { message, conversation };
  },

  getMessageDeleteRealtimeData: async (messageId) => {
    const message = await Message.findById(messageId)
      .populate("sender", "username email avatarUrl")
      .lean();
    if (!message) {
      throw new AppError("Message not found", 404);
    }

    const conversation = await Conversation.findById(message.conversation)
      .select("participants lastMessage")
      .populate("lastMessage.sender", "username avatarUrl")
      .lean();
    if (!conversation) {
      throw new AppError("Conversation not found", 404);
    }

    return {
      messageId: message._id,
      conversationId: message.conversation,
      conversation,
      lastMessage: conversation.lastMessage || null,
    };
  },
};

module.exports = MessageService;
