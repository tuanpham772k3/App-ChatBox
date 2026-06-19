const { Types } = require("mongoose");
const ConversationService = require("./conversation.service.js");
const {
  emitConversationEvent,
} = require("../../sockets/emitters/conversation.emitter.js");
const { getSocket } = require("../../sockets/socket.js");

/**
 * Tạo conversation 1-1
 */
const createPrivateConversation = async (req, res, next) => {
  try {
    const creatorId = req.user.userId;
    const { participantId } = req.body;

    if (!participantId) {
      return res.status(400).json({
        success: false,
        message: "Participant ID is required",
      });
    }

    if (!Types.ObjectId.isValid(participantId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid participant ID format",
      });
    }

    if (creatorId === participantId) {
      return res.status(400).json({
        success: false,
        message: "Cannot create conversation with yourself",
      });
    }

    const conversation = await ConversationService.createPrivateConversation(
      creatorId,
      participantId
    );

    // Server-authoritative publish: emit realtime ngay sau khi tạo conversation thành công
    try {
      const io = getSocket();
      emitConversationEvent.created({ io, conversation });
    } catch (err) {
      console.error("[REALTIME] emitConversationCreated (private) failed:", err);
    }

    return res.status(201).json({
      success: true,
      message: "Conversation created successfully",
      data: conversation,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Tạo group conversation
 */
const createGroupConversation = async (req, res, next) => {
  try {
    const creatorId = req.user.userId;
    const { name, memberIds, avatar = null } = req.body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Group name is required",
      });
    }

    if (!memberIds || !Array.isArray(memberIds)) {
      return res.status(400).json({
        success: false,
        message: "Member must be an array of user IDs",
      });
    }

    if (memberIds.length < 2) {
      return res.status(400).json({
        success: false,
        message: "A group needs at least 3 members",
      });
    }

    const conversation = await ConversationService.createGroupConversation(
      creatorId,
      name,
      memberIds,
      avatar
    );

    // Server-authoritative publish
    try {
      const io = getSocket();
      emitConversationEvent.created({ io, conversation });
    } catch (err) {
      console.error("[REALTIME] emitConversationCreated (group) failed:", err);
    }

    return res.status(201).json({
      success: true,
      message: "Group conversation created successfully",
      data: conversation,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Lấy danh sách conversation của user hiện tại
 */
const getConversations = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    if (page < 1 || limit < 1 || limit > 100) {
      return res.status(400).json({
        success: false,
        message: "Invalid pagination parameters",
      });
    }

    const { conversations, pagination } = await ConversationService.getConversations(
      userId,
      page,
      limit
    );

    return res.status(200).json({
      success: true,
      pagination,
      data: conversations,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Thêm thành viên vào group
 */
const addMemberToGroup = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { conversationId } = req.params;
    let { memberIds } = req.body;

    if (!Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format",
      });
    }

    if (!Array.isArray(memberIds) || memberIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "memberIds must be a non-empty array",
      });
    }

    // remove duplicate input
    memberIds = [...new Set(memberIds)];

    const conversation = await ConversationService.addMemberToGroup(
      conversationId,
      memberIds,
      userId
    );

    return res.status(200).json({
      success: true,
      message: "Member added successfully",
      data: conversation,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Xóa thành viên khỏi group
 */
const removeMemberFromGroup = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { conversationId, memberId } = req.params;

    if (!Types.ObjectId.isValid(conversationId) || !Types.ObjectId.isValid(memberId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format",
      });
    }

    if (userId === memberId) {
      return res.status(403).json({
        success: false,
        message: "Cannot remove themselves",
      });
    }

    const conversation = await ConversationService.removeMemberFromGroup(
      conversationId,
      userId,
      memberId
    );

    return res.status(200).json({
      success: true,
      message: "Member removed successfully",
      data: conversation,
    });
  } catch (error) {
    return next(error);
  }
};

// Lấy thông tin chi tiết một conversation
const getConversationById = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { conversationId } = req.params;

    if (!Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid conversation ID format",
      });
    }

    const conversation = await ConversationService.getConversationById(
      conversationId,
      userId
    );

    return res.status(200).json({
      success: true,
      data: conversation,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Đánh dấu đã đọc (soft delete)
 */
const markAsRead = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { conversationId } = req.params;

    if (!Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid conversation ID format",
      });
    }

    await ConversationService.markAsRead(conversationId, userId);

    // Server-authoritative publish read receipt (nếu người khác đang join room)
    try {
      const io = getSocket();
      const seenStatus = await ConversationService.getSeenStatus(conversationId, userId);
      emitConversationEvent.messageSeenUpdated({
        io,
        conversationId: String(seenStatus.conversationId),
        userId: String(seenStatus.userId),
        lastReadAt: seenStatus.lastReadAt,
        participants: seenStatus.participants,
      });
    } catch (err) {
      console.error("[REALTIME] emitConversationRead failed:", err);
    }

    return res.status(200).json({
      success: true,
      message: "Conversation marked as read",
      data: null,
    });
  } catch (error) {
    return next(error);
  }
};

