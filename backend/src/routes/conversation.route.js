import express from "express";
import { verifyToken } from "../controllers/middleware.controller.js";
import {
  createConversation,
  getConversations,
  getConversation,
  deleteConversationById,
} from "../controllers/conversation.controller.js";

const router = express.Router();

// Tạo conversation 1-1 mới
router.post("/", verifyToken, createConversation);

// Lấy danh sách conversation của user hiện tại
router.get("/", verifyToken, getConversations);

// Lấy thông tin chi tiết một conversation
router.get("/:conversationId", verifyToken, getConversation);

// Xóa conversation (soft delete)
router.delete("/:conversationId", verifyToken, deleteConversationById);

export default router;

