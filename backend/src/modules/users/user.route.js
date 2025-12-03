import express from "express";
import { verifyToken } from "../../middlewares/middleware.controller.js";
import { upload } from "../../config/multer.js";
import { getProfile, searchUsers, updateProfile } from "./user.controller.js";

const router = express.Router();

// Lấy thông tin người dùng
router.get("/profile", verifyToken, getProfile);

// Cập nhật thông tin người dùng
router.put("/profile", verifyToken, upload.single("avatar"), updateProfile);

// Tìm kiếm người dùng
router.get("/search", verifyToken, searchUsers);

export default router;