// Lấy ảnh trong conversation (dùng cho phần media trong conversation details)
const getConversationImages = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { conversationId } = req.params;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 8;

    if (!Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid conversation ID format",
      });
    }

    const images = await ConversationService.getConversationImages(
      conversationId,
      userId,
      page,
      limit
    );

    return res.status(200).json({
      success: true,
      data: images,
    });
  } catch (error) {
    return next(error);
  }
};

// Rời nhóm
const leaveGroup = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { conversationId } = req.params;

    if (!Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid conversation ID format",
      });
    }

    await ConversationService.leaveGroup(conversationId, userId);

    return res.status(200).json({
      success: true,
      message: "Leave group successfully",
      data: null,
    });
  } catch (error) {
    return next(error);
  }
};

// Chuyển quyền sở hữu nhóm
const transferGroupOwnership = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { newOwnerId } = req.body;
    const { conversationId } = req.params;

    if (!Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid conversation ID format",
      });
    }

    if (!newOwnerId || !Types.ObjectId.isValid(newOwnerId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid new owner ID format",
      });
    }

    await ConversationService.transferGroupOwnership(conversationId, userId, newOwnerId);

    return res.status(200).json({
      success: true,
      message: "Group ownership transferred successfully",
      data: null,
    });
  } catch (error) {
    return next(error);
  }
};

const deleteConversationForMe = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { conversationId } = req.params;

    if (!Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid conversation ID format",
      });
    }

    await ConversationService.deleteConversationForMe(conversationId, userId);

    return res.status(200).json({
      success: true,
      message: "Delete conversation successfully",
      data: null,
    });
  } catch (error) {
    return next(error);
  }
};

const togglePinConversation = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { conversationId } = req.params;

    if (!Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid conversation ID format",
      });
    }

    const pinnedAt = await ConversationService.togglePinConversation(
      conversationId,
      userId
    );

    return res.status(200).json({
      success: true,
      message: "Toggle pin conversation successfully",
      data: pinnedAt,
    });
  } catch (error) {
    return next(error);
  }
};

const markAsUnread = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { conversationId } = req.params;

    if (!Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid conversation ID format",
      });
    }

    const unreadCount = await ConversationService.markAsUnread(conversationId, userId);

    return res.status(200).json({
      success: true,
      message: "Conversation marked as unread",
      data: unreadCount,
    });
  } catch (error) {
    return next(error);
  }
};

const clearConversationHistory = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { conversationId } = req.params;

    if (!Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid conversation ID format",
      });
    }

    await ConversationService.clearConversationHistory(conversationId, userId);

    return res.status(200).json({
      success: true,
      message: "Conversation history cleared successfully",
      data: null,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createPrivateConversation,
  getConversations,
  getConversationById,
  createGroupConversation,
  addMemberToGroup,
  removeMemberFromGroup,
  markAsRead,
  getConversationImages,
  leaveGroup,
  transferGroupOwnership,
  deleteConversationForMe,
  togglePinConversation,
  markAsUnread,
  clearConversationHistory,
};
