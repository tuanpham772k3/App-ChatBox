import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        }, // Khóa ngoại tham chiếu đến User
        refreshTokenHash: {
            type: String,
            required: true,
            unique: true,
        }, // Mã băm của refresh token
        userAgent: {
            type: String,
        }, // Người dùng login từ "Chrome/Firefox”
        ip: {
            type: String,
        }, // Login từ IP nào
        socketId: {
            type: String,
        }, // Lưu socketId nếu muốn gửi thông báo qua socket
        valid: {
            type: Boolean,
            default: true,
        }, // Cho phép thu hồi phiên nhanh, logout set valid=false
        expiresAt: {
            type: Date,
            required: true,
        }, // Thời gian hết hạn của refresh token
    },
    { timestamps: true } // tự động thêm createdAt và updatedAt
);

const Session = mongoose.model("Session", sessionSchema);
export default Session;
