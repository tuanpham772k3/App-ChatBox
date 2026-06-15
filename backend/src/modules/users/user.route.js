const express = require("express");
const { verifyToken } = require("../../middlewares/authMiddleware.js");
const { upload } = require("../../config/multer.js");
const {
  getUsers,
  getUserDetail,
  getMyProfile,
  updateMyProfile,
} = require("./user.controller.js");

const router = express.Router();

// Lấy thông tin bản thân
router.get("/me", verifyToken, getMyProfile);

// Cập nhật thông tin bản thân
router.put("/me", verifyToken, upload.single("avatar"), updateMyProfile);

// Lấy danh sách người dùng
router.get("/", verifyToken, getUsers);

// Lấy chi tiết người dùng
router.get("/:id", verifyToken, getUserDetail);

module.exports = router;
