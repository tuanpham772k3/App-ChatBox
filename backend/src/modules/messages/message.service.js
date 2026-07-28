const Message = require("./message.model.js");
const Conversation = require("../conversations/conversation.model.js");
const { AppError } = require("../../utils/AppError.js");
const { formatConversation } = require("../conversations/conversation.mapper.js");

const MessageService = {
  // Tạo tin nhắn mới
  createMessage: async (payload) => {
    const {
      conversationId,
      content,
      file,
      clientMessageId = null,
      replyTo,
      senderId,
    } = payload;

    const conversation = await Conversation.findOne({
      _id: conversationId,
      "participants.userId": senderId,
      isActive: true,
    });

    if (!conversation) {
      throw new AppError("Conversation not found or access denied", 404);
    }

    // Trường hợp reply:
    if (replyTo) {
      const repliedMessage = await Message.findById(replyTo);

      if (!repliedMessage) throw new AppError("Message not found", 404);

      if (repliedMessage.conversationId.toString() !== conversationId) {
        throw new AppError("Reply message must belong to same conversation", 400);
      }
    }

    // Xác định message type (BACKEND QUYẾT)
    let type = "text";

    if (file) {
      type = file.mimeType.startsWith("image/") ? "image" : "file";
    }

    if (type === "text") {
      if (!content || !content.trim()) {
        throw new AppError("Message content cannot be empty", 400);
      }
      if (content.length > 2000) {
        throw new AppError("Message content too long (max 2000 characters)", 400);
      }
    }

    if ((type === "image" || type === "file") && !file?.url) {
      throw new AppError("File info is required for file/image message", 400);
    }

    // ===== Idempotency / dedupe (KISS) =====
    // Nếu client retry cùng clientMessageId thì trả về message cũ (không tạo mới, không tăng unreadCount lần nữa)
    if (clientMessageId) {
      const existing = await Message.findOne({
        conversationId,
        senderId,
        clientMessageId,
      })
        .populate("senderId", "displayName email avatar")
        .lean();

      if (existing) {
        return { message: existing, isNew: false };
      }
    }

    const message = await Message.create({
      conversationId,
      senderId,
      clientMessageId,
      type,
      content,
      file: file && {
        url: file.url,
        public_id: file.public_id,
        filename: file.filename,
        mimeType: file.mimeType,
        size: file.size,
      },
      replyTo,
    });

    await message.populate([
      {
        path: "senderId",
        select: "displayName email avatar",
      },
      {
        path: "replyTo",
        select: "content senderId type file isDeleted",
        populate: {
          path: "senderId",
          select: "displayName email avatar",
        },
      },
    ]);

    conversation.lastMessage = {
      messageId: message._id,
      senderId,
      type,
      content: type === "text" ? content.trim() : file?.filename || type,
      file: file
        ? {
            url: file.url,
            filename: file.filename,
            size: file.size,
          }
        : null,
      isDeleted: false,
      createdAt: message.createdAt,
    };
    conversation.updatedAt = new Date();
    conversation.participants.forEach((participant) => {
      if (participant.userId.equals(senderId)) return;

      participant.unreadCount += 1;
      participant.deletedAt = null;
    });

    await conversation.save();
    await conversation.populate([
      {
        path: "participants.userId",
        select: "displayName email avatar bio presence lastSeenAt",
      },
      {
        path: "lastMessage.senderId",
        select: "displayName avatar email",
      },
    ]);

    const formattedConversation = await formatConversation(
      conversation.toObject(),
      senderId
    );

    return {
      message,
      conversation: formattedConversation,
      isNew: true,
    };
  },

  // Lấy danh sách tin nhắn trong một conversation
  getConversationMessages: async (conversationId, userId, before, limit = 20) => {
    const conversation = await Conversation.findOne({
      _id: conversationId,
      "participants.userId": userId,
      isActive: true,
    });

    if (!conversation) {
      throw new AppError("Conversation not found or access denied", 404);
    }

    // Lấy người tham gia hiện tại để xác định mốc thời gian lấy tin nhắn
    const participant = conversation.participants.find((p) => p.userId.equals(userId));

    const fromTime = participant.clearedMessagesHistoryAt || participant.joinedAt;

    const query = {
      conversationId,
      createdAt: { $gte: fromTime },
    };

    if (before) {
      query.createdAt.$lt = new Date(before);
    }

    const messages = await Message.find(query)
      .populate([
        {
          path: "senderId",
          select: "displayName email avatar",
        },
        {
          path: "replyTo",
          select: "content senderId type file isDeleted",
          populate: {
            path: "senderId",
            select: "displayName email avatar",
          },
        },
        {
          path: "reactions.userId",
          select: "displayName email avatar",
        },
      ])
      .sort({ createdAt: -1 }) // Sắp xếp từ mới nhất đến cũ nhất
      .limit(limit + 1)
      .lean();

    // Xác định còn tin nhắn để load thêm không
    const hasMore = messages.length > limit;

    // Đảo ngược để UI hiển thị từ cũ → mới
    messages.reverse();

    return {
      messages,
      nextCursor: messages.length ? messages[0].createdAt : null,
      hasMore,
    };
  },

  // xóa tin nhắn
  deleteMessageById: async (messageId, userId) => {
    const message = await Message.findById(messageId).populate(
      "senderId",
      "displayName email avatar"
    );

    if (!message) {
      throw new AppError("Message not found", 404);
    }

    if (!message.senderId?._id?.equals(userId)) {
      throw new AppError("You can only delete your own messages", 403);
    }

    if (message.isDeleted) {
      return message;
    }

    message.isDeleted = true;
    message.content = "This message has been deleted.";
    message.file = null;

    await message.save();

    // ===== Update lastMessage nếu cần =====
    const conversation = await Conversation.findById(message.conversationId).select(
      "participants lastMessage"
    );
    if (!conversation) {
      throw new AppError("Conversation not found", 404);
    }

    const isLastMessage =
      String(conversation.lastMessage?.messageId) === String(message._id);

    if (isLastMessage) {
      conversation.lastMessage.content = message.content;
      conversation.lastMessage.file = null;
      conversation.lastMessage.isDeleted = true;

      await conversation.save();

      await conversation.populate("lastMessage.senderId", "displayName avatar email");
    }

    return {
      message,
      realtimeData: {
        participants: conversation.participants,
        lastMessage: conversation.lastMessage,
        isLastMessage,
      },
    };
  },

  // Chỉnh sửa tin nhắn
  editMessageById: async (messageId, userId, newContent) => {
    const message = await Message.findById(messageId).populate(
      "senderId",
      "displayName email avatar"
    );

    if (!message) {
      throw new AppError("Message not found", 404);
    }

    if (!message.senderId?._id?.equals(userId)) {
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

    await message.save();

    // === Nếu là lastMessage thì cập nhật ===
    const conversation = await Conversation.findById(message.conversationId).select(
      "participants lastMessage"
    );
    if (!conversation) {
      throw new AppError("Conversation not found", 404);
    }

    const isLastMessage = conversation.lastMessage.messageId.equals(messageId);

    if (isLastMessage) {
      conversation.lastMessage.content = message.content;
      await conversation.save();

      await conversation.populate("lastMessage.senderId", "displayName avatar email");
    }

    return {
      message,
      realtimeData: {
        participants: conversation.participants,
        lastMessage: conversation.lastMessage,
        isLastMessage,
      },
    };
  },

  // Reaction
  reactionMessageById: async (payload) => {
    const { userId, messageId, emoji } = payload;

    const message = await Message.findById(messageId);

    if (!message || message.isDeleted) {
      throw new AppError("Message not found", 404);
    }

    const reaction = message.reactions.find(
      (r) => r.userId.toString() === userId.toString()
    );

    // Chưa từng reaction -> thêm mới
    if (!reaction) {
      message.reactions.push({
        userId,
        emoji,
      });
    }
    // Click lại cùng emoji -> bỏ reaction
    else if (reaction.emoji === emoji) {
      message.reactions = message.reactions.filter(
        (r) => r.userId.toString() !== userId.toString()
      );
    }
    // Đổi emoji
    else {
      reaction.emoji = emoji;
    }

    await message.save();

    await message.populate({
      path: "reactions.userId",
      select: "displayName email avatar",
    });

    return message.toObject();
  },
};

module.exports = MessageService;
