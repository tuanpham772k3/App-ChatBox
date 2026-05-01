const express = require("express");
const {
  createPrivateConversation,
  getConversations,
  getConversationById,
  createGroupConversation,
  addMemberToGroup,
  removeMemberFromGroup,
  markAsRead,
  getConversationImages,
  leaveGroup,
  transferGroupOwnership,
  deleteConversationForMe,
  togglePinConversation,
  markAsUnread,
  clearConversationHistory,
} = require("./conversation.controller.js");
const { verifyToken } = require("../../middlewares/authMiddleware.js");

const router = express.Router();

// Tạo conversation 1-1 mới
router.post("/private", verifyToken, createPrivateConversation);

// Tạo conversation group
router.post("/group", verifyToken, createGroupConversation);

// Thêm thành viên vào group
router.put("/:conversationId/members", verifyToken, addMemberToGroup);

// Xóa thành viên khỏi group
router.delete("/:conversationId/members/:memberId", verifyToken, removeMemberFromGroup);

// Lấy danh sách hội thoại
router.get("/", verifyToken, getConversations);

// Lấy thông tin chi tiết một hội thoại
router.get("/:conversationId", verifyToken, getConversationById);

// Đánh dấu đã đọc
router.put("/:conversationId/read", verifyToken, markAsRead);

// Đánh dấu chưa đọc
router.put("/:conversationId/unread", verifyToken, markAsUnread);

// Ghim/bỏ ghim hội thoại
router.put("/:conversationId/pin", verifyToken, togglePinConversation);

// Xóa lịch sử trò chuyện
router.put("/:conversationId/clear-history", verifyToken, clearConversationHistory);

// Lấy danh sách ảnh trong hội thoại
router.get("/:conversationId/images", verifyToken, getConversationImages);

// Rời khỏi group
router.delete("/:conversationId/leave", verifyToken, leaveGroup);

// Nhượng quyền owner cho thành viên khác (chỉ dành cho owner)
router.put("/:conversationId/transfer-ownership", verifyToken, transferGroupOwnership);

// Xóa hội thoại của chính tôi
router.delete("/:conversationId/for-me", verifyToken, deleteConversationForMe);

module.exports = router;
