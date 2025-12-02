import Conversation from "../models/conversation.model.js";
import User from "../models/user.model.js";
import Message from "../models/message.model.js";

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
        message: "Conversation already exists",
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
        public_id: null,
      },
      lastMessage: {
        sender: null,
        content: null,
        createdAt: null,
      },
      isActive: true,
      admin: [], // Private chat không có admin
    });

    // 6. Lưu vào database
    const savedConversation = await newConversation.save();

    // 7. Populate thông tin người tham gia để trả về đầy đủ
    const populatedConversation = await Conversation.findById(savedConversation._id)
      .populate("participants", "username email avatarUrl bio status lastSeenAt")
      .populate("lastMessage.sender", "username avatarUrl")
      .lean(); // lean() để trả về plain object thay vì Mongoose document

    return {
      conversation: populatedConversation,
      isNew: true,
      message: "Conversation created successfully",
    };
  } catch (error) {
    console.error("Error in createPrivateConversation service:", error);
    throw error; // Re-throw để controller xử lý
  }
};

/**
 * Tạo group conversation
 * @param {string} creatorId - ID của người tạo conversation
 * @param {string} name - Tên group
 * @param {string[]} members - Danh sách ID của người tham gia (không bắt buộc chứa creator, sẽ tự thêm)
 * @param {string|null} avatarUrl - URL avatar group (có thể null)
 * @returns {Object} - { conversation, isNew, message }
 */
export const createGroupConversationService = async (
  creatorId,
  name,
  members,
  avatarUrl
) => {
  try {
    // 1. Kiểm tra người tạo
    const creator = await User.findById(creatorId);
    if (!creator) {
      throw new Error("Creator not found");
    }

    // 2. Chuẩn hóa danh sách members:
    //    - Đảm bảo là mảng các string
    //    - Loại bỏ trùng lặp
    //    - Đảm bảo creator cũng là 1 participant
    const rawMemberIds = Array.isArray(members) ? members : [];
    const memberSet = new Set(rawMemberIds.map((id) => id.toString()));
    memberSet.add(creatorId.toString());
    const finalMemberIds = Array.from(memberSet);

    // 3. Đảm bảo có ít nhất 3 người (creator + 2 người nữa)
    if (finalMemberIds.length < 3) {
      throw new Error("A group needs at least 3 members");
    }

    // 4. Kiểm tra tất cả thành viên có tồn tại
    const users = await User.find({ _id: { $in: finalMemberIds } });
    if (users.length !== finalMemberIds.length) {
      throw new Error("Some members not found");
    }

    // 5. Tạo conversation mới
    const newConversation = new Conversation({
      type: "group",
      participants: finalMemberIds,
      name,
      avatar: {
        url: avatarUrl || null,
        public_id: null,
      },
      lastMessage: {
        sender: null,
        content: null,
        createdAt: null,
      },
      isActive: true,
      admin: [creatorId], // Người tạo là admin mặc định
    });

    // 6. Lưu vào database
    const savedConversation = await newConversation.save();

    // 7. Populate thông tin người tham gia để trả về đầy đủ
    const populatedConversation = await Conversation.findById(savedConversation._id)
      .populate("participants", "username email avatarUrl bio status lastSeenAt")
      .populate("lastMessage.sender", "username avatarUrl")
      .lean(); // lean() để trả về plain object thay vì Mongoose document

    return {
      conversation: populatedConversation,
      isNew: true,
      message: "Group conversation created successfully",
    };
  } catch (error) {
    console.error("Error in createGroupConversationService:", error);
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
      isActive: true,
    })
      .populate("participants", "username email avatarUrl bio status lastSeenAt")
      .populate("lastMessage.sender", "username avatarUrl")
      .sort({ "lastMessage.createdAt": -1, updatedAt: -1 }) // Sắp xếp theo tin nhắn cuối hoặc thời gian cập nhật
      .skip(skip)
      .limit(limit)
      .lean();

    // Tính tổng số tin nhắn chưa đọc cho từng conversation bằng aggregation
    const conversationIds = conversations.map((c) => c._id);

    const unreadCounts = await Message.aggregate([
      {
        $match: {
          conversation: { $in: conversationIds },
          isDeleted: false,
          "readBy.user": { $ne: userId },
        },
      },
      {
        $group: {
          _id: "$conversation",
          count: { $sum: 1 },
        },
      },
    ]);

    const unreadMap = unreadCounts.reduce((acc, item) => {
      acc[item._id.toString()] = item.count;
      return acc;
    }, {});

    const conversationsWithUnread = conversations.map((conv) => ({
      ...conv,
      unreadCount: unreadMap[conv._id.toString()] || 0,
    }));

    // Đếm tổng số conversation
    const total = await Conversation.countDocuments({
      participants: userId,
      isActive: true,
    });

    return {
      conversations: conversationsWithUnread,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
      },
    };
  } catch (error) {
    console.error("Error in getUserConversations service:", error);
    throw error;
  }
};

