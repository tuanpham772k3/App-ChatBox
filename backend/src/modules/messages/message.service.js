import User from "../users/user.model.js";
import Message from "./message.model.js";
import Conversation from "../conversations/conversation.model.js";

/**Tạo tin nhắn mới
 * @param {string} conversationId - ID của conversation
 * @param {string} senderId - ID của người gửi
 * @param {string} content - Nội dung tin nhắn
 * @param {string} type - Loại tin nhắn (text, image, file, emoji)
 * @param {object} fileInfo - Thông tin file (nếu có)
 * @param {string} replyTo - ID của tin nhắn được trả lời (nếu có)
 * @returns {object} - Tin nhắn đã được tạo
 */
export const createMessage = async (
  conversationId,
  senderId,
  content,
  type,
  fileInfo = null,
  replyTo = null
) => {
  try {
    //1. Kiểm tra conversationId tồn tại và user có quyền truy cập không
    const conversation = await Conversation.findOne({
      _id: conversationId,
      "participants.user": senderId,
      isActive: true,
    });

    if (!conversation) {
      throw new Error("Conversation not found or access denied");
    }

    // 2. Kiểm tra sender có tồn tại không
    const sender = await User.findById(senderId);
    if (!sender) {
      throw new Error("Sender not found");
    }

    // 3. Validation content
    if (!content || content.trim() === "") {
      throw new Error("Message content cannot be empty");
    }

    if (content.length > 2000) {
      throw new Error("Message content too long(max 2000 characters)");
    }

    // 4. Kiểm tra replyTo message (nếu có)
    if (replyTo) {
      const replyMessage = await Message.findOne({
        _id: replyTo,
        conversation: conversationId,
        isDeleted: false,
      });

      if (!replyMessage) {
        throw new Error("Replied message not found");
      }
    }

    // 5. Tạo message object
    const messageData = {
      conversation: conversationId,
      sender: senderId,
      content: content.trim(),
      type,
      replyTo: replyTo || null,
      status: "sent",
    };

    if (fileInfo && (type === "image" || type === "file")) {
      messageData.file = {
        url: fileInfo.url || null,
        public_id: fileInfo.public_id || null,
        filename: fileInfo.filename || null,
        size: fileInfo.size || null,
      };
    }

    const newMessage = new Message(messageData);
    const savedMessage = await newMessage.save();

    // 6. Cập nhật conversation.lastMessage và tăng unreadCount cho participants khác
    const lastMessagePreview = {
      _id: savedMessage._id,
      sender: senderId,
      type,
      content: type === "text" ? content.trim() : fileInfo?.filename || type,
      file: fileInfo
        ? {
            url: fileInfo.url || null,
            filename: fileInfo.filename || null,
            size: fileInfo.size || null,
          }
        : null,
      isDeleted: false,
      createdAt: savedMessage.createdAt,
    };

    // Update lastMessage and increment unreadCount for other participants
    await Conversation.updateOne(
      { _id: conversationId },
      {
        $set: { lastMessage: lastMessagePreview, updatedAt: new Date() },
        $inc: {
          // increment unreadCount only for participants != sender
          // Mongo can't conditional-inc per array element with simple operator,
          // so we use positional filtered array update (Mongo 3.6+). Simpler: pull/push map:
        },
      }
    );

    // Because conditional $inc for array elements is complex in one update
    const conv = await Conversation.findById(conversationId);
    conv.participants = conv.participants.map((p) => {
      if (p.user.toString() !== senderId.toString()) {
        p.unreadCount = (p.unreadCount || 0) + 1;
      }
      return p;
    });
    conv.lastMessage = lastMessagePreview;
    await conv.save();

    // 7. Populate thông tin sender và replyTo để trả về đầy đủ
    const populatedMessage = await Message.findById(savedMessage._id)
      .populate("sender", "username email avatarUrl")
      .populate("replyTo", "content sender createdAt")
      .populate("replyTo.sender", "username avatarUrl")
      .lean();

    return populatedMessage;
  } catch (error) {
    console.log("Error in createMessage service:", error);
    throw error;
  }
};

