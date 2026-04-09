const jwt = require("jsonwebtoken");
const User = require("../modules/users/user.model.js");

const authSocket = (io) => {
  io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;

    if (!token) return next(new Error("Authentication token required"));

    try {
      // Verify JWT token
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

      // Validate
      const user = await User.findById(decoded.userId);
      if (!user) throw new Error("User not found");

      // Gắn vào socket
      socket.userId = decoded.userId;
      socket.user = user;

      next();
    } catch (error) {
      console.error("Auth error:", {
        message: error.message,
        stack: error.stack,
      });

      if (error.name === "JsonWebTokenError") return next(new Error("INVALID_TOKEN"));
      if (error.name === "TokenExpiredError") return next(new Error("TOKEN_EXPIRED"));

      next(new Error("AUTH_INTERNAL_ERROR"));
    }
  });
};

module.exports = { authSocket };
