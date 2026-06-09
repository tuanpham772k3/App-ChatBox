const express = require("express");
const { verifyToken } = require("../../middlewares/authMiddleware.js");
const {
  createFriendRequest,
  cancelFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  unfriend,
  blockUser,
  unblockUser,
  getSentRequests,
  getReceivedRequests,
  getFriends,
} = require("./relationship.controller.js");

const router = express.Router();

// Tạo yêu cầu kết bạn
router.post("/request", verifyToken, createFriendRequest);

// Hủy yêu cầu kết bạn
router.delete("/:relationshipId/cancel", verifyToken, cancelFriendRequest);

// Chấp nhận yêu cầu kết bạn
router.patch("/:relationshipId/accept", verifyToken, acceptFriendRequest);

// Từ chối yêu cầu kết bạn
router.delete("/:relationshipId/reject", verifyToken, rejectFriendRequest);

// Hủy kết bạn
router.delete("/:relationshipId/unfriend", verifyToken, unfriend);

// Chặn người dùng
router.patch("/:relationshipId/block", verifyToken, blockUser);

// Bỏ chặn
router.delete("/:relationshipId/unblock", verifyToken, unblockUser);

// Lấy danh sách yêu cầu kết bạn đã gửi
router.get("/requests/sent", verifyToken, getSentRequests);

// Lấy danh sách yêu cầu kết bạn đã nhận
router.get("/requests/received", verifyToken, getReceivedRequests);

// Lấy danh sách bạn bè
router.get("/friends", verifyToken, getFriends);

module.exports = router;
