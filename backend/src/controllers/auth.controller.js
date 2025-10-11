import bcrypt from "bcrypt";
import User from "../models/user.model.js";
import Session from "../models/session.model.js";
import { signAccessToken } from "../utils/jwt.js";
import { generateRefreshToken, hashToken } from "../utils/tokens.js";

// Time To Live for refresh token (7 days)
const REFRESH_TTL_DAYS = parseInt(process.env.REFRESH_TOKEN_EXPIRES_DAYS || "7", 10);
const REFRESH_TTL_MS = REFRESH_TTL_DAYS * (24 * 60 * 60 * 1000); // change to ms

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
export const register = async (req, res) => {
    console.log("req.body", req.body);

    try {
        const { username, email, password, displayName } = req.body;

        //validate input
        if (!username || !email || !password) {
            return res.status(400).json({
                message: "username, email, password are required",
                idCode: 1,
            });
        }

        // check if email already exists
        const user = await User.findOne({ email });

        if (user) {
            return res.status(409).json({ message: "email already exists", idCode: 2 });
        }

        // hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // create new user
        const newUser = new User({
            username,
            email,
            passwordHash: hashedPassword,
            displayName: displayName || username,
        });

        await newUser.save(); //Save to DB

        // return success response
        return res.status(201).json({
            message: "User created successfully",
            idCode: 0,
            user: {
                id: newUser._id,
                username: newUser.username,
                email: newUser.email,
                displayName: newUser.displayName,
            },
        });
    } catch (error) {
        console.error("Error in register:", error);
        return res.status(500).json({ message: "Internal server error", idCode: 3 });
    }
};

// Login
export const login = async (req, res) => {
    console.log("req.body", req.body);

    try {
        const { email, password } = req.body;

        // validate email password
        if (!email || !password) {
            return res.status(400).json({
                message: "Email, password are required",
                idCode: 1,
            });
        }

        // check if email exists
        const user = await User.findOne({ email });

        // if user not found
        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password",
                idCode: 2,
            });
        }

        // compare password with passwordHash
        const comparePassword = await bcrypt.compare(password, user.passwordHash);

        // if password not match
        if (!comparePassword) {
            return res.status(401).json({
                message: "Invalid email or password",
                idCode: 2,
            });
        }

        // create access token
        const accessToken = signAccessToken({
            userId: user._id,
            roles: user.roles,
        });

        // create refresh token
        const refreshToken = generateRefreshToken();
        const hashesRefreshToken = hashToken(refreshToken);

        // Tìm phiên đang có trong db
        const existingSessions = await Session.find({ userId: user._id })
            .sort({ createdAt: 1 }) // sắp xếp theo thời gian tạo, lấy cũ nhất lên đầu mảng
            .exec(); // truy vấn

        // Tối đa 5 phiên
        if (existingSessions.length >= 5) {
            // Xóa session đầu mảng
            await Session.findByIdAndDelete(existingSessions[0]._id);
        }

        // tạo mới session, lưu refreshTokenHash vào DB
        const session = new Session({
            userId: user._id,
            refreshTokenHash: hashesRefreshToken,
            ip: req.ip,
            userAgent: req.get("User-Agent") || "unknown",
            expiresAt: new Date(Date.now() + REFRESH_TTL_MS),
            valid: true,
        });

        await session.save();

        // Gửi cúc kì đến client truyền refreshToken chưa hash
        setRefreshCookie(res, refreshToken);

        // return success response
        return res.status(200).json({
            message: "Login successful",
            idCode: 0,
            accessToken,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                displayName: user.displayName,
            },
        });
    } catch (error) {
        console.log("Error in login:", error);
        return res.status(500).json({ message: "Internal server error", idCode: 3 });
    }
};

export const refreshToken = async (req, res) => {
    try {
        const refToken = req.cookies?.refreshToken;

        // nếu không có refresh token trong cookie
        if (!refToken) {
            return res.status(401).json({ message: "No refresh token provided", idCode: 1 });
        }

        const hashedRefToken = hashToken(refToken);

        // tìm session với refreshTokenHash
        const session = await Session.findOne({
            refreshTokenHash: hashedRefToken,
            valid: true,
            expiresAt: { $gt: new Date() }, // chưa hết hạn
        });

        // nếu không tìm thấy session
        if (!session) {
            return res.status(401).json({ message: "Invalid refresh token", idCode: 2 });
        }

        // tìm user tương ứng
        const user = await User.findById(session.userId);
        if (!user) {
            return res.status(401).json({ message: "User not found", idCode: 2 });
        }

        // tạo access token mới
        const newAccessToken = signAccessToken({
            userId: user._id,
            roles: user.roles,
        });

        // tao refresh token mới
        const newRefreshToken = generateRefreshToken();
        const newHashedRefreshToken = hashToken(newRefreshToken);

        // cập nhật session với refreshTokenHash mới
        session.refreshTokenHash = newHashedRefreshToken;
        session.ip = req.ip;
        session.userAgent = req.get("User-Agent") || "unknown";
        session.expiresAt = new Date(Date.now() + REFRESH_TTL_MS);
        await session.save();

        // gửi refresh token mới trong cookie
        setRefreshCookie(res, newRefreshToken);

        // trả access token mới
        return res.status(200).json({
            message: "Token refreshed",
            idCode: 0,
            accessToken: newAccessToken,
        });
    } catch (error) {
        console.log("Error in refreshToken: ", error);
        return res.status(500).json({ message: "Internal server error", idCode: 3 });
    }
};

export const logoutCurrent = async (req, res) => {
    try {
        const refToken = req.cookies?.refreshToken;

        // Checkout refreshToken
        if (!refToken) {
            clearRefreshCookie(res); // tránh sót cookie cũ
            return res.status(200).json({ message: "Logged out", idCode: 0 });
        }

        // Hash refreshToken để tìm trong db
        const refTokenHash = hashToken(refToken);

        //Tìm session bằng refreshToken
        const session = await Session.findOne({ refreshTokenHash: refTokenHash });

        // Nếu tồn tại
        if (session) {
            // đánh dấu session hết hiệu lực
            session.valid = false;
            await session.save();

            // Nếu có socketId, ngắt kết nối socket tương ứng
            if (session.socketId) {
                const socket = io.sockets.sockets.get(session.socketId);
                if (socket) socket.disconnect(true);
            }
        }

        // Clear cookie on client
        clearRefreshCookie(res);
        return res.status(200).json({ message: "Logged out", idCode: 0 });
    } catch (error) {
        console.log("Error logout current :", error);
        return res.status(500).json({ message: "Internal server error", idCode: 3 });
    }
};
