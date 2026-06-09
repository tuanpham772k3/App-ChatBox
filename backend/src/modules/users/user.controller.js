const { Types } = require("mongoose");
const UserService = require("./user.service.js");

// lấy thông tin người dùng
const getUserProfile = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const user = await UserService.getUserProfile(userId);

    return res.status(200).json({
      success: true,
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
    const file = req.file;

    const user = await UserService.updateUserProfile(userId, username, bio, file);

    return res.status(200).json({
      success: true,
      message: "Update profile successfully",
      data: user,
    });
  } catch (error) {
    return next(error);
  }
};

// Lấy danh sách người dùng
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

// Lấy chi tiết người dùng
const getUserDetail = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user id.",
      });
    }

    const user = await UserService.getUserDetail(id, userId);

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  getUsers,
  getUserDetail,
};