/**
 * Thêm thành viên vào group
 * @param {string} conversationId - ID group
 * @param {string} currentUserId - ID user đang thực hiện
 * @param {string} memberId - ID user cần thêm
 */
export const addMemberToGroupService = async (
  conversationId,
  currentUserId,
  memberId
) => {
  try {
    // Kiểm tra hội thoại tồn tại
    const conversation = await Conversation.findById(conversationId);

    if (!conversation || !conversation.isActive || conversation.type !== "group") {
      throw new Error("Group conversation not found");
    }

    // Chỉ admin mới được thêm thành viên
    const isAdmin = conversation.admin.some(
      (id) => id.toString() === currentUserId.toString()
    );
    if (!isAdmin) {
      throw new Error("Permission denied");
    }

    // Kiểm tra user tồn tại
    const user = await User.findById(memberId);
    if (!user) {
      throw new Error("User not found");
    }

    // Nếu đã là thành viên thì bỏ qua
    const alreadyInGroup = conversation.participants.some(
      (id) => id.toString() === memberId.toString()
    );
    if (!alreadyInGroup) {
      conversation.participants.push(memberId);
      await conversation.save();
    }

    const populatedConversation = await Conversation.findById(conversationId)
      .populate("participants", "username email avatarUrl bio status lastSeenAt")
      .populate("lastMessage.sender", "username avatarUrl")
      .lean();

    return populatedConversation;
  } catch (error) {
    console.error("Error in addMemberToGroupService:", error);
    throw error;
  }
};

/**
 * Xóa thành viên khỏi group
 * @param {string} conversationId - ID group
 * @param {string} currentUserId - ID user đang thực hiện
 * @param {string} memberId - ID user cần xóa
 */
export const removeMemberFromGroupService = async (
  conversationId,
  currentUserId,
  memberId
) => {
  try {
    const conversation = await Conversation.findById(conversationId);

    if (!conversation || !conversation.isActive || conversation.type !== "group") {
      throw new Error("Group conversation not found");
    }

    // Chỉ admin mới được xóa thành viên
    const isAdmin = conversation.admin.some(
      (id) => id.toString() === currentUserId.toString()
    );
    if (!isAdmin) {
      throw new Error("Permission denied");
    }

    // Không cho xóa nếu còn dưới 3 thành viên sau khi xóa
    const remaining = conversation.participants.filter(
      (id) => id.toString() !== memberId.toString()
    );
    if (remaining.length < 3) {
      throw new Error("Group must have at least 3 members");
    }

    conversation.participants = remaining;
    await conversation.save();

    const populatedConversation = await Conversation.findById(conversationId)
      .populate("participants", "username email avatarUrl bio status lastSeenAt")
      .populate("lastMessage.sender", "username avatarUrl")
      .lean();

    return populatedConversation;
  } catch (error) {
    console.error("Error in removeMemberFromGroupService:", error);
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
      isActive: true,
    })
      .populate("participants", "username email avatarUrl bio status lastSeenAt")
      .populate("lastMessage.sender", "username avatarUrl")
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
      isActive: true,
    });

    if (!conversation) {
      throw new Error("Conversation not found or access denied");
    }

    // Soft delete: chỉ đánh dấu isActive = false
    await Conversation.findByIdAndUpdate(conversationId, {
      isActive: false,
    });

    return {
      success: true,
      message: "Conversation deleted successfully",
    };
  } catch (error) {
    console.error("Error in deleteConversation service:", error);
    throw error;
  }
};
