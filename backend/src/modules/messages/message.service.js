import User from "../users/user.model.js";
import Message from "./message.model.js";
import Conversation from "../conversations/conversation.model.js";
import { getSocket } from "../../socket.js";
import { validateMessagePayload } from "./message.validation.js";

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
  fileInfo,
  replyTo
) => {
  try {
    //1. Kiểm tra conversation tồn tại và user có quyền truy cập không
    const conversation = await Conversation.findOne({
      _id: conversationId,
      "participants.user": senderId,
      isActive: true,
    }).lean();

    if (!conversation) {
      throw new Error("Conversation not found or access denied");
    }

    // 2. Validate payload theo type
    validateMessagePayload({ type, content, fileInfo });

    // 3. Kiểm tra replyTo message (nếu có)
    if (replyTo) {
      const replyMessage = await Message.findOne({
        _id: replyTo,
        conversation: conversationId,
        isDeleted: false,
      }).lean();

      if (!replyMessage) {
        throw new Error("Replied message not found");
      }
    }

    // 4. Tạo message object & thêm file nếu có
    const messageData = {
      conversation: conversationId,
      sender: senderId,
      content: type === "text" ? content.trim() : null,
      type,
      replyTo,
    };

    if (fileInfo) {
      messageData.file = {
        url: fileInfo.url,
        public_id: fileInfo.public_id,
        filename: fileInfo.filename,
        mimeType: fileInfo.mimeType,
        size: fileInfo.size,
      };
    }

    const savedMessage = await Message.create(messageData);

    // 5. Populate thông tin đầy đủ của message
    const populatedMessage = await Message.findById(savedMessage._id)
      .populate("sender", "username email avatarUrl")
      .populate("replyTo", "content sender createdAt")
      .populate("replyTo.sender", "username avatarUrl")
      .lean();

    // 6. Cập nhật conversation.lastMessage và tăng unreadCount cho participants khác
    const lastMessagePreview = {
      _id: savedMessage._id,
      sender: senderId,
      type,
      content: type === "text" ? content.trim() : fileInfo?.filename || type,
      file: fileInfo
        ? {
            url: fileInfo.url,
            filename: fileInfo.filename,
            size: fileInfo.size,
          }
        : null,
      isDeleted: false,
      createdAt: savedMessage.createdAt,
    };

    const updatedConv = await Conversation.findOneAndUpdate(
      { _id: conversationId },
      {
        $set: {
          lastMessage: lastMessagePreview,
          updatedAt: new Date(),
        },
        $inc: {
          "participants.$[p].unreadCount": 1,
        },
      },
      {
        arrayFilters: [{ "p.user": { $ne: senderId } }],
        new: true,
        lean: true,
      }
    );

    // 7. Emit tin nhắn mới đến conversation socket
    let io = getSocket();
    try {
      io.to(`conversation_${conversationId}`).emit("message:new", populatedMessage);
    } catch (err) {
      console.error(
        "Socket emit message:new failed for conversation:",
        conversationId,
        err
      );
    }

    try {
      //8. Emit unreadCount realtime cho từng user (TRỪ người gửi)
      updatedConv.participants.forEach((p) => {
        if (p.user?.toString() !== senderId) {
          io.to(`user_${p.user}`).emit("conversation:update", {
            conversationId,
            lastMessage: {
              _id: populatedMessage._id,
              sender: {
                _id: populatedMessage.sender._id,
                username: populatedMessage.sender.username,
                avatarUrl: populatedMessage.sender.avatarUrl,
              },
              type: populatedMessage.type,
              content:
                populatedMessage.type === "text"
                  ? populatedMessage.content
                  : populatedMessage.file?.filename || populatedMessage.type,
              file: populatedMessage.file || null,
              createdAt: populatedMessage.createdAt,
            },
            unreadCount: p.unreadCount,
            userId: p.user?.toString(),
          });
          // Log emit
          console.log("[SOCKET][EMIT] conversation:update", p.unreadCount);
        }
      });
    } catch (err) {
      console.error(
        "Socket emit conversation:unread:update failed for conversation:",
        conversationId,
        err
      );
    }

    // Result
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
    return message;
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
