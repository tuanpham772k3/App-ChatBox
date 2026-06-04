const mongoose = require("mongoose");

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
    },
    refreshTokenHash: {
      type: String,
      default: null,
    },
    refreshTokenExpiresAt: {
      type: Date,
      default: null,
    },
    avatar: {
      url: {
        type: String,
        default: null,
      },
      public_id: { type: String, default: null }, // ID để xóa/replace ảnh trên Cloudinary
    },
    bio: {
      type: String,
      default: "",
    }, // Tiểu sử
    roles: {
      type: [String],
      default: ["user"],
    },
    status: {
      type: String,
      enum: ["active", "inactive", "banned"],
      default: "inactive",
    }, // Trạng thái tài khoản
    presence: {
      type: String,
      enum: ["online", "offline"],
      default: "offline",
    },
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

userSchema.index({ username: "text" });

const User = mongoose.model("User", userSchema);
module.exports = User;
