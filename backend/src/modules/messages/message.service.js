import User from "../users/user.model.js";
import Message from "./message.model.js";
import Conversation from "../conversations/conversation.model.js";
import { getSocket } from "../../socket.js";

/**Tạo tin nhắn mới
 * @param {string} conversationId - ID của conversation
 * @param {string} senderId - ID của người gửi
 * @param {string} content - Nội dung tin nhắn
 * @param {string} type - Loại tin nhắn (text, image, file, emoji)
 * @param {object} fileInfo - Thông tin file (nếu có)
 * @param {string} replyTo - ID của tin nhắn được trả lời (nếu có)
 * @returns {object} - Tin nhắn đã được tạo
 */
export const createMessage = async (conversationId, senderId, content, fileInfo) => {
  try {
    // Kiểm tra conversation tồn tại và user có quyền truy cập không
    const conversation = await Conversation.findOne({
      _id: conversationId,
      "participants.user": senderId,
      isActive: true,
    }).lean();

    if (!conversation) {
      throw new Error("Conversation not found or access denied");
    }

    // Xác định message type (BACKEND QUYẾT)
    let type = "text";

    if (fileInfo) {
      type = fileInfo.mimeType.startsWith("image/") ? "image" : "file";
    }

    // Validate payload theo type
    if (type === "text") {
      if (!content || !content.trim()) {
        throw new Error("Message content cannot be empty");
      }
      if (content.length > 2000) {
        throw new Error("Message content too long (max 2000 characters)");
      }
    }

    if ((type === "image" || type === "file") && !fileInfo?.url) {
      throw new Error("File info is required for file/image message");
    }

    // Tạo message object & thêm file nếu có
    const messageData = {
      conversation: conversationId,
      sender: senderId,
      type,
      content: content ? content.trim() : null,
      file: fileInfo
        ? {
            url: fileInfo.url,
            public_id: fileInfo.public_id,
            filename: fileInfo.filename,
            mimeType: fileInfo.mimeType,
            size: fileInfo.size,
          }
        : null,
    };

    const savedMessage = await Message.create(messageData);

    // Populate thông tin đầy đủ của message
    const populatedMessage = await Message.findById(savedMessage._id)
      .populate("sender", "username email avatarUrl")
      .lean();

    // Cập nhật conversation.lastMessage và tăng unreadCount cho participants khác
    const updatedConv = await Conversation.findOneAndUpdate(
      { _id: conversationId },
      {
        $set: {
          lastMessage: {
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
          },
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

    // Emit tin nhắn mới đến conversation socket
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
      // Emit unreadCount realtime cho từng user (TRỪ người gửi)
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

    //2. Check quyền
    if (message.sender.toString() !== userId) {
      throw new Error("You can only delete your own messages");
    }

    // 3. Nếu đã xóa thì thôi
    if (message.isDeleted) {
      return message;
    }

    //4. Soft delete
    message.isDeleted = true;
    message.content = "This message has been deleted.";
    message.file = null;
    await message.save();

    // 5. Nếu là lastMessage thì update lại
    const conversation = await Conversation.findById(message.conversation);

    const isLastMessage = conversation?.lastMessage?._id.toString() === messageId;

    if (isLastMessage) {
      const prevMessage = await Message.findOne({
        conversation: message.conversation,
        isDeleted: false,
      })
        .sort({ createdAt: -1 })
        .lean();

      if (prevMessage) {
        conversation.lastMessage = {
          _id: prevMessage._id,
          sender: prevMessage.sender,
          type: prevMessage.type,
          content: prevMessage.type === "text" ? prevMessage.content : "File",
          file: prevMessage.file || null,
          isDeleted: false,
          createdAt: prevMessage.createdAt,
        };
      } else {
        conversation.lastMessage = null;
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
    const message = await Message.findById(messageId)
      .populate("sender", "username email avatarUrl")
      .populate("replyTo", "content sender createdAt")
      .populate("replyTo.sender", "username avatarUrl");

    if (!message) {
      throw new Error("Message not found");
    }

    // 2. Check quyền
    if (message.sender._id.toString() !== userId) {
      throw new Error("You can only edit your own messages");
    }

    // 3. Check tin nhắn đã bị xóa
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
    message.content = newContent.trim();
    message.isEdited = true;
    message.editedAt = new Date();
    await message.save();

    // 6. Nếu là lastMessage thì cập nhật preview
    const conversation = await Conversation.findOne(message.conversation);
    if (conversation.lastMessage._id.toString() === messageId) {
      conversation.lastMessage.content = message.content;
      await conversation.save();
    }

    return message;
  } catch (error) {
    console.log("Error in editMessage service:", error);
    throw error;
  }
};
