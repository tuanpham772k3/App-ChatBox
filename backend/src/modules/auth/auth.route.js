import express from "express";
import { login, logoutCurrent, refreshToken, register } from "./auth.controller.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refreshToken);
router.post("/logout", logoutCurrent);

export default router;
