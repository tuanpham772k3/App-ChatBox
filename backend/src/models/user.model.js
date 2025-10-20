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
    },
    avatarUrl: {
      url: {
        type: String,
        default: "https://aic.com.vn/wp-content/uploads/2024/10/avatar-fb-mac-dinh-1.jpg",
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

const User = mongoose.model("User", userSchema);
export default User;
