const { getSocket } = require("../../sockets/socket");
const RelationshipService = require("./relationship.service");

const createFriendRequest = async (req, res, next) => {
  try {
    const requesterId = req.user.userId;
    const { recipientId } = req.body;
    const io = getSocket();

    if (!recipientId) {
      return res.status(400).json({
        success: false,
        message: "recipientId is required.",
      });
    }

    if (requesterId === recipientId) {
      return res.status(400).json({
        success: false,
        message: "Unable to send friend requests to myself.",
      });
    }

    const relationship = await RelationshipService.createFriendRequest(
      requesterId,
      recipientId,
      io
    );

    return res.status(201).json({
      success: true,
      message: "Friend request successfully created.",
      data: relationship,
    });
  } catch (error) {
    next(error);
  }
};

const cancelFriendRequest = async (req, res, next) => {
  try {
    const requesterId = req.user.userId;
    const { relationshipId } = req.params;

    await RelationshipService.cancelFriendRequest(relationshipId, requesterId);

    return res.status(200).json({
      success: true,
      message: "The friend request has been successfully canceled.",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

const acceptFriendRequest = async (req, res, next) => {
  try {
    const recipientId = req.user.userId;
    const { relationshipId } = req.params;

    const relationship = await RelationshipService.acceptFriendRequest(
      relationshipId,
      recipientId
    );

    return res.status(200).json({
      success: true,
      message: "Accepted the friend request successfully.",
      data: relationship,
    });
  } catch (error) {
    next(error);
  }
};

const rejectFriendRequest = async (req, res, next) => {
  try {
    const recipientId = req.user.userId;
    const { relationshipId } = req.params;

    await RelationshipService.rejectFriendRequest(relationshipId, recipientId);

    return res.status(200).json({
      success: true,
      message: "Friend request rejected successfully.",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

const unfriend = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { relationshipId } = req.params;

    await RelationshipService.unfriend(userId, relationshipId);

    return res.status(200).json({
      success: true,
      message: "Unfriending successfully.",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

const blockUser = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { relationshipId } = req.params;

    const relationship = await RelationshipService.blockUser(relationshipId, userId);

    return res.status(200).json({
      success: true,
      message: "The user has been successfully blocked.",
      data: relationship,
    });
  } catch (error) {
    next(error);
  }
};

const unblockUser = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { relationshipId } = req.params;

    await RelationshipService.unblockUser(relationshipId, userId);

    return res.status(200).json({
      success: true,
      message: "The user has successfully unlocked.",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

const getSentRequests = async (req, res, next) => {
  try {
    const { userId } = req.user;

    const sentRequests = await RelationshipService.getSentRequests(userId);

    return res.status(200).json({
      success: true,
      data: sentRequests,
    });
  } catch (error) {
    next(error);
  }
};

const getReceivedRequests = async (req, res, next) => {
  try {
    const { userId } = req.user;

    const receivedRequests = await RelationshipService.getReceivedRequests(userId);

    return res.status(200).json({
      success: true,
      data: receivedRequests,
    });
  } catch (error) {
    next(error);
  }
};

const getFriends = async (req, res, next) => {
  try {
    const { userId } = req.user;

    const friends = await RelationshipService.getFriends(userId);

    return res.status(200).json({
      success: true,
      data: friends,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createFriendRequest,
  cancelFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  unfriend,
  blockUser,
  unblockUser,
  getSentRequests,
  getReceivedRequests,
  getFriends,
};
