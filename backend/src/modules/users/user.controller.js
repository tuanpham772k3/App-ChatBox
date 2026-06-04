const cloudinary = require("../../config/cloudinary.js");
const User = require("./user.model.js");
const UserService = require("./user.service.js");

// lấy thông tin người dùng
const getUserProfile = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId).select(
      "-passwordHash -refreshTokenHash -refreshTokenExpiresAt"
    );

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
const updateUserProfile = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { username, bio } = req.body;

    let avatarData = null;

    // Nếu có file avatar gửi lên
    if (req.file) {
      // Xóa avatar cũ nếu có
      const currentUser = await User.findById(userId);
      if (currentUser.avatar?.public_id) {
        await cloudinary.uploader.destroy(currentUser.avatar.public_id);
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
    if (avatarData) updateFields.avatar = avatarData;

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
 */
const getUsers = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { keyword } = req.query;

    const users = await UserService.getUsers(keyword, userId);

    return res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  getUsers,
};
