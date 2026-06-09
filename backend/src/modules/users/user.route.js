const express = require("express");
const { verifyToken } = require("../../middlewares/authMiddleware.js");
const { upload } = require("../../config/multer.js");
const {
  getUserProfile,
  updateUserProfile,
  getUsers,
  getUserDetail,
} = require("./user.controller.js");

const router = express.Router();

// Lấy thông tin bản thân
router.get("/profile", verifyToken, getUserProfile);

// Cập nhật thông tin bản thân
router.put("/profile", verifyToken, upload.single("avatar"), updateUserProfile);

// Lấy danh sách người dùng
router.get("/", verifyToken, getUsers);

// Lấy chi tiết người dùng
router.get("/:id", verifyToken, getUserDetail);

module.exports = router;
