const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("../users/user.model.js");

const REFRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000;

// Helper: send refresh token to client as HTTP cookie.
const setRefreshCookie = (res, refreshToken) => {
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true, // client JS không thể truy cập cookie này, giảm nguy cơ bị XSS đánh cắp token
    secure: process.env.NODE_ENV === "production", // Nếu false gửi cả http và https, true chỉ gửi https
    sameSite: "none", // ngăn chặn tấn công CSRF
    maxAge: REFRESH_TTL_MS,
    path: "/", // gửi cookie trong mọi request đến backend
  });
};

// Xóa cookie
const clearRefreshCookie = (res) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
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
      return res.status(401).json({ message: "No token provided" });
    }

    const hashed = hashToken(token);

    const user = await User.findOne({
      refreshTokenHash: hashed,
      refreshTokenExpiresAt: { $gt: new Date() },
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid token" });
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
