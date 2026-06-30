const { getSocket } = require("../../sockets/socket");
const RelationshipService = require("./relationship.service");
const {
  emitRelationshipEvent,
} = require("../../sockets/emitters/relationship.emitter.js");

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
      recipientId
    );

    // realtime
    emitRelationshipEvent.friendRequestReceived({
      io,
      recipientId,
      payload: {
        relationshipId: relationship._id,
        ...relationship.requesterId,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Friend request successfully created.",
      data: {
        relationshipId: relationship._id,
        ...relationship.recipientId,
      },
    });
  } catch (error) {
    next(error);
  }
};

const cancelFriendRequest = async (req, res, next) => {
  try {
    const requesterId = req.user.userId;
    const { relationshipId } = req.params;
    const io = getSocket();

    const relationship = await RelationshipService.cancelFriendRequest(
      relationshipId,
      requesterId
    );

    emitRelationshipEvent.friendRequestCancelled({
      io,
      recipientId: relationship.recipientId,
      relationshipId: relationship._id,
    });

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
    const io = getSocket();

    const relationship = await RelationshipService.acceptFriendRequest(
      relationshipId,
      recipientId
    );

    // realtime
    emitRelationshipEvent.friendRequestAccepted({
      io,
      requesterId: relationship.requesterId._id,
      payload: {
        relationshipId: relationship._id,
        ...relationship.recipientId,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Accepted the friend request successfully.",
      data: {
        relationshipId: relationship._id,
        ...relationship.requesterId,
      },
    });
  } catch (error) {
    next(error);
  }
};

const rejectFriendRequest = async (req, res, next) => {
  try {
    const recipientId = req.user.userId;
    const { relationshipId } = req.params;
    const io = getSocket();

    const relationship = await RelationshipService.rejectFriendRequest(
      relationshipId,
      recipientId
    );

    // realtime
    emitRelationshipEvent.friendRequestRejected({
      io,
      requesterId: relationship.requesterId,
      relationshipId: relationship._id,
    });

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
    const io = getSocket();

    const relationship = await RelationshipService.unfriend(userId, relationshipId);

    // realtime
    emitRelationshipEvent.friendRemoved({
      io,
      unfriendedUserId:
        relationship.requesterId.toString() === userId
          ? relationship.recipientId
          : relationship.requesterId,
      relationshipId: relationship._id,
    });

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
    const io = getSocket();

    const relationship = await RelationshipService.blockUser(relationshipId, userId);

    //realtime
    const blockedUserId =
      relationship.requesterId._id.toString() === userId
        ? relationship.recipientId._id
        : relationship.requesterId._id;

    emitRelationshipEvent.userBlocked({
      io,
      blockerId: userId,
      blockedUserId,
      relationship,
    });

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
    const io = getSocket();

    await RelationshipService.unblockUser(relationshipId, userId);

    emitRelationshipEvent.userUnblocked({
      io,
      userId,
      relationshipId,
    });

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