/**
 *Lấy danh sách tin nhắn trong một conversation với pagination
 * @param {string} conversationId - ID của conversation
 * @param {string} userId - ID của user (để kiểm tra quyền truy cập)
 * @param {number} page - Trang hiện tại (mặc định 1)
 * @param {number} limit - Số tin nhắn trên mỗi trang (mặc định 20)
 * @returns {object} - Danh sách tin nhắn với pagination
 */
export const getMessages = async (conversationId, userId, page = 1, limit = 20) => {
  try {
    // 1. Kiểm tra user có quyền truy cập conversation không
    const conversation = await Conversation.findOne({
      _id: conversationId,
      "participants.user": userId,
      isActive: true,
    });

    if (!conversation) {
      throw new Error("Conversation not found or access denied");
    }

    // 2. Tính toán pagination
    const skip = (page - 1) * limit;

    // 3. Lấy danh sách tin nhắn (không bao gồm tin nhắn đã xóa)
    const messages = await Message.find({
      conversation: conversationId,
      isDeleted: false,
    })
      .populate("sender", "username email avatarUrl")
      .populate("replyTo", "content sender createdAt")
      .populate("replyTo.sender", "username avatarUrl")
      .populate("forwardedFrom", "username avatarUrl")
      .sort({ createdAt: -1 }) // Sắp xếp từ mới nhất đến cũ nhất
      .skip(skip)
      .limit(limit)
      .lean();

    // 4. Đếm tổng số tin nhắn
    const total = await Message.countDocuments({
      conversation: conversationId,
      isDeleted: false,
    });

    // 5. Đảo ngược thứ tự để hiển thị từ cũ đến mới
    messages.reverse();

    return {
      messages,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
      },
    };
  } catch (error) {
    console.error("Error in getMessages service:", error);
    throw error;
  }
};

/**
 * Đánh dấu tin nhắn đã đọc
 * @param {string} messageId - ID của tin nhắn
 * @param {string} userId - ID của user
 * @returns {object} - Kết quả đánh dấu đã đọc
 * */
export const markMessageAsRead = async (messageId, userId) => {
  try {
    //1. Tìm tin nhắn
    const message = await Message.findById(messageId);
    if (!message) {
      throw new Error("Message not found");
    }

    // 2. Kiểm tra user có quyền truy cập conversation không
    const conversation = await Conversation.findOne({
      _id: message.conversation,
      "participants.user": userId,
      isActive: true,
    });

    if (!conversation) {
      throw new Error("Access denied");
    }

    // 3. Kiểm tra user đã đọc tin nhắn này chưa
    const alreadyRead = message.readBy.some((read) => read.user.toString() === userId);

    if (alreadyRead) {
      return {
        success: true,
        message: "Message already marked as read",
        readBy: message.readBy,
      };
    }

    // 4. Thêm user vào danh sách đã đọc
    message.readBy.push({ user: userId, readAt: new Date() });

    // 5. Cập nhật status nếu cần
    if (message.status === "sent") {
      message.status = "delivered";
    }

    // 6. Lưu thay đổi
    await message.save();

    // 7. Populate thông tin readBy để trả về đầy đủ
    const updatedMessage = await Message.findById(messageId)
      .populate("readBy.user", "username avatarUrl")
      .lean();

    return {
      success: true,
      message: "Message marked as read",
      readBy: updatedMessage.readBy,
    };
  } catch (error) {
    console.log("Error in markMessageAsRead service:", error);
    throw error;
  }
};

/**
 *Xóa tin nhắn
 * @param {string} messageId - ID của tin nhắn
 * @param {string} userId - ID của user
 * @returns {object} - Kết quả xóa tin nhắn
 */
