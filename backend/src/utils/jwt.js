import dotenv from "dotenv";
import jwt from "jsonwebtoken";
dotenv.config();

/**
 * signAccessToken: tạo JWT access token (ngắn hạn)
 * verifyAccessToken: verify token và trả payload (nếu lỗi sẽ ném lỗi)
 */

const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET;
const ACCESS_EXP = process.env.ACCESS_TOKEN_EXPIRES || "15m";

export const signAccessToken = (payload) => {
    // payload thường chứa: userId, roles, iat, etc.
    return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXP });
};

// verify access token
export const verifyAccessToken = (token) => {
    return jwt.verify(token, ACCESS_SECRET);
};

/**
 * decode without verifying to read exp (dùng để blacklist token trong Redis)
 */
export const decodeToken = (token) => {
    return jwt.decode(token);
};
