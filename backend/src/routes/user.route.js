import express from "express";
import { verifyToken } from "../controllers/middleware.controller.js";
import { getProfile, updateProfile } from "../controllers/user.controller.js";
import { upload } from "../config/multer.js";

const router = express.Router();

router.get("/profile", verifyToken, getProfile);
router.put("/profile", verifyToken, upload.single("avatar"), updateProfile);

export default router;
