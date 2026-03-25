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
  getConversationImages,
  leaveGroup,
  transferGroupOwnership,
  deleteConversationForMe,
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

// Xóa conversation (chỉ dành cho owner)
router.delete("/:conversationId", verifyToken, deleteConversationById);

// Đánh dấu tin nhắn cuối người dùng đã đọc
router.put("/:conversationId/read", verifyToken, markConversationAsRead);

// Lấy danh sách ảnh trong hội thoại
router.get("/:conversationId/images", verifyToken, getConversationImages);

// Rời khỏi group conversation
router.delete("/:conversationId/leave", verifyToken, leaveGroup);

// Nhượng quyền owner cho thành viên khác (chỉ dành cho owner)
router.put("/:conversationId/transfer-ownership", verifyToken, transferGroupOwnership);

// Xóa hội thoại của chính tôi
router.delete("/:conversationId/for-me", verifyToken, deleteConversationForMe);

export default router;
