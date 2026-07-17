const Conversation = require("./conversation.model.js");
const User = require("../users/user.model.js");
const Message = require("../messages/message.model.js");
const Relationship = require("../relationship/relationship.model.js");
const { AppError } = require("../../utils/AppError.js");
const { formatConversations } = require("./conversation.utils.js");

const ConversationService = {
  createPrivateConversation: async (creatorId, participantId) => {
    const usersCount = await User.countDocuments({
      _id: { $in: [creatorId, participantId] },
    });
    if (usersCount < 2) {
      throw new AppError("Creator or Participant not found", 404);
    }

    // check relationship
    const relationship = await Relationship.findOne({
      status: "accepted",
      $or: [
        {
          requesterId: creatorId,
          recipientId: participantId,
        },
        {
          recipientId: creatorId,
          requesterId: participantId,
        },
      ],
    }).lean();

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
          select: "displayName email avatar bio presence lastSeenAt",
        },
        {
          path: "lastMessage.senderId",
          select: "displayName avatar",
        },
      ]);

      return {
        ...populatedConversation.toObject(),
        conversationCategory: relationship ? "friend" : "stranger",
      };
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
        select: "displayName email avatar bio presence lastSeenAt",
      },
      {
        path: "lastMessage.senderId",
        select: "displayName avatar",
      },
    ]);

    return {
      ...populatedConversation.toObject(),
      conversationCategory: relationship ? "friend" : "stranger",
    };
  },

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
        select: "displayName email avatar bio presence lastSeenAt",
      },
      { path: "lastMessage.senderId", select: "displayName avatar" },
    ]);

    return {
      ...populatedConversation.toObject(),
      conversationCategory: "group",
    };
  },

  getConversations: async (userId, page = 1, limit = 20) => {
    const skip = (page - 1) * limit;

    const query = {
      isActive: true,
      participants: {
        $elemMatch: {
          userId: userId,
          deletedAt: null,
        },
      },
    };

    const [conversations, total] = await Promise.all([
      Conversation.find(query)
        .populate(
          "participants.userId",
          "displayName email avatar bio presence lastSeenAt"
        )
        .populate("lastMessage.senderId", "displayName avatar")
        .sort({
          "lastMessage.createdAt": -1,
          updatedAt: -1,
        })
        .skip(skip)
        .limit(limit)
        .lean(),

      Conversation.countDocuments(query),
    ]);

    const formattedConversations = await formatConversations(conversations, userId);

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

    // lấy danh sách thành viên trong hội thoại để thực thi realtime
    const participants = conversation.participants.map((p) => ({ userId: p.userId }));

    // Lấy danh sách id của thành viên trong hội thoại
    const existingMemberIds = conversation.participants.map((p) => p.userId.toString());

    // Danh sách người dùng mới hoặc đã trùng lặp
    const newMemberIds = memberIds.filter((id) => !existingMemberIds.includes(id));
    const duplicates = memberIds.filter((id) => existingMemberIds.includes(id));

    if (duplicates.length > 0) {
      throw new AppError("All users already in group", 400);
    }

    // format
    const newMembers = newMemberIds.map((id) => ({ userId: id, role: "member" }));

    conversation.participants.push(...newMembers);

    await conversation.save();

    await conversation.populate([
      {
        path: "participants.userId",
        select: "displayName email avatar bio status lastSeenAt",
      },
      {
        path: "lastMessage.senderId",
        select: "displayName avatar",
      },
    ]);

    return {
      conversation: { ...conversation.toObject(), conversationCategory: "group" },
      realtimeData: {
        newMembers,
        participants,
      },
    };
  },

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
          select: "displayName email avatar bio presence lastSeenAt",
        },
        {
          path: "lastMessage.senderId",
          select: "displayName avatar",
        },
      ])
      .lean();

    return {
      ...populateConversation,
      conversationCategory: "group",
    };
  },

  getConversationById: async (conversationId, userId) => {
    const conversation = await Conversation.findOne({
      _id: conversationId,
      "participants.userId": userId,
      isActive: true,
    })
      .populate("participants.userId", "displayName email avatar bio presence lastSeenAt")
      .populate("lastMessage.senderId", "displayName avatar")
      .lean();

    if (!conversation) {
      throw new AppError("Conversation not found or access denied", 404);
    }

    // Format conversation để thêm relationship nếu là private
    if (conversation.type === "private") {
      const partner = conversation.participants.find(
        (p) => p.userId._id.toString() !== userId
      );

      const partnerId = partner.userId._id;

      const relationship = await Relationship.findOne({
        $or: [
          {
            requesterId: userId,
            recipientId: partnerId,
          },
          {
            requesterId: partnerId,
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

        return {
          ...conversation,
          relationship: {
            _id: relationship._id,
            status: relationshipStatus,
          },
        };
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

    return {
      realtimeData: {
        participants: conversation.participants,
        lastReadAt,
      },
    };
  },

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
      .populate("senderId", "displayName avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return images;
  },

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

    return conversation;
  },

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
};

module.exports = ConversationService;
