import { getSocket } from "../../socket.js";
import {
  createPrivateConversation,
  getUserConversations,
  getConversationById,
  deleteConversation,
  createGroupConversationService,
  addMemberToGroupService,
  removeMemberFromGroupService,
  markConversationAsReadService,
  getConversationImagesService,
  leaveGroupService,
  transferGroupOwnershipService,
  deleteConversationForMeService,
} from "./conversation.service.js";

/**
 * Controller layer xử lý HTTP request/response cho Conversation
 * Nhận request từ route, gọi service, trả về response cho client
 */

/**
 * Tạo conversation 1-1
 * POST /api/conversations/private
 *
 * Flow:
 * 1. Nhận request từ client với participantId
 * 2. Lấy userId từ JWT token (đã được middleware xác thực)
 * 3. Gọi service tạo conversation
 * 4. Trả về response cho client
 */
export const createConversation = async (req, res, next) => {
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

    const { conversation, isNew, message } = await createPrivateConversation(
      userId,
      participantId
    );

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
 * POST /api/conversations/group
 *
 * Flow:
 * 1. Nhận request từ client với participantId
 * 2. Lấy userId từ JWT token (đã được middleware xác thực)
 * 3. Gọi service tạo conversation
 * 4. Trả về response cho client
 */
export const createGroupConversation = async (req, res, next) => {
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

    const { conversation, isNew, message } = await createGroupConversationService(
      userId,
      name,
      memberIds,
      avatar
    );

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
 * GET /api/conversations?page=1&limit=20
 *
 * Flow:
 * 1. Lấy userId từ JWT token
 * 2. Lấy page và limit từ query parameters
 * 3. Gọi service lấy danh sách conversation
 * 4. Trả về response với pagination
 */
export const getConversations = async (req, res, next) => {
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

    const { conversations, pagination } = await getUserConversations(userId, page, limit);

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
 * GET /api/conversations/:conversationId
 *
 * Flow:
 * 1. Lấy conversationId từ URL params
 * 2. Lấy userId từ JWT token
 * 3. Gọi service lấy thông tin conversation
 * 4. Trả về response
 */
export const getConversation = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const { userId } = req.user;

    if (!conversationId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid conversation ID format",
      });
    }

    const conversation = await getConversationById(conversationId, userId);

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
 * Xóa conversation (soft delete)
 * DELETE /api/conversations/:conversationId
 *
 * Flow:
 * 1. Lấy conversationId từ URL params
 * 2. Lấy userId từ JWT token
 * 3. Gọi service xóa conversation
 * 4. Trả về response
 */
export const deleteConversationById = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { conversationId } = req.params;

    if (!conversationId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid conversation ID format",
      });
    }

    await deleteConversation(conversationId, userId);

    return res.status(200).json({
      success: true,
      message: "Conversation deleted successfully",
      data: null,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Thêm thành viên vào group
 * PUT /api/conversations/:conversationId/members
 */
export const addMemberToGroup = async (req, res, next) => {
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

    const conversation = await addMemberToGroupService(conversationId, userId, memberIds);

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
 * DELETE /api/conversations/:conversationId/members/:memberId
 */
export const removeMemberFromGroup = async (req, res, next) => {
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

    const conversation = await removeMemberFromGroupService(
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
 * PUT /api/conversations/:conversationId/read
 *
 * Flow:
 * 1. Lấy conversationId từ URL params
 * 2. Lấy userId từ JWT token
 * 3. Gọi service
 * 4. Trả về response
 */
export const markConversationAsRead = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const { userId } = req.user;

    if (!conversationId.match(/^[0-9a-fA-F]{24}$/)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid conversation ID format" });
    }

    const result = await markConversationAsReadService(conversationId, userId);

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
export const getConversationImages = async (req, res, next) => {
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

    const images = await getConversationImagesService(
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
export const leaveGroup = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const { userId } = req.user;

    if (!conversationId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid conversation ID format",
      });
    }

    await leaveGroupService(conversationId, userId);

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
export const transferGroupOwnership = async (req, res, next) => {
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

    await transferGroupOwnershipService(conversationId, userId, newOwnerId);

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
 * DELETE /api/conversations/:conversationId/for-me
 */
export const deleteConversationForMe = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const { userId } = req.user;

    if (!conversationId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid conversation ID format",
      });
    }

    await deleteConversationForMeService(conversationId, userId);

    return res.status(200).json({
      success: true,
      message: "Delete conversation successfully",
      data: null,
    });
  } catch (error) {
    return next(error);
  }
};
