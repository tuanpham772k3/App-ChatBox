const Conversation = require("./conversation.model.js");
const User = require("../users/user.model.js");
const Message = require("../messages/message.model.js");
const Relationship = require("../relationship/relationship.model.js");
const { AppError } = require("../../utils/AppError.js");

const ConversationService = {
  /**
   * Tạo conversation 1-1 giữa 2 người dùng
   * @param {string} creatorId - ID của người tạo conversation
   * @param {string} participantId - ID của người tham gia
   * @returns {Object} - Conversation object đã tạo
   */
  createPrivateConversation: async (creatorId, participantId) => {
    const usersCount = await User.countDocuments({
      _id: { $in: [creatorId, participantId] },
    });
    if (usersCount < 2) {
      throw new AppError("Creator or Participant not found", 404);
    }

    // Kiểm tra đã có conversation 1-1 giữa 2 người này chưa
    const existingConversation = await Conversation.findOne({
      type: "private",
      isActive: true,
      "participants.userId": { $all: [creatorId, participantId] },
    });

    if (existingConversation) {
      const populatedConversation = await existingConversation.populate([
        {
          path: "participants.userId",
          select: "username email avatar bio presence lastSeenAt",
        },
        {
          path: "lastMessage.senderId",
          select: "username avatar",
        },
      ]);

      return populatedConversation.toObject();
    }

    // Tạo conversation mới
    const newConversation = new Conversation({
      type: "private",
      participants: [{ userId: creatorId }, { userId: participantId }],
    });

    const savedConversation = await newConversation.save();

    const populatedConversation = await savedConversation.populate([
      {
        path: "participants.userId",
        select: "username email avatar bio presence lastSeenAt",
      },
      {
        path: "lastMessage.senderId",
        select: "username avatar",
      },
    ]);

    return populatedConversation.toObject();
  },

  /**
   * Tạo group conversation
   * @param {string} creatorId - ID của người tạo conversation
   * @param {string} name - Tên group
   * @param {string[]} memberIds - Danh sách ID của người tham gia (không bắt buộc chứa creator, sẽ tự thêm)
   * @param {string|null} avatar - URL avatar group (có thể null)
   * @returns {Object} - { conversation, isNew, message }
   */
  createGroupConversation: async (creatorId, name, memberIds, avatar) => {
    // Chuẩn hóa danh sách members:
    //    - Loại bỏ trùng lặp
    //    - Đảm bảo creator cũng là 1 participant
    const memberSet = new Set(memberIds);
    memberSet.add(creatorId);
    const finalMemberIds = Array.from(memberSet);

    if (finalMemberIds.length < 3) {
      throw new AppError("A group needs at least 3 members", 400);
    }

    // Kiểm tra tất cả thành viên (Đã bao gồm cả Creator)
    const membersCount = await User.countDocuments({ _id: { $in: finalMemberIds } });
    if (membersCount !== finalMemberIds.length) {
      throw new AppError("Some members not found", 404);
    }

    // Build participants theo ĐÚNG SUBDOC SCHEMA
    const participants = finalMemberIds.map((memberId) => ({
      userId: memberId,
      role: memberId === creatorId ? "owner" : "member", // Creator là owner, còn lại là member
      lastReadAt: null,
      lastDeliveredAt: null,
      unreadCount: 0,
    }));

    // Tạo conversation mới
    const newConversation = new Conversation({
      type: "group",
      participants,
      name,
      avatar: {
        url: avatar,
        public_id: null,
      },
    });

    const savedConversation = await newConversation.save();

    const populatedConversation = await savedConversation.populate([
      {
        path: "participants.userId",
        select: "username email avatar bio presence lastSeenAt",
      },
      { path: "lastMessage.senderId", select: "username avatar" },
    ]);

    return populatedConversation.toObject();
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

    const query = {
      isActive: true,
      "lastMessage.messageId": { $ne: null },
      participants: {
        $elemMatch: {
          userId: userId,
          deletedAt: null,
        },
      },
    };

    const [conversations, total] = await Promise.all([
      Conversation.find(query)
        .populate("participants.userId", "username email avatar bio presence lastSeenAt")
        .populate("lastMessage.senderId", "username avatar")
        .sort({
          "lastMessage.createdAt": -1,
          updatedAt: -1,
        })
        .skip(skip)
        .limit(limit)
        .lean(),

      Conversation.countDocuments(query),
    ]);

    // =========================
    // Lấy danh sách user còn lại
    // =========================

    const otherUserIds = conversations
      .filter((conversation) => conversation.type === "private")
      .map((conversation) => {
        const otherParticipant = conversation.participants.find(
          (participant) => participant.userId._id.toString() !== userId.toString()
        );

        return otherParticipant?.userId._id;
      })
      .filter(Boolean);

    // =========================
    // Lấy tất cả bạn bè trong 1 query
    // =========================

    const relationships = await Relationship.find({
      status: "accepted",
      $or: [
        {
          requesterId: userId,
          recipientId: {
            $in: otherUserIds,
          },
        },
        {
          recipientId: userId,
          requesterId: {
            $in: otherUserIds,
          },
        },
      ],
    })
      .select("requesterId recipientId")
      .lean();

    // =========================
    // Tạo set friend lookup O(1)
    // =========================

    const friendIds = new Set();

    relationships.forEach((relationship) => {
      const requesterId = relationship.requesterId.toString();
      const recipientId = relationship.recipientId.toString();

      if (requesterId === userId.toString()) {
        friendIds.add(recipientId);
      } else {
        friendIds.add(requesterId);
      }
    });

    // =========================
    // Gắn category cho conversation
    // =========================

    const formattedConversations = conversations.map((conversation) => {
      // Group chat
      if (conversation.type === "group") {
        return {
          ...conversation,
          conversationCategory: "group",
        };
      }

      const otherParticipant = conversation.participants.find(
        (participant) => participant.userId._id.toString() !== userId.toString()
      );

      const otherUserId = otherParticipant?.userId._id?.toString();

      const isFriend = friendIds.has(otherUserId);

      return {
        ...conversation,
        conversationCategory: isFriend ? "friend" : "stranger",
      };
    });

    return {
      conversations: formattedConversations,
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
    if (!conversation || conversation.type !== "group") {
      throw new AppError("Group conversation not found", 404);
    }

    // check quyền
    const isOwner = conversation.participants.some(
      (p) => p.userId?.equals(userId) && p.role === "owner"
    );

    if (!isOwner) {
      throw new AppError("Only owner can add members", 403);
    }

    const membersCount = await User.countDocuments({ _id: { $in: memberIds } });
    if (membersCount !== memberIds.length) {
      throw new AppError("One or more users not found", 404);
    }

    // lấy danh sách user đã có
    const existingIds = conversation.participants.map((p) => p.userId.toString());

    // lọc user mới
    const newMemberIds = memberIds.filter((id) => !existingIds.includes(id));

    if (newMemberIds.length === 0) {
      throw new AppError("All users already in group", 400);
    }

    // format
    const newMembers = newMemberIds.map((id) => ({ userId: id }));

    // Thêm vào participants và lưu
    conversation.participants.push(...newMembers);
    await conversation.save();

    await conversation.populate([
      {
        path: "participants.userId",
        select: "username email avatar bio status lastSeenAt",
      },
      {
        path: "lastMessage.senderId",
        select: "username avatar",
      },
    ]);

    return conversation.toObject();
  },

  /**
   * Xóa thành viên khỏi group
   * @param {string} conversationId - ID group
   * @param {string} currentUserId - ID user đang thực hiện
   * @param {string} memberId - ID user cần xóa
   */
  removeMemberFromGroup: async (conversationId, userId, memberId) => {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !conversation.isActive || conversation.type !== "group") {
      throw new AppError("Group conversation not found", 404);
    }

    // Chỉ admin, owner mới được xóa thành viên
    const isOwnerOrAdmin = conversation.participants.some(
      (p) => p.userId?.equals(userId) && ["owner", "admin"].includes(p.role)
    );
    if (!isOwnerOrAdmin) {
      throw new AppError("Just owner and admin can remove members", 403);
    }

    // check member tồn tại trong group
    const isMemberExist = conversation.participants.some((p) =>
      p.userId?.equals(memberId)
    );

    if (!isMemberExist) {
      throw new AppError("Member not found in group", 404);
    }

    // remove
    conversation.participants.pull({ userId: memberId });

    const updatedConversation = await conversation.save();

    const populateConversation = await Conversation.findById(updatedConversation._id)
      .populate([
        {
          path: "participants.userId",
          select: "username email avatar bio presence lastSeenAt",
        },
        {
          path: "lastMessage.senderId",
          select: "username avatar",
        },
      ])
      .lean();

    return populateConversation;
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
      "participants.userId": userId,
      isActive: true,
    })
      .populate("participants.userId", "username email avatar bio presence lastSeenAt")
      .populate("lastMessage.senderId", "username avatar")
      .lean();

    if (!conversation) {
      throw new AppError("Conversation not found or access denied", 404);
    }

    if (conversation.type === "private") {
      const targetParticipant = conversation.participants.find(
        (p) => p.userId._id.toString() !== userId
      );

      if (!targetParticipant) {
        throw new AppError("Target participant not found", 404);
      }

      const targetUserId = targetParticipant.userId._id;

      const relationship = await Relationship.findOne({
        $or: [
          {
            requesterId: userId,
            recipientId: targetUserId,
          },
          {
            requesterId: targetUserId,
            recipientId: userId,
          },
        ],
      }).lean();

      let relationshipStatus = "not_friend";

      if (relationship) {
        if (relationship.status === "accepted") {
          relationshipStatus = "friend";
        }

        if (relationship.status === "pending") {
          if (relationship.requesterId.toString() === userId) {
            relationshipStatus = "pending_sent";
          } else {
            relationshipStatus = "pending_received";
          }
        }

        if (relationship.status === "blocked") {
          if (relationship.blockedBy?.toString() === userId) {
            relationshipStatus = "blocked_by_me";
          } else {
            relationshipStatus = "blocked_by_other";
          }
        }
      }

      return {
        ...conversation,
        relationship: {
          status: relationshipStatus,
        },
      };
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
    const conversation = await Conversation.findOne({
      _id: conversationId,
      "participants.userId": userId,
      isActive: true,
    });

    if (!conversation) throw new AppError("Conversation not found", 404);

    const lastReadAt = conversation.lastMessage?.createdAt || null;
    const participant = conversation.participants.find((p) => p.userId?.equals(userId));

    participant.lastReadAt = lastReadAt;
    participant.unreadCount = 0;

    await conversation.save();

    return null;
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
      "participants.userId": userId,
      isActive: true,
    }).select("participants");

    if (!conversation) {
      throw new AppError("Conversation not found or access denied", 404);
    }

    const participant = conversation.participants.find((p) => p.userId.equals(userId));

    if (!participant) {
      throw new AppError("Participant not found", 404);
    }

    const clearedAt = participant.clearedMessagesHistoryAt;

    const skip = (page - 1) * limit;

    const query = {
      conversationId,
      isDeleted: false,
      $or: [{ type: "image" }, { "file.mimeType": { $regex: /^image\// } }],
    };

    if (clearedAt) {
      query.createdAt = { $gt: clearedAt };
    }

    const images = await Message.find(query)
      .select("file senderId createdAt")
      .populate("senderId", "username avatar")
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
      "participants.userId": userId,
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
      (p) => p.userId.equals(userId) && p.role === "owner"
    );
    if (owner) {
      throw new AppError("Owner cannot leave the group. Please transfer ownership.", 403);
    }

    // Rời khỏi group
    conversation.participants = conversation.participants.filter(
      (p) => !p.userId?.equals(userId)
    );

    await conversation.save();

    return null;
  },

  /**
   * Chuyển nhượng quyền sở hữu group conversation
   * @param {string} conversationId
   * @param {string} userId
   * @param {string} newOwnerId
   */
  transferGroupOwnership: async (conversationId, userId, newOwnerId) => {
    const conversation = await Conversation.findOne({
      _id: conversationId,
      "participants.userId": userId,
      isActive: true,
    });

    if (!conversation) {
      throw new AppError("Group conversation not found", 404);
    }

    const owner = conversation.participants.find(
      (p) => p.userId.equals(userId) && p.role === "owner"
    );

    if (!owner) {
      throw new AppError("Permission denied", 403);
    }

    const newOwner = conversation.participants.find((p) => p.userId.equals(newOwnerId));

    if (!newOwner) {
      throw new AppError("New owner is not a member of the group", 403);
    }

    owner.role = "member";
    newOwner.role = "owner";

    await conversation.save();

    return null;
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
      "participants.userId": userId,
      isActive: true,
    });

    if (!conversation) {
      throw new AppError("Conversation not found or access denied", 404);
    }

    // Đánh dấu là đã xóa
    await Conversation.updateOne(
      { _id: conversationId, "participants.userId": userId },
      {
        $set: {
          "participants.$.deletedAt": new Date(),
          "participants.$.clearedMessagesHistoryAt": new Date(),
          "participants.$.lastReadAt": null,
          "participants.$.lastDeliveredAt": null,
          "participants.$.unreadCount": 0,
        },
      }
    );

    return null;
  },

  togglePinConversation: async (conversationId, userId) => {
    const conversation = await Conversation.findOne({
      _id: conversationId,
      "participants.userId": userId,
      isActive: true,
    });

    if (!conversation) {
      throw new AppError("Conversation not found or access denied", 404);
    }

    const participant = conversation.participants.find((p) => p.userId.equals(userId));
    if (!participant) {
      throw new AppError("Participant not found", 404);
    }

    participant.pinnedAt = participant.pinnedAt ? null : new Date();
    await conversation.save();

    return participant.pinnedAt;
  },

  markAsUnread: async (conversationId, userId) => {
    const conversation = await Conversation.findOne({
      _id: conversationId,
      "participants.userId": userId,
      isActive: true,
    });

    if (!conversation) {
      throw new AppError("Conversation not found or access denied", 404);
    }

    const participant = conversation.participants.find((p) => p.userId.equals(userId));
    if (!participant) {
      throw new AppError("Participant not found", 404);
    }

    participant.unreadCount = Math.max(participant.unreadCount || 0, 1);
    participant.lastReadAt = null;

    await conversation.save();

    return participant.unreadCount;
  },

  clearConversationHistory: async (conversationId, userId) => {
    const conversation = await Conversation.findOne({
      _id: conversationId,
      "participants.userId": userId,
      isActive: true,
    });

    if (!conversation) {
      throw new AppError("Conversation not found or access denied", 404);
    }

    const participant = conversation.participants.find((p) => p.userId.equals(userId));
    if (!participant) {
      throw new AppError("Participant not found", 404);
    }

    participant.clearedMessagesHistoryAt = new Date();
    participant.unreadCount = 0;
    participant.lastReadAt = null;
    participant.lastDeliveredAt = null;
    participant.deletedAt = null;

    await conversation.save();

    return null;
  },

  getReadStatus: async (conversationId, userId) => {
    const conversation = await Conversation.findOne({
      _id: conversationId,
      "participants.userId": userId,
      isActive: true,
    }).select("participants");

    if (!conversation) {
      throw new AppError("Conversation not found", 404);
    }

    const participant = conversation.participants.find((p) => p.userId.equals(userId));

    return {
      conversationId,
      userId,
      lastReadAt: participant?.lastReadAt || null,
      participants: conversation.participants,
    };
  },

  getConversationRealtimeData: async (conversationId) => {
    const conversation = await Conversation.findById(conversationId)
      .populate("participants.userId", "username email avatar bio presence lastSeenAt")
      .populate("lastMessage.senderId", "username avatar")
      .lean();

    if (!conversation) {
      throw new AppError("Conversation not found", 404);
    }

    return conversation;
  },
};

module.exports = ConversationService;
