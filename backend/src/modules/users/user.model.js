const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
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
      maxlength: 500,
    },
    phone: {
      type: String,
      sparse: true, // cho phép null, nhưng không được trùng
    },
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

userSchema.index({ displayName: "text" });

const User = mongoose.model("User", userSchema);
module.exports = User;
