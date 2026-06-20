const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("../users/user.model.js");
const Session = require("../users/session.model.js");
const { AppError } = require("../../utils/AppError.js");

const ACCESS_TOKEN_TTL = "14m";
const REFRESH_TOKEN_TTL = 14 * 24 * 60 * 60 * 1000; // 14 ngày

// Helper: send refresh token to client as HTTP cookie.
const setRefreshCookie = (res, refreshToken) => {
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true, // client JS không thể truy cập cookie này, giảm nguy cơ bị XSS đánh cắp token
    secure: process.env.NODE_ENV === "production", // Nếu false gửi cả http và https, true chỉ gửi https
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: REFRESH_TOKEN_TTL,
    path: "/", // gửi cookie trong mọi request đến backend
  });
};

let signAccessToken = (payload) => {
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: ACCESS_TOKEN_TTL,
  });
};

let generateRefreshToken = () => {
  return crypto.randomBytes(64).toString("hex");
};

let hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

// Register
const register = async (req, res, next) => {
  try {
    const { username, email, password, firstName, lastName } = req.body;

    if (!username || !email || !password || !firstName || !lastName) {
      throw new AppError(
        "username, email, password, firstName, lastName are required",
        400
      );
    }

    const duplicate = await User.findOne({ email });
    if (duplicate) {
      throw new AppError("email already exists", 409);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      passwordHash: hashedPassword,
      displayName: `${firstName} ${lastName}`,
    });

    await newUser.save();

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      data: null,
    });
  } catch (error) {
    return next(error);
  }
};

// Login
const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      throw new AppError("Username, password are required", 400);
    }

    const user = await User.findOne({ username });
    if (!user) {
      throw new AppError("Invalid username or password", 401);
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new AppError("Invalid username or password", 401);
    }

    const accessToken = signAccessToken({
      userId: user._id,
    });

    user.lastSeenAt = new Date();

    await user.save();

    const refreshToken = generateRefreshToken();
    const refreshTokenHash = hashToken(refreshToken);

    await Session.create({
      userId: user.id,
      refreshTokenHash,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL),
    });

    setRefreshCookie(res, refreshToken);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: accessToken,
    });
  } catch (error) {
    return next(error);
  }
};

// Logout
const logout = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;

    if (token) {
      const hashed = hashToken(token);

      // xoá phiên đăng nhập
      await Session.deleteOne({ refreshTokenHash: hashed });

      // xoá cookie
      res.clearCookie("refreshToken");
    }

    return res.status(200).json({
      success: true,
      message: "Logged out",
    });
  } catch (error) {
    return next(error);
  }
};

// Refresh token
const refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) {
      throw new AppError("No token provided", 401);
    }

    const hashed = hashToken(token);

    const session = await Session.findOne({ refreshTokenHash: hashed });
    if (!session) {
      throw new AppError("Invalid refresh token", 403);
    }
    if (session.expiresAt < new Date()) {
      throw new AppError("Refresh token expired", 403);
    }

    const accessToken = signAccessToken({
      userId: session.userId,
    });

    const refreshToken = generateRefreshToken();
    const refreshTokenHash = hashToken(refreshToken);

    session.refreshTokenHash = refreshTokenHash;
    session.expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL);

    await session.save();

    setRefreshCookie(res, refreshToken);

    return res.status(200).json({
      success: true,
      data: accessToken,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
  refreshToken,
};
