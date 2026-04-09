const express = require("express");
const { register, login, refreshToken, logoutCurrent } = require("./auth.controller.js");
const { authLimiter } = require("../../middlewares/rateLimit.js");

const router = express.Router();

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.post("/refresh", refreshToken);
router.post("/logout", logoutCurrent);

module.exports = router;
