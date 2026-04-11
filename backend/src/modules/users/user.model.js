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
    avatarUrl: {
      url: {
        type: String,
        default:
          "https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg",
      }, // URL hiển thị
      public_id: { type: String }, // ID để xóa/replace ảnh trên Cloudinary
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

userSchema.index({ username: "text" });

const User = mongoose.model("User", userSchema);
module.exports = User;
