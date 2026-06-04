const express = require("express");
const { verifyToken } = require("../../middlewares/authMiddleware.js");
const { upload } = require("../../config/multer.js");
const {
  getUserProfile,
  updateUserProfile,
  getUsers,
} = require("./user.controller.js");

const router = express.Router();

// Lấy thông tin người dùng
router.get("/profile", verifyToken, getUserProfile);

// Cập nhật thông tin người dùng
router.put("/profile", verifyToken, upload.single("avatar"), updateUserProfile);

// Tìm kiếm người dùng
router.get("/search", verifyToken, getUsers);

module.exports = router;
