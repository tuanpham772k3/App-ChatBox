import Conversation from "./conversation.model.js";
import User from "../users/user.model.js";
import Message from "../messages/message.model.js";

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
    if (creatorId.toString() === participantId.toString()) {
      throw new Error("Cannot create conversation with yourself");
    }

    // 4. Kiểm tra đã có conversation 1-1 giữa 2 người này chưa
    // Vì participants là subdocs, ta cần kiểm tra existence bằng 2 điều kiện
    const existingConversation = await Conversation.findOne({
      type: "private",
      isActive: true, // Chỉ tìm conversation đang hoạt động
      $and: [{ "participants.user": creatorId }, { "participants.user": participantId }],
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
      participants: [
        { user: creatorId, lastReadMessage: null, lastReadAt: null, unreadCount: 0 },
        { user: participantId, lastReadMessage: null, lastReadAt: null, unreadCount: 0 },
      ],
      // Với private chat, name và avatar sẽ là null (theo schema)
      name: null,
      avatar: {
        url: null,
        public_id: null,
      },
      lastMessage: {
        _id: null,
        sender: null,
        type: null,
        content: null,
        file: null,
        isDeleted: false,
        createdAt: null,
      },
      isActive: true,
      admin: [], // Private chat không có admin
    });

    // 6. Lưu vào database
    const savedConversation = await newConversation.save();

    // 7. Populate thông tin người tham gia để trả về đầy đủ
    const populatedConversation = await Conversation.findById(savedConversation._id)
      .populate("participants.user", "username email avatarUrl bio status lastSeenAt")
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
  memberIds,
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
    const rawMemberIds = Array.isArray(memberIds) ? memberIds : [];
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

    // 5. Build participants theo ĐÚNG SUBDOC SCHEMA
    const participants = finalMemberIds.map((userId) => ({
      user: userId,
      lastReadMessage: null,
      lastReadAt: null,
      unreadCount: 0,
    }));

    // 6. Tạo conversation mới
    const newConversation = new Conversation({
      type: "group",
      participants,
      name,
      avatar: {
        url: avatarUrl || null,
        public_id: null,
      },
      lastMessage: {
        _id: null,
        sender: null,
        type: null,
        content: null,
        file: null,
        isDeleted: false,
        createdAt: null,
      },
      isActive: true,
      admin: [creatorId], // Người tạo là admin mặc định
    });

    // 6. Lưu vào database
    const savedConversation = await newConversation.save();

    // 7. Populate thông tin người tham gia để trả về đầy đủ
    const populatedConversation = await Conversation.findById(savedConversation._id)
      .populate("participants.user", "username email avatarUrl bio status lastSeenAt")
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
      "participants.user": userId,
      isActive: true,
    })
      .populate("participants.user", "username email avatarUrl bio status lastSeenAt")
      .populate("lastMessage.sender", "username avatarUrl")
      .sort({ "lastMessage.createdAt": -1, updatedAt: -1 }) // Sắp xếp theo tin nhắn cuối hoặc thời gian cập nhật
      .skip(skip)
      .limit(limit)
      .lean();

    // Tính tổng số tin nhắn chưa đọc cho từng conversation bằng aggregation
    const conversationIds = conversations.map((c) => c._id);
    const participantLastReadMap = {};
    conversations.forEach((c) => {
      const p = c.participants.find((pp) =>
        pp.user._id
          ? pp.user._id.toString() === userId.toString()
          : pp.user.toString() === userId.toString()
      );
      participantLastReadMap[c._id.toString()] = p?.lastReadAt
        ? new Date(p.lastReadAt)
        : new Date(0);
    });

    // 3. Aggregation: đếm messages per conversation where createdAt > participant.lastReadAt
    const unreadCounts = {};
    await Promise.all(
      conversationIds.map(async (cid) => {
        const lastReadAt = participantLastReadMap[cid.toString()] || new Date(0);
        const cnt = await Message.countDocuments({
          conversation: cid,
          isDeleted: false,
          createdAt: { $gt: lastReadAt },
          // optionally exclude messages from the user themself:
          // sender: { $ne: userId },
        });
        unreadCounts[cid.toString()] = cnt;
      })
    );

    // 4. Attach unreadCount into conversations
    const conversationsWithUnread = conversations.map((conv) => ({
      ...conv,
      unreadCount: unreadCounts[conv._id.toString()] || 0,
    }));

    // 5. Total
    const total = await Conversation.countDocuments({
      "participants.user": userId,
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
  memberIds
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

    // Kiểm tra tất cả user tồn tại
    const users = await User.find({ _id: { $in: memberIds } });
    if (users.length !== memberIds.length) {
      throw new Error("One or more users not found");
    }

    // Lọc ra những người không có trong group
    const newMembers = memberIds.filter(
      (id) => !conversation.participants.some((p) => p.user.toString() === id.toString())
    );

    // Chuẩn hóa theo schema mới
    const formattedNewMembers = newMembers.map((id) => ({
      user: id,
      lastReadMessage: null,
      lastReadAt: null,
      unreadCount: 0,
    }));

    conversation.participants.push(...formattedNewMembers);
    await conversation.save();

    const populatedConversation = await Conversation.findById(conversationId)
      .populate("participants.user", "username email avatarUrl bio status lastSeenAt")
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
      .populate("participants.user", "username email avatarUrl bio status lastSeenAt")
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
      "participants.user": userId,
      isActive: true,
    })
      .populate("participants.user", "username email avatarUrl bio status lastSeenAt")
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
      "participants.user": userId,
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

/**
 * Đánh dấu đã đọc
 * @param {string} conversationId - ID của conversation
 * @param {string} userId - ID của user thực hiện xóa
 * @returns {Object} - Kết quả xóa
 */
export const markConversationAsReadService = async (conversationId, userId) => {
  try {
    const conv = await Conversation.findOne({
      _id: conversationId,
      "participants.user": userId,
      isActive: true,
    });

    if (!conv) throw new Error("Group conversation not found");

    // trước khi cập nhật, tính unread count: đếm messages createdAt > participant.lastReadAt (hoặc > 0 nếu null)
    const participant = conv.participants.find(
      (p) => p.user.toString() === userId.toString()
    );
    const lastReadAt = participant?.lastReadAt || new Date(0);

    const unreadCount = await Message.countDocuments({
      conversation: conversationId,
      isDeleted: false,
      createdAt: { $gt: lastReadAt },
      sender: { $ne: userId }, // optional: chỉ đếm message của người khác
    });

    // cập nhật participant.lastReadAt và lastReadMessage + reset unreadCount cho participant
    conv.participants = conv.participants.map((p) => {
      if (p.user.toString() === userId.toString()) {
        p.lastReadAt = new Date();
        p.lastReadMessage = conv.lastMessage?._id || null;
        p.unreadCount = 0;
      }
      return p;
    });

    await conv.save();

    return {
      success: true,
      message: "Conversation marked as read",
      unreadBefore: unreadCount,
    };
  } catch (error) {
    console.error("Error in markConversationAsReadService:", error);
    throw error;
  }
};
