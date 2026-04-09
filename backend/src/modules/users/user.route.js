const express = require("express");
const { verifyToken } = require("../../middlewares/authMiddleware.js");
const { upload } = require("../../config/multer.js");
const { getProfile, updateProfile, searchUsers } = require("./user.controller.js");

const router = express.Router();

// Lấy thông tin người dùng
router.get("/profile", verifyToken, getProfile);

// Cập nhật thông tin người dùng
router.put("/profile", verifyToken, upload.single("avatar"), updateProfile);

// Tìm kiếm người dùng
router.get("/search", verifyToken, searchUsers);

module.exports = router;
