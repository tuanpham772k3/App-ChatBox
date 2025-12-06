import express from "express";
import { verifyToken } from "../../middlewares/middleware.controller.js";
import {
  createNewMessage,
  getConversationMessages,
  markAsRead,
  deleteMessageById,
  editMessageById,
} from "./message.controller.js";

const router = express.Router();

// Tạo tin nhắn mới
router.post("/", verifyToken, createNewMessage);

// Lấy danh sách tin nhắn trong conversation
router.get("/:conversationId", verifyToken, getConversationMessages);

// Xóa tin nhắn (soft delete)
router.delete("/:messageId", verifyToken, deleteMessageById);

// Chỉnh sửa tin nhắn
router.put("/:messageId", verifyToken, editMessageById);

export default router;
