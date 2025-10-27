import express from "express";
import { verifyToken } from "../controllers/middleware.controller.js";
import {
  createNewMessage,
  getConversationMessages,
  markAsRead,
  deleteMessageById,
  editMessageById
} from "../controllers/message.controller.js";

const router = express.Router();

// Tạo tin nhắn mới
router.post("/", verifyToken, createNewMessage);

// Lấy danh sách tin nhắn trong conversation
router.get("/:conversationId", verifyToken, getConversationMessages);

// Đánh dấu tin nhắn đã đọc
router.put("/:messageId/read", verifyToken, markAsRead);

// Xóa tin nhắn
router.delete("/:messageId", verifyToken, deleteMessageById);

// Chỉnh sửa tin nhắn
router.put("/:messageId", verifyToken, editMessageById);

export default router;

