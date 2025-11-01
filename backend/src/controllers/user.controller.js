import cloudinary from "../config/cloudinary.js";
import User from "../models/user.model.js";
import { getAllUsersService, searchUserService } from "../services/user.service.js";

// lấy thông tin người dùng
export const getProfile = async (req, res) => {
  try {
    //req.user lấy từ verifyToken
    const userId = req.user.userId;

    //find and check user
    const user = await User.findById(userId).select("-passwordHash");
    if (!user) {
      return res.status(401).json({
        message: "User not found",
        idCode: 1,
      });
    }

    // result
    return res.status(200).json({
      message: "Get user profile successfully!",
      idCode: 0,
      user,
    });
  } catch (error) {
    console.log("getProfile error:", error);
    return res.status(500).json({
      message: "Internal server error",
      idCode: 3,
    });
  }
};

// cập nhật hồ sơ
export const updateProfile = async (req, res) => {
  try {
    console.log("REQ.FILE:", req.file);

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
        idCode: 1,
      });
    }

    //trả kết quả
    return res.status(200).json({
      message: "Update profile successfully",
      idCode: 0,
      user,
    });
  } catch (error) {
    console.log("updateProfile error:", error);
    return res.status(500).json({
      message: "Internal error server",
      idCode: 3,
    });
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
export const searchUsers = async (req, res) => {
  try {
    const { userId } = req.user;

    // keyword từ client
    const { q } = req.query;

    // Gọi service xử lý logic
    const users = await searchUserService(q, userId);

    // Trả kết quả
    return res.status(200).json({
      success: true,
      idCode: 0,
      data: users,
    });
  } catch (error) {
    console.log("Error in getUsers controller", error);

    // Error server
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      idCode: 1,
    });
  }
};

/**
 * Lấy danh sách tất cả người dùng
 * GET api/user
 *
 * Flow:
 * 1. Lấy userId từ JWT Token
 * 2. Gọi service xử lý logic
 * 3. Trả về response
 */
export const getAllUsers = async (req, res) => {
  try {
    const { userId } = req.user;

    const users = await getAllUsersService(userId);

    res.status(200).json({
      success: true,
      message: "Get users successfully",
      idCode: 0,
      data: users,
    });
  } catch (error) {
    console.log("Error in getAllUser controller", error);

    // Error server
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      idCode: 1,
    });
  }
};
