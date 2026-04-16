const express = require("express");
const { register, login, refreshToken, logout } = require("./auth.controller.js");
const { authLimiter } = require("../../middlewares/rateLimit.js");

const router = express.Router();

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.post("/refresh-token", refreshToken);
router.post("/logout", logout);

module.exports = router;
