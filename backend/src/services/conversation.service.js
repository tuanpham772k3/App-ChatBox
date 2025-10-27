import Conversation from "../models/conversation.model.js";
import User from "../models/user.model.js";

/**
 * Service layer xử lý logic nghiệp vụ cho Conversation
 * Tách biệt logic khỏi controller để dễ test và tái sử dụng
 */

/**
 * Tạo conversation 1-1 giữa 2 người dùng
 * @param {string} creatorId - ID của người tạo conversation
 * @param {string} participantId - ID của người tham gia
 * @returns {Object} - Conversation object đã tạo
 */
export const createPrivateConversation = async (creatorId, participantId) => {
  try {
    // 1. Kiểm tra người tạo có tồn tại không
    const creator = await User.findById(creatorId);
    if (!creator) {
      throw new Error("Creator not found");
    }

    // 2. Kiểm tra người tham gia có tồn tại không
    const participant = await User.findById(participantId);
    if (!participant) {
      throw new Error("Participant not found");
    }

    // 3. Kiểm tra không được tạo conversation với chính mình
    if (creatorId === participantId) {
      throw new Error("Cannot create conversation with yourself");
    }

    // 4. Kiểm tra đã có conversation 1-1 giữa 2 người này chưa
    // Tìm conversation private có cả 2 người tham gia
    const existingConversation = await Conversation.findOne({
      type: "private",
      participants: { $all: [creatorId, participantId] },
      isActive: true, // Chỉ tìm conversation đang hoạt động
    });

    if (existingConversation) {
      // Nếu đã có conversation, trả về conversation đó
      return {
        conversation: existingConversation,
        isNew: false,
        message: "Conversation already exists"
      };
    }

    // 5. Tạo conversation mới
    const newConversation = new Conversation({
      type: "private",
      participants: [creatorId, participantId],
      // Với private chat, name và avatar sẽ là null (theo schema)
      name: null,
      avatar: {
        url: null,
        public_id: null
      },
      lastMessage: {
        sender: null,
        content: null,
        createdAt: null
      },
      isActive: true,
      admin: [] // Private chat không có admin
    });

    // 6. Lưu vào database
    const savedConversation = await newConversation.save();

    // 7. Populate thông tin người tham gia để trả về đầy đủ
    const populatedConversation = await Conversation.findById(savedConversation._id)
      .populate('participants', 'username email avatarUrl bio status lastSeenAt')
      .populate('lastMessage.sender', 'username avatarUrl')
      .lean(); // lean() để trả về plain object thay vì Mongoose document

    return {
      conversation: populatedConversation,
      isNew: true,
      message: "Conversation created successfully"
    };

  } catch (error) {
    console.error("Error in createPrivateConversation service:", error);
    throw error; // Re-throw để controller xử lý
  }
};

/**
 * Lấy danh sách conversation của một user
 * @param {string} userId - ID của user
 * @param {number} page - Trang hiện tại (pagination)
 * @param {number} limit - Số conversation mỗi trang
 * @returns {Object} - Danh sách conversation với pagination
 */
export const getUserConversations = async (userId, page = 1, limit = 20) => {
  try {
    const skip = (page - 1) * limit;

    // Tìm tất cả conversation mà user tham gia
    const conversations = await Conversation.find({
      participants: userId,
      isActive: true
    })
    .populate('participants', 'username email avatarUrl bio status lastSeenAt')
    .populate('lastMessage.sender', 'username avatarUrl')
    .sort({ 'lastMessage.createdAt': -1, updatedAt: -1 }) // Sắp xếp theo tin nhắn cuối hoặc thời gian cập nhật
    .skip(skip)
    .limit(limit)
    .lean();

    // Đếm tổng số conversation
    const total = await Conversation.countDocuments({
      participants: userId,
      isActive: true
    });

    return {
      conversations,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      }
    };

  } catch (error) {
    console.error("Error in getUserConversations service:", error);
    throw error;
  }
};

/**
 * Lấy thông tin chi tiết một conversation
 * @param {string} conversationId - ID của conversation
 * @param {string} userId - ID của user (để kiểm tra quyền truy cập)
 * @returns {Object} - Thông tin conversation
 */
export const getConversationById = async (conversationId, userId) => {
  try {
    // Tìm conversation và kiểm tra user có tham gia không
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId,
      isActive: true
    })
    .populate('participants', 'username email avatarUrl bio status lastSeenAt')
    .populate('lastMessage.sender', 'username avatarUrl')
    .lean();

    if (!conversation) {
      throw new Error("Conversation not found or access denied");
    }

    return conversation;

  } catch (error) {
    console.error("Error in getConversationById service:", error);
    throw error;
  }
};

/**
 * Xóa conversation (soft delete)
 * @param {string} conversationId - ID của conversation
 * @param {string} userId - ID của user thực hiện xóa
 * @returns {Object} - Kết quả xóa
 */
export const deleteConversation = async (conversationId, userId) => {
  try {
    // Kiểm tra user có tham gia conversation không
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId,
      isActive: true
    });

    if (!conversation) {
      throw new Error("Conversation not found or access denied");
    }

    // Soft delete: chỉ đánh dấu isActive = false
    await Conversation.findByIdAndUpdate(conversationId, {
      isActive: false
    });

    return {
      success: true,
      message: "Conversation deleted successfully"
    };

  } catch (error) {
    console.error("Error in deleteConversation service:", error);
    throw error;
  }
};

