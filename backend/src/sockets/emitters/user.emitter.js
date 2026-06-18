const Relationship = require("../../modules/relationship/relationship.model.js");
const User = require("../../modules/users/user.model.js");
const { emitToUser } = require("../socket.helpers.js");

const getFriendIds = async (userId) => {
  const relationships = await Relationship.find({
    status: "accepted",
    $or: [{ requesterId: userId }, { recipientId: userId }],
  }).select("requesterId recipientId");

  return relationships.map((relationship) => {
    const requesterId = relationship.requesterId.toString();
    const recipientId = relationship.recipientId.toString();

    return requesterId === userId ? recipientId : requesterId;
  });
};

const broadcastPresence = async (io, userId, presence) => {
  const lastSeenAt = new Date();

  await User.findByIdAndUpdate(userId, { presence, lastSeenAt });

  const friendIds = await getFriendIds(userId);
  const payload = { userId, presence, lastSeenAt };

  friendIds.forEach((friendId) => {
    emitToUser(io, friendId, "user_status_changed", payload);
  });
};

module.exports = { broadcastPresence };
