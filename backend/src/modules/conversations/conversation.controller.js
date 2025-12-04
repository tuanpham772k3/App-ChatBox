import {
  createPrivateConversation,
  getUserConversations,
  getConversationById,
  deleteConversation,
  createGroupConversationService,
  addMemberToGroupService,
  removeMemberFromGroupService,
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
export const createConversation = async (req, res) => {
  try {
    // Lấy userId từ JWT token (đã được middleware authenticate xử lý)
    const { userId } = req.user;

    // Lấy participantId từ request body
    const { participantId } = req.body;

    // Validation cơ bản
    if (!participantId) {
      return res.status(400).json({
        success: false,
        message: "Participant ID is required",
        idCode: 1,
      });
    }

    // Kiểm tra participantId có đúng format ObjectId không
    if (!participantId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid participant ID format",
        idCode: 2,
      });
    }

    // Gọi service tạo conversation
    const result = await createPrivateConversation(userId, participantId);

    // Trả về response thành công
    return res.status(201).json({
      success: true,
      message: result.message,
      idCode: 0,
      data: {
        conversation: result.conversation,
        isNew: result.isNew,
      },
    });
  } catch (error) {
    console.error("Error in createConversation controller:", error);

    // Xử lý các loại lỗi khác nhau
    if (
      error.message === "Creator not found" ||
      error.message === "Participant not found"
    ) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        idCode: 3,
      });
    }

    if (error.message === "Cannot create conversation with yourself") {
      return res.status(400).json({
        success: false,
        message: "Cannot create conversation with yourself",
        idCode: 4,
      });
    }

    // Lỗi server
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      idCode: 5,
    });
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
export const createGroupConversation = async (req, res) => {
  try {
    // Lấy userId từ JWT token
    const { userId } = req.user;

    // Lấy request body
    const { name, memberIds = [], avatar = null } = req.body;

    // Validate base
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Group name is required",
        idCode: 1,
      });
    }

    if (!Array.isArray(memberIds)) {
      return res.status(400).json({
        success: false,
        message: "Member must be an array of user IDs",
        idCode: 2,
      });
    }

    if (memberIds.length < 2) {
      return res.status(400).json({
        success: false,
        message: "A group needs at least 3 members",
        idCode: 3,
      });
    }

    const result = await createGroupConversationService(userId, name, memberIds, avatar);

    // Trả kết quả
    return res.status(201).json({
      success: true,
      message: result.message,
      idCode: 0,
      data: result.conversation,
    });
  } catch (error) {
    console.error("Error in createGroupConversation controller:", error);

    if (
      error.message === "Creator not found" ||
      error.message === "Some members not found"
    ) {
      return res.status(404).json({
        success: false,
        message: error.message,
        idCode: 4,
      });
    }

    if (error.message === "A group needs at least 3 members") {
      return res.status(400).json({
        success: false,
        message: "A group needs at least 3 members",
        idCode: 5,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      idCode: 6,
    });
  }
};

/**
 * Thêm thành viên vào group
 * PUT /api/conversations/:conversationId/members
 */
export const addMemberToGroup = async (req, res) => {
  try {
    const { userId } = req.user;
    const { conversationId } = req.params;
    const { memberIds = [] } = req.body;

    // Validate base
    if (!conversationId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format",
        idCode: 1,
      });
    }

    if (!Array.isArray(memberIds) || memberIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "memberIds must be a non-empty array",
        idCode: 2,
      });
    }

    const conversation = await addMemberToGroupService(conversationId, userId, memberIds);

    return res.status(200).json({
      success: true,
      message: "Member added successfully",
      idCode: 0,
      data: conversation,
    });
  } catch (error) {
    console.error("Error in addMemberToGroup controller:", error);

    if (error.message === "Group conversation not found") {
      return res.status(404).json({
        success: false,
        message: "Group conversation not found",
        idCode: 3,
      });
    }

    if (error.message === "Permission denied") {
      return res.status(403).json({
        success: false,
        message: "Permission denied",
        idCode: 4,
      });
    }

    if (error.message === "User not found") {
      return res.status(404).json({
        success: false,
        message: "User not found",
        idCode: 5,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      idCode: 6,
    });
  }
};

