const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("../users/user.model.js");
const Session = require("./session.model.js");
const { getSocket } = require("../../socket.js");

// Time To Live for refresh token (7 days)
const REFRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000; // change to ms

// Helper: send refresh token to client as HTTP cookie.
const setRefreshCookie = (res, refreshToken) => {
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true, // client JS không đọc được
    secure: process.env.NODE_ENV === "production", // Nếu false gửi cả http và https, true chỉ gửi https
    sameSite: "lax", // ngăn chặn tấn công CSRF
    maxAge: REFRESH_TTL_MS, // time to live
    path: "/", // gửi cookie trong mọi request đến backend
  });
};

// Xóa cúc kỳ
const clearRefreshCookie = (res) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
};

// Register
const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        message: "username, email, password are required",
      });
    }

    const user = await User.findOne({ email });
    if (user) {
      return res.status(409).json({ message: "email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      passwordHash: hashedPassword,
    });

    await newUser.save();

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      data: {
        user: {
          id: newUser._id,
          username: newUser.username,
          email: newUser.email,
        },
      },
    });
  } catch (error) {
    return next(error);
  }
};

let signAccessToken = (payload) => {
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "30d",
  });
};

let generateRefreshToken = () => {
  return crypto.randomBytes(64).toString("hex");
};

let hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

// Login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email, password are required",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    user.status = "active";
    user.lastSeenAt = new Date();
    await user.save();

    const accessToken = signAccessToken({
      userId: user._id,
      roles: user.roles,
    });
    const refreshToken = generateRefreshToken();
    const hashesRefreshToken = hashToken(refreshToken);

    const existingSessions = await Session.find({ userId: user._id })
      .sort({ createdAt: 1 }) // sắp xếp theo thời gian tạo, lấy cũ nhất lên đầu mảng
      .exec(); // truy vấn

    if (existingSessions.length >= 5) {
      // Xóa session đầu mảng
      await Session.findByIdAndDelete(existingSessions[0]._id);
    }

    const session = new Session({
      userId: user._id,
      refreshTokenHash: hashesRefreshToken,
      ip: req.ip,
      userAgent: req.get("User-Agent") || "unknown",
      expiresAt: new Date(Date.now() + REFRESH_TTL_MS),
      valid: true,
    });

    await session.save();

    setRefreshCookie(res, refreshToken);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        accessToken,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          avatar: user.avatarUrl.url,
        },
      },
    });
  } catch (error) {
    return next(error);
  }
};

const refreshToken = async (req, res, next) => {
  try {
    const refToken = req.cookies?.refreshToken;

    if (!refToken) {
      return res.status(401).json({ message: "No refresh token provided" });
    }

    const hashedRefToken = hashToken(refToken);

    const session = await Session.findOne({
      refreshTokenHash: hashedRefToken,
      valid: true,
      expiresAt: { $gt: new Date() }, // chưa hết hạn
    });

    if (!session) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const user = await User.findById(session.userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const newAccessToken = signAccessToken({
      userId: user._id,
      roles: user.roles,
    });

    const newRefreshToken = generateRefreshToken();
    const newHashedRefreshToken = hashToken(newRefreshToken);

    session.refreshTokenHash = newHashedRefreshToken;
    session.ip = req.ip;
    session.userAgent = req.get("User-Agent") || "unknown";
    session.expiresAt = new Date(Date.now() + REFRESH_TTL_MS);
    await session.save();

    setRefreshCookie(res, newRefreshToken);

    return res.status(200).json({
      success: true,
      message: "Token refreshed",
      accessToken: newAccessToken,
    });
  } catch (error) {
    return next(error);
  }
};

const logoutCurrent = async (req, res, next) => {
  try {
    const refToken = req.cookies?.refreshToken;

    if (!refToken) {
      clearRefreshCookie(res); // tránh sót cookie cũ
      return res.status(200).json({ message: "Logged out" });
    }

    const refTokenHash = hashToken(refToken);

    const session = await Session.findOne({
      refreshTokenHash: refTokenHash,
    });

    if (session) {
      session.valid = false;
      await session.save();

      await User.findByIdAndUpdate(session.userId, { status: "inactive" });

      if (session.socketId) {
        const io = getSocket();
        const socket = io.sockets.sockets.get(session.socketId);
        if (socket) socket.disconnect(true);
      }
    }

    // Clear cookie on client
    clearRefreshCookie(res);

    return res.status(200).json({
      success: true,
      message: "Logged out",
      data: null,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  logoutCurrent,
};
