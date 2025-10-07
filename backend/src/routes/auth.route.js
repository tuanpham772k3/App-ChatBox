import express from "express";
import { register, login, refreshToken, logoutCurrent } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refreshToken);
router.post("/logout", logoutCurrent);

export default router;
