const { Types } = require("mongoose");
const User = require("../users/user.model.js");
const Relationship = require("./relationship.model.js");
const { AppError } = require("../../utils/AppError.js");

const RelationshipService = {
  async createFriendRequest(requesterId, recipientId) {
    if (!Types.ObjectId.isValid(recipientId)) {
      throw new AppError("Invalid recipient id.", 400);
    }

    const recipient = await User.exists({ _id: recipientId });

    if (!recipient) {
      throw new AppError("Recipient not found.", 404);
    }

    const existingRelationship = await Relationship.findOne({
      $or: [
        {
          requesterId,
          recipientId,
        },
        {
          requesterId: recipientId,
          recipientId: requesterId,
        },
      ],
    });

    if (existingRelationship) {
      throw new AppError("A relationship already exists between these users.", 409);
    }

    const relationship = await Relationship.create({
      requesterId,
      recipientId,
      status: "pending",
    });

    await relationship.populate([
      {
        path: "recipientId",
        select: "displayName avatar email",
      },
      {
        path: "requesterId",
        select: "displayName avatar email",
      },
    ]);

    return relationship.toObject();
  },

  async cancelFriendRequest(relationshipId, requesterId) {
    const relationship = await Relationship.findById(relationshipId);

    if (!relationship) {
      throw new AppError("Friend request not found.", 404);
    }

    if (
      relationship.requesterId.toString() !== requesterId ||
      relationship.status !== "pending"
    ) {
      throw new AppError("You cannot cancel this friend request.", 403);
    }

    await relationship.deleteOne();

    return relationship.toObject();
  },

  async acceptFriendRequest(relationshipId, recipientId) {
    const relationship = await Relationship.findById(relationshipId);

    if (!relationship) {
      throw new AppError("Friend request not found.", 404);
    }

    if (
      relationship.recipientId.toString() !== recipientId ||
      relationship.status !== "pending"
    ) {
      throw new AppError("You cannot accept this friend request.", 403);
    }

    relationship.status = "accepted";

    await relationship.save();

    await relationship.populate([
      { path: "requesterId", select: "displayName avatar email" },
      { path: "recipientId", select: "displayName avatar email" },
    ]);

    return relationship.toObject();
  },

  async rejectFriendRequest(relationshipId, recipientId) {
    const relationship = await Relationship.findById(relationshipId);

    if (!relationship) {
      throw new AppError("Friend request not found.", 404);
    }

    if (
      relationship.recipientId.toString() !== recipientId ||
      relationship.status !== "pending"
    ) {
      throw new AppError("You cannot reject this friend request.", 403);
    }

    await relationship.deleteOne();

    return relationship.toObject();
  },

  async unfriend(userId, relationshipId) {
    const relationship = await Relationship.findById(relationshipId);

    if (!relationship) {
      throw new AppError("Friend request not found.", 404);
    }

    const isParticipant =
      relationship.requesterId.equals(userId) || relationship.recipientId.equals(userId);

    if (!isParticipant) {
      throw new AppError("Access denied.", 403);
    }

    if (relationship.status !== "accepted") {
      throw new AppError("Users are not friends.", 400);
    }

    await relationship.deleteOne();

    return relationship.toObject();
  },

  async blockUser(relationshipId, userId) {
    const relationship = await Relationship.findById(relationshipId);

    if (!relationship) {
      throw new AppError("Relationship not found.", 404);
    }

    const isParticipant =
      relationship.requesterId.equals(userId) || relationship.recipientId.equals(userId);

    if (!isParticipant) {
      throw new AppError("Access denied.", 403);
    }

    relationship.status = "blocked";
    relationship.blockedBy = userId;

    await relationship.save();

    return relationship.toObject();
  },

  async unblockUser(relationshipId, userId) {
    const relationship = await Relationship.findById(relationshipId);

    if (!relationship) {
      throw new AppError("Relationship not found.", 404);
    }

    if (relationship.status !== "blocked") {
      throw new AppError("User is not blocked.", 400);
    }

    if (relationship.blockedBy?.toString() !== userId) {
      throw new AppError("Only blocker can unblock.", 403);
    }

    await relationship.deleteOne();

    return null;
  },

  async getSentRequests(userId) {
    const relationships = await Relationship.find({
      requesterId: userId,
      status: "pending",
    })
      .populate("recipientId", "displayName avatar email")
      .sort({ createdAt: -1 })
      .lean();

    return relationships.map((relationship) => ({
      relationshipId: relationship._id,
      ...relationship.recipientId,
    }));
  },

  async getReceivedRequests(userId) {
    const relationships = await Relationship.find({
      recipientId: userId,
      status: "pending",
    })
      .populate("requesterId", "displayName avatar email")
      .sort({ createdAt: -1 })
      .lean();

    return relationships.map((relationship) => ({
      relationshipId: relationship._id,
      ...relationship.requesterId,
    }));
  },

  async getFriends(userId) {
    const relationships = await Relationship.find({
      status: "accepted",
      $or: [
        {
          requesterId: userId,
        },
        {
          recipientId: userId,
        },
      ],
    })
      .populate("requesterId", "displayName avatar email")
      .populate("recipientId", "displayName avatar email")
      .lean();

    const friends = relationships.map((relationship) => {
      const isRequester = relationship.requesterId._id.toString() === userId.toString();
      const friendData = isRequester
        ? relationship.recipientId
        : relationship.requesterId;

      return {
        relationshipId: relationship._id,
        ...friendData,
      };
    });

    return friends;
  },
};

module.exports = RelationshipService;
