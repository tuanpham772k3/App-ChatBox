import express from "express";
import { login, logoutCurrent, refreshToken, register } from "./auth.controller.js";
import { authLimiter } from "../../middlewares/rateLimit.js";

const router = express.Router();

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.post("/refresh", refreshToken);
router.post("/logout", logoutCurrent);

export default router;