export const deleteMessage = async (messageId, userId) => {
  try {
    //1. Tìm tin nhắn
    const message = await Message.findById(messageId);
    if (!message) {
      throw new Error("Message not found");
    }

    //2. Kiểm tra user có quyền xóa tin nhắn không (chỉ người gửi mới được xóa)
    if (message.sender.toString() !== userId) {
      throw new Error("You can only delete your own messages");
    }

    //3. Kiểm tra tin nhắn đã bị xóa chưa
    if (message.isDeleted) {
      return {
        success: true,
        message: "Message already deleted",
      };
    }

    //4. Soft delete tin nhắn (đánh dấu isDeleted = true)
    await Message.findByIdAndUpdate(messageId, {
      isDeleted: true,
      content: "This message has been deleted.",
      file: {
        url: null,
        public_id: null,
        filename: null,
        size: null,
      },
    });

    // 5. Nếu message này là lastMessage của conversation -> cập nhật lại lastMessage
    const conversation = await Conversation.findById(message.conversation);
    if (!conversation) {
      // tạm thời trả về (shouldn't happen)
      return {
        success: true,
        message: "Message deleted successfully",
        messageId,
        conversationId: message.conversation,
      };
    }

    const lastMsgId = conversation.lastMessage?._id?.toString?.();
    if (lastMsgId && lastMsgId === messageId.toString()) {
      // tìm message mới nhất (không bị xóa)
      const prev = await Message.findOne({
        conversation: message.conversation,
        isDeleted: false,
      })
        .sort({ createdAt: -1 })
        .lean();

      if (prev) {
        conversation.lastMessage = {
          _id: prev._id,
          sender: prev.sender,
          type: prev.type,
          content: prev.type === "text" ? prev.content : prev.file?.filename || prev.type,
          file: prev.file || null,
          isDeleted: false,
          createdAt: prev.createdAt,
        };
      } else {
        // không còn message nào -> reset lastMessage
        conversation.lastMessage = {
          _id: null,
          sender: null,
          type: null,
          content: null,
          file: null,
          isDeleted: false,
          createdAt: null,
        };
      }
      await conversation.save();
    }

    //Trả về kết quả
    return {
      success: true,
      message: "Message deleted successfully",
      messageId,
      conversationId: message.conversation,
    };
  } catch (error) {
    console.log("Error in deleteMessage service:", error);
    throw error;
  }
};

/**
 * Chỉnh sửa tin nhắn
 * @param {string} messageId - ID của tin nhắn
 * @param {string} userId - ID của user
 * @param {string} newContent - Nội dung mới của tin nhắn
 * @returns {object} - Tin nhắn đã được chỉnh sửa
 */
export const editMessage = async (messageId, userId, newContent) => {
  try {
    // 1. Tìm tin nhắn
    const message = await Message.findById(messageId);
    if (!message) {
      throw new Error("Message not found");
    }

    // 2. Kiểm tra user có quyền chỉnh sửa tin nhắn không (chỉ người gửi mới được chỉnh sửa)
    if (message.sender.toString() !== userId) {
      throw new Error("You can only edit your own messages");
    }

    // 3. Kiểm tra tin nhắn đã bị xóa chưa
    if (message.isDeleted) {
      throw new Error("Cannot edit a deleted message");
    }

    // 4. Validation nội dung mới
    if (!newContent || newContent.trim().length === 0) {
      throw new Error("Message content cannot be empty");
    }

    if (newContent.length > 2000) {
      throw new Error("Message content too long(max 2000 characters)");
    }

    // 5. Cập nhật tin nhắn
    const updatedMessage = await Message.findByIdAndUpdate(
      messageId,
      {
        content: newContent.trim(),
        isEdited: true,
        editedAt: new Date(),
      },
      { new: true }
    )
      .populate("sender", "username email avatarUrl")
      .populate("replyTo", "content sender createdAt")
      .populate("replyTo.sender", "username avatarUrl")
      .lean();

    return updatedMessage;
  } catch (error) {
    console.log("Error in editMessage service:", error);
    throw error;
  }
};
