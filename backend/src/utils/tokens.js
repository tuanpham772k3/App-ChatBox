import crypto from "crypto";

// tạo refresh token ngẫu nhiên, 128 ký tự hex (64 bytes)
export const generateRefreshToken = () => {
    return crypto.randomBytes(64).toString("hex");
};

// sha256 hash, để không lưu bản gốc refresh token vào DB
export const hashToken = (token) => {
    return crypto.createHash("sha256").update(token).digest("hex");
};
