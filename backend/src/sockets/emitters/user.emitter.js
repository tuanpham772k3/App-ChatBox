const User = require("../../modules/users/user.model.js");
const RelationshipService = require("../../modules/relationship/relationship.service.js");
const { emitToUser } = require("../socket.helpers.js");

const broadcastPresence = async (io, userId, presence) => {
  const lastSeenAt = new Date();

  await User.findByIdAndUpdate(userId, { presence, lastSeenAt });

  const friends = await RelationshipService.getFriends(userId);
  const payload = { userId, presence, lastSeenAt };

  friends.forEach((friend) => {
    if (friend._id.toString() === userId.toString()) return;
    const friendId = String(friend._id);

    emitToUser(io, friendId, "user_status_changed", payload);
  });
};

module.exports = { broadcastPresence };
