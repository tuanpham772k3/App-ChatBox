import {
  createMessage,
  deleteMessage,
  editMessage,
  getMessages,
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
 * 5. Trả về phản hồi cho client
 */
export const createNewMessage = async (req, res) => {
  try {
    //Lấy userId từ JWT token
    const { userId } = req.user;

    //Lấy dữ liệu từ request body
    const { tempId, conversationId, content, file } = req.body;

    // Validation cơ bản
    if (!conversationId) {
      return res.status(400).json({
        success: false,
        message: "conversationId is required",
      });
    }

    //Gọi service tạo tin nhắn mới
    const newMessage = await createMessage(conversationId, userId, content, file);

    // Trả về phản hồi thành công
    return res.status(201).json({
      success: true,
      message: "Message created successfully",
      idCode: 0,
      data: { newMessage, tempId },
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
    const { messages, pagination } = await getMessages(
      conversationId,
      userId,
      page,
      limit
    );

    // Trả về response thành công
    return res.status(200).json({
      success: true,
      message: "Messages retrieved successfully",
      idCode: 0,
      data: { messages, pagination },
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
    const { messageId } = req.params;
    const { userId } = req.user;

    if (!messageId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid message ID format",
        idCode: 1,
      });
    }

    const message = await deleteMessage(messageId, userId);

    // Emit message mới tới client
    try {
      let io = getSocket();
      io.to(`conversation_${message.conversation}`).emit("message:delete", messageId);
      console.log(
        `User ${userId} deleted message ${messageId} to conversation ${message.conversation}`
      );
    } catch (err) {
      console.error("Socket emit failed for conversation:", message.conversation, err);
    }

    return res.status(200).json({
      success: true,
      message: "Message deleted successfully",
      idCode: 0,
      data: message,
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
    const { messageId } = req.params;
    const { userId } = req.user;

    const { content: newContent } = req.body;

    if (!messageId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid message ID format",
        idCode: 1,
      });
    }

    if (!newContent) {
      return res.status(400).json({
        success: false,
        message: "Content is required",
        idCode: 2,
      });
    }

    const message = await editMessage(messageId, userId, newContent);

    try {
      const io = getSocket();
      io.to(`conversation_${message.conversation}`).emit("message:edit", message);
      console.log("emit edit thành công", message);
    } catch (error) {
      console.log("Lỗi emit message:edit trong editMessageById:", error);
    }

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
