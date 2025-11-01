import express from "express";
import { verifyToken } from "../controllers/middleware.controller.js";
import {
  getAllUsers,
  getProfile,
  searchUsers,
  updateProfile,
} from "../controllers/user.controller.js";
import { upload } from "../config/multer.js";

const router = express.Router();

// Lấy thông tin người dùng
router.get("/profile", verifyToken, getProfile);

// Cập nhật thông tin người dùng
router.put("/profile", verifyToken, upload.single("avatar"), updateProfile);

// Tìm kiếm người dùng
router.get("/search", verifyToken, searchUsers);

// Lấy danh sách tất cả người dùng
router.get("/", verifyToken, getAllUsers);

export default router;
