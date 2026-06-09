const { AppError } = require("../../utils/AppError.js");
const User = require("./user.model.js");
const Relationship = require("../relationship/relationship.model.js");
const cloudinary = require("../../config/cloudinary.js");

const UserService = {
  async getUserProfile(userId) {
    const user = await User.findById(userId).select(
      "-passwordHash -refreshTokenHash -refreshTokenExpiresAt"
    );

    if (!user) {
      throw new AppError("User not found", 404);
    }

    return user;
  },

  async updateUserProfile(userId, username, bio, file) {
    let avatarData = null;

    if (file) {
      // Xóa avatar cũ (nếu có)
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
        stream.end(file.buffer);
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
      throw new AppError("User not found.", 404);
    }

    return user;
  },

  async getUsers(keyword, userId) {
    // Nếu không có keyword → trả về danh sách gợi ý (mới hoạt động gần đây)
    if (!keyword || keyword.trim() === "") {
      const suggestedUsers = await User.find({ _id: { $ne: userId } })
        .select("_id username avatar bio lastActiveAt")
        .sort({ lastActiveAt: -1 }) // user hoạt động gần nhất trước
        .limit(20);

      return suggestedUsers;
    }

    // Tìm kiếm theo tên, không phân biệt hoa thường
    const regex = new RegExp(keyword.trim(), "i");

    const searchedUsers = await User.find({
      _id: { $ne: userId },
      username: regex,
    })
      .select("_id username avatar bio lastActiveAt")
      .sort({ lastActiveAt: -1 })
      .limit(10);

    return searchedUsers;
  },

  async getUserDetail(targetUserId, userId) {
    const user = await User.findById(targetUserId)
      .select("_id username avatar bio createdAt")
      .lean();

    if (!user) {
      throw new AppError("User not found.", 404);
    }

    const relationship = await Relationship.findOne({
      $or: [
        {
          requesterId: userId,
          recipientId: targetUserId,
        },
        {
          requesterId: targetUserId,
          recipientId: userId,
        },
      ],
    }).lean();

    let relationshipStatus = "not_friend";

    if (relationship) {
      if (relationship.status === "accepted") {
        relationshipStatus = "friend";
      }

      if (relationship.status === "pending") {
        if (relationship.requesterId.equals(userId)) {
          relationshipStatus = "pending_sent";
        } else {
          relationshipStatus = "pending_received";
        }
      }

      if (relationship.status === "blocked") {
        if (relationship.blockedBy?.equals(userId)) {
          relationshipStatus = "blocked_by_me";
        } else {
          relationshipStatus = "blocked_by_other";
        }
      }
    }

    return {
      ...user,

      relationship: {
        status: relationshipStatus,
      },
    };
  },
};

module.exports = UserService;