/**
 * Xóa thành viên khỏi group
 * DELETE /api/conversations/:conversationId/members/:memberId
 */
export const removeMemberFromGroup = async (req, res) => {
  try {
    const { userId } = req.user;
    const { conversationId, memberId } = req.params;

    // Validate base
    if (
      !conversationId.match(/^[0-9a-fA-F]{24}$/) ||
      !memberId?.match(/^[0-9a-fA-F]{24}$/)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format",
        idCode: 1,
      });
    }

    // Gọi service
    const conversation = await removeMemberFromGroupService(
      conversationId,
      userId,
      memberId
    );

    // Trả về kết quả
    return res.status(200).json({
      success: true,
      message: "Member removed successfully",
      idCode: 0,
      data: conversation,
    });
  } catch (error) {
    console.error("Error in removeMemberFromGroup controller:", error);

    if (error.message === "Group conversation not found") {
      return res.status(404).json({
        success: false,
        message: "Group conversation not found",
        idCode: 2,
      });
    }

    if (error.message === "Permission denied") {
      return res.status(403).json({
        success: false,
        message: "Permission denied",
        idCode: 3,
      });
    }

    if (error.message === "Group must have at least 2 members") {
      return res.status(400).json({
        success: false,
        message: error.message,
        idCode: 4,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      idCode: 5,
    });
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
export const getConversations = async (req, res) => {
  try {
    // Lấy userId từ JWT token
    const { userId } = req.user;

    // Lấy pagination parameters từ query
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    // Validation pagination
    if (page < 1 || limit < 1 || limit > 100) {
      return res.status(400).json({
        success: false,
        message: "Invalid pagination parameters",
        idCode: 1,
      });
    }

    // Gọi service lấy danh sách conversation
    const result = await getUserConversations(userId, page, limit);

    // Trả về response thành công
    return res.status(200).json({
      success: true,
      message: "Conversations retrieved successfully",
      idCode: 0,
      data: result,
    });
  } catch (error) {
    console.error("Error in getConversations controller:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      idCode: 2,
    });
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
export const getConversation = async (req, res) => {
  try {
    // Lấy conversationId từ URL params
    const { conversationId } = req.params;

    // Lấy userId từ JWT token
    const { userId } = req.user;

    // Validation conversationId
    if (!conversationId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid conversation ID format",
        idCode: 1,
      });
    }

    // Gọi service lấy thông tin conversation
    const conversation = await getConversationById(conversationId, userId);

    // Trả về response thành công
    return res.status(200).json({
      success: true,
      message: "Conversation retrieved successfully",
      idCode: 0,
      data: conversation,
    });
  } catch (error) {
    console.error("Error in getConversation controller:", error);

    // Xử lý lỗi không tìm thấy conversation
    if (error.message === "Conversation not found or access denied") {
      return res.status(404).json({
        success: false,
        message: "Conversation not found or access denied",
        idCode: 2,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      idCode: 3,
    });
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
export const deleteConversationById = async (req, res) => {
  try {
    // Lấy conversationId từ URL params
    const { conversationId } = req.params;

    // Lấy userId từ JWT token
    const { userId } = req.user;

    // Validation conversationId
    if (!conversationId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid conversation ID format",
        idCode: 1,
      });
    }

    // Gọi service xóa conversation
    const result = await deleteConversation(conversationId, userId);

    // Trả về response thành công
    return res.status(200).json({
      success: true,
      message: result.message,
      idCode: 0,
      data: result,
    });
  } catch (error) {
    console.error("Error in deleteConversationById controller:", error);

    // Xử lý lỗi không tìm thấy conversation
    if (error.message === "Conversation not found or access denied") {
      return res.status(404).json({
        success: false,
        message: "Conversation not found or access denied",
        idCode: 2,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      idCode: 3,
    });
  }
};
