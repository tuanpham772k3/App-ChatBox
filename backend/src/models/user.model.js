import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        passwordHash: {
            type: String,
            required: true,
        }, // Mã băm của mật khẩu
        avatarUrl: {
            type: String,
        }, // URL ảnh đại diện
        bio: {
            type: String,
            default: "",
        }, // Tiểu sử
        roles: {
            type: [String],
            default: ["user"],
        }, // Vai trò của người dùng
        status: {
            type: String,
            enum: ["active", "inactive", "banned"],
            default: "active",
        }, // Trạng thái tài khoản
        lastSeenAt: {
            type: Date,
            default: Date.now,
        }, // Lần cuối người dùng online
        lastActiveAt: {
            type: Date,
            default: Date.now,
        }, // Hoạt động cuối (gửi tin nhắn, tạo phòng...)
    },
    { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
