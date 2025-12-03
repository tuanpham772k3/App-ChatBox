import {
  createMessage,
  deleteMessage,
  editMessage,
  getMessages,
  markMessageAsRead,
} from "./message.service.js";
import { getSocket } from "../../socket.js";

/**Tạo tin nhắn mới
 * POST /api/messages
 *
 * Flow:
 * 1. Lấy userId từ JWT token
 * 2. Nhận dữ liệu từ request body
 * 3. Validation cơ bản
 * 4. Gọi service tạo tin nhắn mới
 * 5. Emit message mới tới client
 * 6. Trả về phản hồi cho client
 */
export const createNewMessage = async (req, res) => {
  try {
    //Lấy userId từ JWT token
    const { userId } = req.user;

    //Lấy dữ liệu từ request body
    const { conversationId, content, type = "text", replyTo = null } = req.body;

    // Validation cơ bản
    if (!conversationId || !content) {
      return res.status(400).json({
        success: false,
        message: "Conversation ID and content are required",
        idCode: 1,
      });
    }

    // Kiểm tra conversationId có đúng format ObjectId không
    if (!conversationId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid conversation ID format",
        idCode: 2,
      });
    }

    //Gọi service tạo tin nhắn mới
    const message = await createMessage(
      conversationId,
      userId,
      content,
      type,
      null, // fileInfo
      replyTo
    );

    // Gửi tin nhắn mới đến client socket
    try {
      let io = getSocket();
      io.to(`conversation_${conversationId}`).emit("message:new", message);
    } catch (err) {
      console.error("Socket emit failed for conversation:", conversationId, err);
    }

    // Trả về phản hồi thành công
    return res.status(201).json({
      success: true,
      message: "Message created successfully",
      idCode: 0,
      data: message,
    });
  } catch (error) {
    console.log("Error in createNewMessage:", error);

    // Xử lý các loại lỗi khác nhau
    if (error.message === "Conversation not found or access denied") {
      return res.status(404).json({
        success: false,
        message: "Conversation not found or access denied",
        idCode: 3,
      });
    }

    if (error.message === "Sender not found") {
      return res.status(404).json({
        success: false,
        message: "Sender not found",
        idCode: 4,
      });
    }

    if (
      error.message === "Message content cannot be empty" ||
      error.message === "Message content too long (max 2000 characters)"
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
        idCode: 5,
      });
    }

    if (error.message === "Reply message not found") {
      return res.status(404).json({
        success: false,
        message: "Reply message not found",
        idCode: 6,
      });
    }

    //Lỗi server
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      idCode: 7,
    });
  }
};

/**Lấy danh sách tin nhắn trong conversation
 * GET /api/messages/:conversationId?page=1&limit=50
 *
 * Flow:
 * 1. Lấy conversationId từ params
 * 2. Lấy userId từ JWT token
 * 3. Lấy page và limit từ query parameters
 * 4. Validation cơ bản
 * 5. Gọi service lấy danh sách tin nhắn
 * 6. Trả về response với pagination
 */
export const getConversationMessages = async (req, res) => {
  try {
    //Lấy conversationId từ params
    const { conversationId } = req.params;

    // Lấy userId từ JWT token
    const { userId } = req.user;

    //Lấy pagination parameter từ query
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;

    // Validation conversationId
    if (!conversationId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid conversation ID format",
        idCode: 1,
      });
    }

    // Validation pagination
    if (page < 1 || limit < 1 || limit > 100) {
      return res.status(400).json({
        success: false,
        message: "Invalid pagination parameters",
        idCode: 2,
      });
    }

    // Gọi service lấy danh sách tin nhắn
    const result = await getMessages(conversationId, userId, page, limit);

    // Trả về response thành công
    return res.status(200).json({
      success: true,
      message: "Messages retrieved successfully",
      idCode: 0,
      data: result,
    });
  } catch (error) {
    console.error("Error in getConversationMessages controller:", error);

    // Xử lý lỗi không tìm thấy conversation
    if (error.message === "Conversation not found or access denied") {
      return res.status(404).json({
        success: false,
        message: "Conversation not found or access denied",
        idCode: 3,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      idCode: 4,
    });
  }
};

/**
 * Đánh dấu tin nhắn đã đọc
 * PUT /api/messages/:messageId/read
 *
 * Flow:
 *1. Lấy messageId từ URL params
 *2. Lấy userId từ JWT token
 *3. Validation cơ bản
 *4. Gọi service để đánh dấu tin nhắn đã đọc
 *5. Trả về phản hồi cho client
 */
