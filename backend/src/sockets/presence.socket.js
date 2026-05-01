const Conversation = require("../modules/conversations/conversation.model.js");
const User = require("../modules/users/user.model.js");

const getRelatedUserIds = async (userId) => {
  const conversations = await Conversation.find({
    "participants.user": userId,
    isActive: true,
  }).select("participants.user");

  const relatedUserIds = new Set();

  conversations.forEach((conversation) => {
    conversation.participants.forEach((participant) => {
      const participantId = participant.user.toString();
      if (participantId !== userId) {
        relatedUserIds.add(participantId);
      }
    });
  });

  return Array.from(relatedUserIds);
};

const broadcastPresence = async (io, userId, presence) => {
  const lastSeenAt = new Date();

  await User.findByIdAndUpdate(userId, { presence, lastSeenAt });

  const relatedUserIds = await getRelatedUserIds(userId);
  const payload = { userId, presence, lastSeenAt };

  relatedUserIds.forEach((relatedUserId) => {
    io.to(`user_${relatedUserId}`).emit("user_status_changed", payload);
  });
};

module.exports = { broadcastPresence };
