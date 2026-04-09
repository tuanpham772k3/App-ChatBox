const rateLimit = require("express-rate-limit");

const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 phút
  max: 5, // tối đa 5 request
  message: { message: "Too many requests, try again later" },
});

module.exports = { authLimiter };
