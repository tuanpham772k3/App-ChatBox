const ConversationService = require("./conversation.service.js");
const { getSocket } = require("../../socket.js");

/**
 * Tạo conversation 1-1
 */
const createPrivateConversation = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { participantId } = req.body;

    if (!participantId) {
      return res.status(400).json({
        success: false,
        message: "Participant ID is required",
      });
    }

    if (!participantId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid participant ID format",
      });
    }

    const { conversation, isNew, message } =
      await ConversationService.createPrivateConversation(userId, participantId);

    return res.status(201).json({
      success: true,
      message,
      data: {
        conversation,
        isNew,
      },
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
    const { userId } = req.user;
    const { name, memberIds = [], avatar = null } = req.body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Group name is required",
      });
    }

    if (!Array.isArray(memberIds)) {
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

    const { conversation, isNew, message } =
      await ConversationService.createGroupConversation(userId, name, memberIds, avatar);

    return res.status(201).json({
      success: true,
      message,
      data: {
        conversation,
        isNew,
      },
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
      message: "Conversations retrieved successfully",
      data: {
        conversations,
        pagination,
      },
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Lấy thông tin chi tiết một conversation
 */
const getConversationById = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const { userId } = req.user;

    if (!conversationId.match(/^[0-9a-fA-F]{24}$/)) {
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
      message: "Conversation retrieved successfully",
      data: conversation,
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
    const { memberIds = [] } = req.body;

    if (!conversationId.match(/^[0-9a-fA-F]{24}$/)) {
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

    const conversation = await ConversationService.addMemberToGroup(
      conversationId,
      userId,
      memberIds
    );

    return res.status(200).json({
      success: true,
      message: "Member added successfully",
      data: {
        conversation,
        conversationId,
      },
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

    if (
      !conversationId.match(/^[0-9a-fA-F]{24}$/) ||
      !memberId?.match(/^[0-9a-fA-F]{24}$/)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format",
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
      data: { conversation, conversationId },
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
    const { conversationId } = req.params;
    const { userId } = req.user;

    if (!conversationId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid conversation ID format",
      });
    }

    const result = await ConversationService.markAsRead(conversationId, userId);

    // read
    let io = getSocket();
    io.to(`conversation_${conversationId}`).emit("conversation:read", {
      conversationId,
      userId,
      lastReadMessage: result.lastReadMessage,
    });

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
    const { conversationId } = req.params;
    const { userId } = req.user;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 8;

    if (!conversationId.match(/^[0-9a-fA-F]{24}$/)) {
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
      message: "Images retrieved successfully",
      data: images,
    });
  } catch (error) {
    return next(error);
  }
};

// Rời nhóm
const leaveGroup = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const { userId } = req.user;

    if (!conversationId.match(/^[0-9a-fA-F]{24}$/)) {
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
    const { conversationId } = req.params;
    const { userId } = req.user;
    const { newOwnerId } = req.body;

    if (!conversationId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid conversation ID format",
      });
    }

    if (!newOwnerId || !newOwnerId.match(/^[0-9a-fA-F]{24}$/)) {
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

/**
 * Xóa hội thoại của chính tôi (soft delete)
 */
const deleteConversationForMe = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const { userId } = req.user;

    if (!conversationId.match(/^[0-9a-fA-F]{24}$/)) {
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
};
