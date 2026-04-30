const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("../users/user.model.js");
const { AppError } = require("../../utils/AppError.js");

const REFRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000;

// Helper: send refresh token to client as HTTP cookie.
const setRefreshCookie = (res, refreshToken) => {
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true, // client JS không thể truy cập cookie này, giảm nguy cơ bị XSS đánh cắp token
    secure: process.env.NODE_ENV === "production", // Nếu false gửi cả http và https, true chỉ gửi https
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: REFRESH_TTL_MS,
    path: "/", // gửi cookie trong mọi request đến backend
  });
};

// Xóa cookie
const clearRefreshCookie = (res) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
  });
};

let signAccessToken = (payload) => {
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
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
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      throw new AppError("username, email, password are required", 400);
    }

    const user = await User.findOne({ email });
    if (user) {
      throw new AppError("email already exists", 409);
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

// Login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError("Email, password are required", 400);
    }

    const user = await User.findOne({ email });
    if (!user) {
      throw new AppError("Invalid email or password", 401);
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new AppError("Invalid email or password", 401);
    }

    const accessToken = signAccessToken({
      userId: user._id,
      roles: user.roles,
    });

    const refreshToken = generateRefreshToken();

    user.refreshTokenHash = hashToken(refreshToken);
    user.refreshTokenExpiresAt = new Date(Date.now() + REFRESH_TTL_MS);
    user.status = "active";
    user.lastSeenAt = new Date();

    await user.save();

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

// Refresh token
const refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;

    if (!token) {
      throw new AppError("No token provided", 400);
    }

    const hashed = hashToken(token);

    const user = await User.findOne({
      refreshTokenHash: hashed,
      refreshTokenExpiresAt: { $gt: new Date() },
    });

    if (!user) {
      throw new AppError("Invalid token", 400);
    }

    const newAccessToken = signAccessToken({
      userId: user._id,
      roles: user.roles,
    });

    const newRefreshToken = generateRefreshToken();

    user.refreshTokenHash = hashToken(newRefreshToken);
    user.refreshTokenExpiresAt = new Date(Date.now() + REFRESH_TTL_MS);

    await user.save();

    setRefreshCookie(res, newRefreshToken);

    return res.status(200).json({
      success: true,
      data: {
        accessToken: newAccessToken,
      },
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

      await User.findOneAndUpdate(
        { refreshTokenHash: hashed },
        {
          refreshTokenHash: null,
          refreshTokenExpiresAt: null,
        }
      );
    }

    clearRefreshCookie(res);

    return res.status(200).json({
      success: true,
      message: "Logged out",
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  logout,
};
