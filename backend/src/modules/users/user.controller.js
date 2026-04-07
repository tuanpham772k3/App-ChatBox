import cloudinary from "../../config/cloudinary.js";
import User from "./user.model.js";
import { searchUserService } from "./user.service.js";

// lấy thông tin người dùng
export const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId).select("-passwordHash");
    if (!user) {
      return res.status(401).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Get user profile successfully!",
      data: user,
    });
  } catch (error) {
    return next(error);
  }
};

// cập nhật hồ sơ
export const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { username, bio } = req.body;

    let avatarData = null;

    // Nếu có file avatar gửi lên
    if (req.file) {
      // Xóa avatar cũ nếu có
      const currentUser = await User.findById(userId);
      if (currentUser.avatarUrl?.public_id) {
        await cloudinary.uploader.destroy(currentUser.avatarUrl.public_id);
      }

      // Upload avatar mới
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "avatars",
            transformation: [{ width: 400, height: 400, crop: "limit" }],
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });

      avatarData = { url: result.secure_url, public_id: result.public_id };
    }

    const updateFields = { username, bio };
    if (avatarData) updateFields.avatarUrl = avatarData;

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      { new: true }
    ).select("-passwordHash");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Update profile successfully",
      idCode: 0,
      data: user,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Tìm kiếm người dùng
 * GET api/user/search
 *
 * Flow:
 * 1. Lấy userId từ JWT Token
 * 2. Nhận keyword từ client
 * 3. Gọi service xử lý logic
 * 4. Trả về response
 */
export const searchUsers = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { keyword } = req.query;

    const users = await searchUserService(keyword, userId);

    return res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    return next(error);
  }
};
