const { AppError } = require("../../utils/AppError.js");
const User = require("./user.model.js");
const Relationship = require("../relationship/relationship.model.js");
const cloudinary = require("../../config/cloudinary.js");

const UserService = {
  async getMyProfile(userId) {
    const user = await User.findById(userId).select(
      "-passwordHash -refreshTokenHash -refreshTokenExpiresAt"
    );

    if (!user) {
      throw new AppError("User not found", 404);
    }

    return user;
  },

  async updateMyProfile(userId, displayName, bio, file) {
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

    const updateFields = { displayName, bio };
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
    // Lấy danh sách bạn bè
    const relationships = await Relationship.find({
      status: { $in: ["pending", "accepted", "blocked"] },
      $or: [{ requesterId: userId }, { recipientId: userId }],
    });

    const friendIds = relationships.map((r) =>
      r.requesterId.toString() === userId.toString() ? r.recipientId : r.requesterId
    );

    // Loại bỏ chính mình và bạn bè
    const excludeIds = [userId, ...friendIds];

    if (!keyword || keyword.trim() === "") {
      return await User.find({
        _id: { $nin: excludeIds },
      })
        .select("_id displayName avatar bio lastActiveAt")
        .sort({ lastActiveAt: -1 })
        .limit(20);
    }

    // Tìm kiếm theo tên, không phân biệt hoa thường
    const regex = new RegExp(keyword.trim(), "i");

    const users = await User.find({
      _id: { $nin: excludeIds },
      displayName: regex,
    })
      .select("_id displayName avatar bio lastActiveAt")
      .sort({ lastActiveAt: -1 })
      .limit(10);

    return users;
  },

  async getUserDetail(targetUserId, userId) {
    const user = await User.findById(targetUserId)
      .select("_id displayName email avatar bio createdAt")
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

      return {
        ...user,

        relationship: {
          _id: relationship._id,
          status: relationshipStatus,
        },
      };
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
