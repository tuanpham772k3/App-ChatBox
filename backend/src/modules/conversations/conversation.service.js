const Conversation = require("./conversation.model.js");
const User = require("../users/user.model.js");
const Message = require("../messages/message.model.js");
const { AppError } = require("../../utils/AppError.js");

const ConversationService = {
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
  createPrivateConversation: async (creatorId, participantId) => {
    const creator = await User.findById(creatorId);
    if (!creator) {
      throw new AppError("Creator not found", 404);
    }

    const participant = await User.findById(participantId);
    if (!participant) {
      throw new AppError("Participant not found", 404);
    }

    if (creatorId.toString() === participantId.toString()) {
      throw new AppError("Cannot create conversation with yourself", 400);
    }

    // Kiểm tra đã có conversation 1-1 giữa 2 người này chưa
    // Vì participants là subdocs, ta cần kiểm tra existence bằng 2 điều kiện
    const existingConversation = await Conversation.findOne({
      type: "private",
      isActive: true,
      $and: [{ "participants.user": creatorId }, { "participants.user": participantId }],
    });

    if (existingConversation) {
      return {
        conversation: existingConversation,
        isNew: false,
        message: "Conversation already exists",
      };
    }

    // Tạo conversation mới
    const newConversation = new Conversation({
      type: "private",
      participants: [
        { user: creatorId, lastReadMessage: null, lastReadAt: null, unreadCount: 0 },
        { user: participantId, lastReadMessage: null, lastReadAt: null, unreadCount: 0 },
      ],
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
    });

    const savedConversation = await newConversation.save();

    const populatedConversation = await Conversation.findById(savedConversation._id)
      .populate("participants.user", "username email avatarUrl bio presence lastSeenAt")
      .populate("lastMessage.sender", "username avatarUrl")
      .lean();

    return {
      conversation: populatedConversation,
      isNew: true,
      message: "Conversation created successfully",
    };
  },

  /**
   * Tạo group conversation
   * @param {string} creatorId - ID của người tạo conversation
   * @param {string} name - Tên group
   * @param {string[]} memberIds - Danh sách ID của người tham gia (không bắt buộc chứa creator, sẽ tự thêm)
   * @param {string|null} avatarUrl - URL avatar group (có thể null)
   * @returns {Object} - { conversation, isNew, message }
   */
  createGroupConversation: async (creatorId, name, memberIds, avatarUrl) => {
    const creator = await User.findById(creatorId);
    if (!creator) {
      throw new AppError("Creator not found", 404);
    }

    // Chuẩn hóa danh sách members:
    //    - Loại bỏ trùng lặp
    //    - Đảm bảo creator cũng là 1 participant
    const memberSet = new Set(memberIds.map((id) => id));
    memberSet.add(creatorId);
    const finalMemberIds = Array.from(memberSet);

    if (finalMemberIds.length < 3) {
      throw new AppError("A group needs at least 3 members", 400);
    }

    // Kiểm tra tất cả thành viên có tồn tại
    const users = await User.find({ _id: { $in: finalMemberIds } });
    if (users.length !== finalMemberIds.length) {
      throw new AppError("Some members not found", 404);
    }

    // Build participants theo ĐÚNG SUBDOC SCHEMA
    const participants = finalMemberIds.map((userId) => ({
      user: userId,
      role: userId === creatorId ? "owner" : "member", // Creator là owner, còn lại là member
      lastReadMessage: null,
      lastReadAt: null,
      unreadCount: 0,
    }));

    // Tạo conversation mới
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
    });

    const savedConversation = await newConversation.save();

    const populatedConversation = await Conversation.findById(savedConversation._id)
      .populate("participants.user", "username email avatarUrl bio presence lastSeenAt")
      .populate("lastMessage.sender", "username avatarUrl")
      .lean();

    return {
      conversation: populatedConversation,
      isNew: true,
      message: "Group conversation created successfully",
    };
  },

  /**
   * Lấy danh sách conversation của một user
   * @param {string} userId - ID của user
   * @param {number} page - Trang hiện tại (pagination)
   * @param {number} limit - Số conversation mỗi trang
   * @returns {Object} - Danh sách conversation với pagination
   */
  getConversations: async (userId, page = 1, limit = 20) => {
    const skip = (page - 1) * limit;

    // Tìm tất cả conversation mà user tham gia và chưa xóa phía mình(deletedAt: null)
    const conversations = await Conversation.find({
      isActive: true,
      participants: {
        $elemMatch: {
          user: userId,
          deletedAt: null,
        },
      },
    })
      .populate("participants.user", "username email avatarUrl bio presence lastSeenAt")
      .populate("lastMessage.sender", "username avatarUrl")
      .sort({ "lastMessage.createdAt": -1, updatedAt: -1 }) // Sắp xếp theo tin nhắn cuối hoặc thời gian cập nhật
      .skip(skip)
      .limit(limit)
      .lean();

    // 2. Total conversation
    const total = await Conversation.countDocuments({
      "participants.user": userId,
      isActive: true,
      "participants.deletedAt": null, // Chỉ đếm những conversation mà user chưa xóa phía mình
    });

    return {
      conversations,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
      },
    };
  },

  /**
   * Thêm thành viên vào group
   * @param {string} conversationId - ID group
   * @param {string} memberId - ID user cần thêm
   */
  addMemberToGroup: async (conversationId, memberIds, userId) => {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !conversation.isActive || conversation.type !== "group") {
      throw new AppError("Group conversation not found", 404);
    }

    const currentUser = conversation.participants.find(
      (p) => p.user.toString() === userId
    );

    if (!currentUser || currentUser.role !== "owner") {
      throw new AppError("Only owner can add members", 403);
    }

    const users = await User.find({ _id: { $in: memberIds } });
    if (users.length !== memberIds.length) {
      throw new AppError("One or more users not found", 404);
    }

    // Lấy tất cả ID thành viên đã có trong group && check trùng lặp
    const existingMemberIds = conversation.participants.map((p) => p.user.toString());
    const duplicateIds = memberIds.filter((memberId) =>
      existingMemberIds.includes(memberId)
    );

    if (duplicateIds.length > 0) {
      throw new AppError("Some users already exist in group", 400);
    }

    // Lọc ra những người không có trong group
    const newMemberIds = memberIds.filter(
      (memberId) => !conversation.participants.some((p) => p.user.toString() === memberId)
    );

    // Chuẩn hóa theo schema
    const formattedNewMembers = newMemberIds.map((newMemberId) => ({
      user: newMemberId,
      lastReadMessage: null,
      lastReadAt: null,
      unreadCount: 0,
    }));

    // Thêm vào participants và lưu
    conversation.participants.push(...formattedNewMembers);
    await conversation.save();

    const populatedConversation = await Conversation.findById(conversationId)
      .populate("participants.user", "username email avatarUrl bio status lastSeenAt")
      .populate("lastMessage.sender", "username avatarUrl")
      .lean();

    return populatedConversation;
  },

  /**
   * Xóa thành viên khỏi group
   * @param {string} conversationId - ID group
   * @param {string} currentUserId - ID user đang thực hiện
   * @param {string} memberId - ID user cần xóa
   */
  removeMemberFromGroup: async (conversationId, currentUserId, memberId) => {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !conversation.isActive || conversation.type !== "group") {
      throw new AppError("Group conversation not found", 404);
    }

    // Chỉ admin mới được xóa thành viên
    const isAdmin = conversation.participants.some(
      (p) => p.user.toString() === currentUserId && ["owner", "admin"].includes(p.role)
    );
    if (!isAdmin) {
      throw new AppError("Just owner and admin can remove members", 403);
    }

    // Không được xóa chính mình
    if (currentUserId === memberId) {
      throw new AppError("Cannot remove themselves", 403);
    }

    // Xóa trực tiếp thành viên (=$pull) và trả về conversation đã được populate đầy đủ
    const updatedConversation = await Conversation.findByIdAndUpdate(
      conversationId,
      {
        $pull: { participants: { user: memberId } },
      },
      { new: true }
    )
      .populate("participants.user", "username email avatarUrl bio presence lastSeenAt")
      .populate("lastMessage.sender", "username avatarUrl")
      .lean();

    return updatedConversation;
  },

  /**
   * Lấy thông tin chi tiết một conversation
   * @param {string} conversationId - ID của conversation
   * @param {string} userId - ID của user (để kiểm tra quyền truy cập)
   * @returns {Object} - Thông tin conversation
   */
  getConversationById: async (conversationId, userId) => {
    const conversation = await Conversation.findOne({
      _id: conversationId,
      "participants.user": userId,
      isActive: true,
    })
      .populate("participants.user", "username email avatarUrl bio presence lastSeenAt")
      .populate("lastMessage.sender", "username avatarUrl")
      .lean();

    if (!conversation) {
      throw new AppError("Conversation not found or access denied", 404);
    }

    return conversation;
  },

  /**
   * Đánh dấu đã đọc
   * @param {string} conversationId - ID của conversation
   * @param {string} userId - ID của user đang đăng nhập
   * @returns {Object} - Kết quả xóa
   */
  markAsRead: async (conversationId, userId) => {
    const conv = await Conversation.findOne({
      _id: conversationId,
      "participants.user": userId,
      isActive: true,
    });

    if (!conv) throw new AppError("Conversation not found", 404);

    // Cập nhật participant: lastReadAt, lastReadMessage, unreadCount = 0
    const lastReadMessage = conv.lastMessage?._id || null;
    const participant = conv.participants.find((p) => p.user.toString() === userId);

    participant.lastReadAt = new Date();
    participant.lastReadMessage = lastReadMessage;
    participant.unreadCount = 0;

    await conv.save();

    return { lastReadMessage };
  },

  /**
   * Lấy danh sách ảnh trong conversation
   * @param {string} conversationId - ID của conversation
   * @param {string} userId - ID của user đang đăng nhập
   * @param {number} page - Trang hiện tại
   * @param {string} limit - giới số lượng hạn số image
   * @returns {Object} - Kết quả xóa
   */
  getConversationImages: async (conversationId, userId, page = 1, limit = 8) => {
    const conversation = await Conversation.findOne({
      _id: conversationId,
      "participants.user": userId,
      isActive: true,
    }).select("_id");

    if (!conversation) {
      throw new AppError("Conversation not found or access denied", 404);
    }

    // Query ảnh
    const skip = (page - 1) * limit;

    const images = await Message.find({
      conversation: conversationId,
      isDeleted: false,
      $or: [{ type: "image" }, { "file.mimeType": { $regex: /^image\// } }],
    })
      .select("file sender createdAt")
      .populate("sender", "username avatarUrl")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return images;
  },

  /**
   * Rời khỏi group conversation
   * @param {string} conversationId - ID của conversation
   * @param {string} userId - ID của user đang đăng nhập
   * @returns {Object} - Kết quả rời khỏi group
   */
  leaveGroup: async (conversationId, userId) => {
    const conversation = await Conversation.findOne({
      _id: conversationId,
      "participants.user": userId,
      isActive: true,
    });

    if (!conversation) {
      throw new AppError("Group conversation not found", 404);
    }

    if (conversation.type !== "group") {
      throw new AppError("Not a group conversation", 400);
    }

    // Owner chưa chuyển quyền thì không được rời khỏi group
    const owner = conversation.participants.some(
      (p) => p.role === "owner" && p.user.toString() === userId
    );
    if (owner) {
      throw new AppError("Owner cannot leave the group. Please transfer ownership.", 403);
    }

    // Rời khỏi group
    conversation.participants = conversation.participants.filter(
      (p) => p.user.toString() !== userId
    );

    await conversation.save();

    return conversation;
  },

  /**
   * Chuyển nhượng quyền sở hữu group conversation
   * @param {string} conversationId
   * @param {string} currentUserId
   * @param {string} newOwnerId
   */
  transferGroupOwnership: async (conversationId, currentUserId, newOwnerId) => {
    const conversation = await Conversation.findOne({
      _id: conversationId,
      "participants.user": currentUserId,
      isActive: true,
    });

    if (!conversation) {
      throw new AppError("Group conversation not found", 404);
    }

    const owner = conversation.participants.find(
      (p) => p.user.toString() === currentUserId && p.role === "owner"
    );

    if (!owner) {
      throw new AppError("Permission denied", 403);
    }

    const newOwner = conversation.participants.find(
      (p) => p.user.toString() === newOwnerId
    );

    if (!newOwner) {
      throw new AppError("New owner is not a member of the group", 403);
    }

    owner.role = "member";
    newOwner.role = "owner";

    await conversation.save();

    return conversation;
  },

  /**
   * Xóa hội thoại phía tôi (soft delete)
   * @param {string} conversationId - ID của conversation
   * @param {string} userId - ID của user đang đăng nhập
   * @returns {Object} - Kết quả xóa
   */
  deleteConversationForMe: async (conversationId, userId) => {
    const conversation = await Conversation.findOne({
      _id: conversationId,
      "participants.user": userId,
      isActive: true,
    });

    if (!conversation) {
      throw new AppError("Conversation not found or access denied", 404);
    }

    // Đánh dấu là đã xóa
    await Conversation.updateOne(
      { _id: conversationId, "participants.user": userId },
      {
        $set: {
          "participants.$.deletedAt": new Date(),
          "participants.$.clearedMessagesHistoryAt": new Date(),
          "participants.$.lastReadMessage": null,
          "participants.$.lastReadAt": null,
          "participants.$.unreadCount": 0,
        },
      }
    );

    return true;
  },
};

module.exports = ConversationService;