export const markAsRead = async (req, res) => {
  try {
    // Lấy id của tin nhắn từ URL params
    const { messageId } = req.params;

    // Lấy userId từ JWT token
    const { userId } = req.user;

    // Validation messageId
    if (!messageId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid message ID format",
        idCode: 1,
      });
    }

    // Gọi service để đánh dấu tin nhắn đã đọc
    const result = await markMessageAsRead(messageId, userId);

    //  Trả về phản hồi thành công
    return res.status(200).json({
      success: true,
      message: result.message,
      idCode: 0,
      data: result,
    });
  } catch (error) {
    console.log("Error in markAsRead controller:", error);

    // Xử lý lỗi không tìm thấy tin nhắn
    if (error.message === "Message not found") {
      return res.status(404).json({
        success: false,
        message: "Message not found",
        idCode: 2,
      });
    }

    if (error.message === "Access denied") {
      return res.status(403).json({
        success: false,
        message: "Access denied",
        idCode: 3,
      });
    }

    // Lỗi server
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      idCode: 4,
    });
  }
};

/**
 * Xóa tin nhắn
 * DELETE /api/messages/:messageId
 *
 * Flow:
 * 1. Lấy messageId từ URL params
 * 2. Lấy userId từ JWT token
 * 3. Validation cơ bản
 * 4. Gọi service để xóa tin nhắn
 * 5. Trả về phản hồi cho client
 */
export const deleteMessageById = async (req, res) => {
  try {
    //Lấy messageId từ URL params
    const { messageId } = req.params;

    //Lấy userId từ JWT token
    const { userId } = req.user;

    //Validation messageId
    if (!messageId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid message ID format",
        idCode: 1,
      });
    }

    //Gọi service để xóa tin nhắn
    const result = await deleteMessage(messageId, userId);

    // Emit message mới tới client
    try {
      let io = getSocket();
      io.to(`conversation_${result.conversationId}`).emit(
        "message:delete",
        result.messageId
      );
      console.log(
        `User ${userId} deleted message ${messageId} to conversation ${conversationObjId}`
      );
    } catch (err) {
      console.error("Socket emit failed for conversation:", conversationObjId, err);
    }

    // Trả về phản hồi thành công
    return res.status(200).json({
      success: true,
      message: result.message,
      idCode: 0,
      data: result,
    });
  } catch (error) {
    console.log("Error in deleteMessageById controller:", error);

    // Xử lý lỗi không tìm thấy tin nhắn
    if (error.message === "Message not found") {
      return res.status(404).json({
        success: false,
        message: "Message not found",
        idCode: 2,
      });
    }

    if (error.message === "You can only delete your own messages") {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own messages",
        idCode: 3,
      });
    }

    //Lỗi server
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      idCode: 1,
    });
  }
};

/** * Chỉnh sửa tin nhắn
 * PUT /api/messages/:messageId
 *
 * Flow:
 * 1. Lấy messageId từ URL params
 * 2. Lấy userId từ JWT token
 */
export const editMessageById = async (req, res) => {
  try {
    // Lấy messageId từ URL params
    const { messageId } = req.params;

    // Lấy userId từ JWT token
    const { userId } = req.user;

    //Lấy new content từ request body
    const { content: newContent } = req.body;

    // Validation messageId
    if (!messageId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid message ID format",
        idCode: 1,
      });
    }

    // Validation new content
    if (!newContent) {
      return res.status(400).json({
        success: false,
        message: "Content is required",
        idCode: 2,
      });
    }

    // Gọi service để chỉnh sửa tin nhắn
    const message = await editMessage(messageId, userId, newContent);

    try {
      const io = getSocket();
      io.to(`conversation_${message.conversation}`).emit("message:edit", message);
    } catch (error) {}

    // Trả về response thành công
    return res.status(200).json({
      success: true,
      message: "Message edited successfully",
      idCode: 0,
      data: message,
    });
  } catch (error) {
    console.log("Error in editMessageById controller:", error);

    // Xử lỹ lỗi không tìm thấy tin nhắn
    if (error.message === "Message not found") {
      return res.status(404).json({
        success: false,
        message: "Message not found",
        idCode: 3,
      });
    }

    if (error.message === "You can only edit your own messages") {
      return res.status(403).json({
        success: false,
        message: "You can only edit your own messages",
        idCode: 4,
      });
    }

    if (error.message === "Cannot edit a deleted message") {
      return res.status(400).json({
        success: false,
        message: "Cannot edit a deleted message",
        idCode: 5,
      });
    }

    if (
      error.message === "Message content cannot be empty" ||
      error.message === "Message content too long(max 2000 characters)"
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
        idCode: 6,
      });
    }

    //Lỗi server
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      idCode: 1,
    });
  }
};
