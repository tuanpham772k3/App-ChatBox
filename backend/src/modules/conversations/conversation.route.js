import express from "express";
import {
  createConversation,
  getConversations,
  getConversation,
  deleteConversationById,
  createGroupConversation,
  addMemberToGroup,
  removeMemberFromGroup,
  markConversationAsRead,
} from "./conversation.controller.js";
import { verifyToken } from "../../middlewares/middleware.controller.js";

const router = express.Router();

// Tạo conversation 1-1 mới
router.post("/private", verifyToken, createConversation);

// Tạo conversation group
router.post("/group", verifyToken, createGroupConversation);

// Thêm thành viên vào group
router.put("/:conversationId/members", verifyToken, addMemberToGroup);

// Xóa thành viên khỏi group
router.delete("/:conversationId/members/:memberId", verifyToken, removeMemberFromGroup);

// Lấy danh sách conversation của user hiện tại
router.get("/", verifyToken, getConversations);

// Lấy thông tin chi tiết một conversation
router.get("/:conversationId", verifyToken, getConversation);

// Xóa conversation (soft delete)
router.delete("/:conversationId", verifyToken, deleteConversationById);

// Đánh dấu tin nhắn cuối người dùng đã đọc
router.put("/:conversationId/read", verifyToken, markConversationAsRead);

export default router;
