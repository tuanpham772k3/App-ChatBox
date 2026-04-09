const express = require("express");
const { verifyToken } = require("../../middlewares/authMiddleware.js");
const {
  createNewMessage,
  getConversationMessages,
  deleteMessageById,
  editMessageById,
} = require("./message.controller.js");

const router = express.Router();

// Tạo tin nhắn mới
router.post("/", verifyToken, createNewMessage);

// Lấy danh sách tin nhắn trong conversation
router.get("/:conversationId", verifyToken, getConversationMessages);

// Xóa tin nhắn (soft delete)
router.delete("/:messageId", verifyToken, deleteMessageById);

// Chỉnh sửa tin nhắn
router.put("/:messageId", verifyToken, editMessageById);

module.exports = router;
