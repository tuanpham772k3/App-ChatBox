import express from "express";
import { verifyToken } from "../controllers/middleware.controller.js";
import { getProfile, updateProfile } from "../controllers/user.controller.js";

const router = express.Router();

router.get("/profile", verifyToken, getProfile);
router.put("/profile", verifyToken, updateProfile);

export default router;
