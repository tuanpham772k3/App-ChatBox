import Conversation from "./conversation.model.js";
import User from "../users/user.model.js";
import Message from "../messages/message.model.js";
import { getSocket } from "../../socket.js";

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
 * @param {string[]} memberIds - Danh sách ID của người tham gia (không bắt buộc chứa creator, sẽ tự thêm)
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
    //    - Loại bỏ trùng lặp
    //    - Đảm bảo creator cũng là 1 participant
    const memberSet = new Set(memberIds.map((id) => id));
    memberSet.add(creatorId);
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
      role: userId === creatorId ? "owner" : "member", // Creator là owner, còn lại là member
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

    // 1. Tìm tất cả conversation mà user tham gia
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

    // 2. Total conversation
    const total = await Conversation.countDocuments({
      "participants.user": userId,
      isActive: true,
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

    // Kiểm tra tất cả user tồn tại trong database
    const users = await User.find({ _id: { $in: memberIds } });

    if (users.length !== memberIds.length) {
      throw new Error("One or more users not found");
    }

    // Lấy tất cả ID thành viên đã có trong group && check trùng lặp
    const existingMemberIds = conversation.participants.map((p) => p.user.toString());
    const duplicateIds = memberIds.filter((memberId) =>
      existingMemberIds.includes(memberId)
    );

    if (duplicateIds.length > 0) {
      throw new Error("Some users already exist in group");
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

    // Trả về thông tin conversation đã được populate đầy đủ và cập nhật mới nhất
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
    const isAdmin = conversation.participants.some(
      (p) => p.user.toString() === currentUserId && ["owner", "admin"].includes(p.role)
    );

    if (!isAdmin) {
      throw new Error("Just owner and admin can remove members");
    }

    // Không được xóa chính mình
    if (currentUserId === memberId) {
      throw new Error("Cannot remove themselves");
    }

    // Xóa trực tiếp thành viên (=$pull) và trả về conversation đã được populate đầy đủ
    const updatedConversation = await Conversation.findByIdAndUpdate(
      conversationId,
      {
        $pull: { participants: { user: memberId } },
      },
      { new: true }
    )
      .populate("participants.user", "username email avatarUrl bio status lastSeenAt")
      .populate("lastMessage.sender", "username avatarUrl")
      .lean();

    return updatedConversation;
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

    // Chỉ owner mới được xóa conversation
    const isOwner = conversation.participants.some(
      (p) => p.user.toString() === userId && p.role === "owner"
    );

    if (!isOwner) {
      throw new Error("Only the owner can delete this conversation");
    }

    // Soft delete: chỉ đánh dấu isActive = false
    await Conversation.findByIdAndUpdate(conversationId, {
      isActive: false,
    });

    return true;
  } catch (error) {
    console.error("Error in deleteConversation service:", error);
    throw error;
  }
};

/**
 * Đánh dấu đã đọc
 * @param {string} conversationId - ID của conversation
 * @param {string} userId - ID của user đang đăng nhập
 * @returns {Object} - Kết quả xóa
 */
export const markConversationAsReadService = async (conversationId, userId) => {
  try {
    // 1. Find and validate conversation
    const conv = await Conversation.findOne({
      _id: conversationId,
      "participants.user": userId,
      isActive: true,
    });

    if (!conv) throw new Error("Conversation not found");

    // 2. Cập nhật participant: thiết lập lastReadAt, lastReadMessage, unreadCount = 0
    const lastReadMessage = conv.lastMessage?._id || null;
    const participant = conv.participants.find((p) => p.user.toString() === userId);
    participant.lastReadAt = new Date();
    participant.lastReadMessage = lastReadMessage;
    participant.unreadCount = 0;

    await conv.save();

    // 4. Emit socket
    try {
      let io = getSocket();
      io.to(`conversation_${conversationId}`).emit("conversation:read", {
        conversationId,
        userId,
        lastReadMessage,
      });
    } catch (err) {
      console.error(
        "Socket emit conversation:read failed for conversation:",
        conversationId,
        err
      );
    }

    return true;
  } catch (error) {
    console.error("Error in markConversationAsReadService:", error);
    throw error;
  }
};

/**
 * Lấy danh sách ảnh trong conversation
 * @param {string} conversationId - ID của conversation
 * @param {string} userId - ID của user đang đăng nhập
 * @param {number} page - Trang hiện tại
 * @param {string} limit - giới số lượng hạn số image
 * @returns {Object} - Kết quả xóa
 */
export const getConversationImagesService = async (
  conversationId,
  userId,
  page = 1,
  limit = 8
) => {
  // 1. Check quyền truy cập conversation
  const conversation = await Conversation.findOne({
    _id: conversationId,
    "participants.user": userId,
    isActive: true,
  }).select("_id");

  if (!conversation) {
    throw new Error("Conversation not found or access denied");
  }

  // 2. Query ảnh
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
};

/**
 * Rời khỏi group conversation
 * @param {string} conversationId - ID của conversation
 * @param {string} userId - ID của user đang đăng nhập
 * @returns {Object} - Kết quả rời khỏi group
 */
export const leaveGroupService = async (conversationId, userId) => {
  try {
    // Tìm conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      "participants.user": userId,
      isActive: true,
    });

    if (!conversation) {
      throw new Error("Group conversation not found");
    }

    if (conversation.type !== "group") {
      return res.status(400).json({ message: "Not a group conversation" });
    }

    // Owner chưa chuyển quyền thì không được rời khỏi group
    const owner = conversation.participants.some(
      (p) => p.role === "owner" && p.user.toString() === userId
    );

    if (owner) {
      throw new Error("Owner cannot leave the group. Please transfer ownership.");
    }

    // Rời khỏi group
    conversation.participants = conversation.participants.filter(
      (p) => p.user.toString() !== userId
    );

    await conversation.save();

    return conversation;
  } catch (error) {
    console.error("Error in leaveGroupService:", error);
    throw error;
  }
};

/**
 * Chuyển nhượng quyền sở hữu group conversation
 * @param {string} conversationId
 * @param {string} currentUserId
 * @param {string} newOwnerId
 */
export const transferGroupOwnershipService = async (
  conversationId,
  currentUserId,
  newOwnerId
) => {
  try {
    // 1. Tìm conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      "participants.user": currentUserId,
      isActive: true,
    });

    if (!conversation) {
      throw new Error("Group conversation not found");
    }

    // 2. Kiểm tra quyền sở hữu
    const owner = conversation.participants.find(
      (p) => p.user.toString() === currentUserId && p.role === "owner"
    );

    if (!owner) {
      throw new Error("Permission denied");
    }

    // 3. Kiểm tra newOwnerId có phải là thành viên không
    const newOwner = conversation.participants.find(
      (p) => p.user.toString() === newOwnerId
    );

    if (!newOwner) {
      throw new Error("New owner is not a member of the group");
    }

    // 4. Chuyển nhượng quyền sở hữu
    owner.role = "member";
    newOwner.role = "owner";

    await conversation.save();

    return conversation;
  } catch (error) {
    console.error("Error in transferGroupOwnershipService:", error);
    throw error;
  }
};
