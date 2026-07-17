const Relationship = require("../relationship/relationship.model.js");

const formatConversations = async (conversations, userId) => {
  const privateConversations = conversations.filter(
    (conversation) => conversation.type === "private"
  );

  const partnerIds = privateConversations.map((conversation) => {
    const partner = conversation.participants.find(
      (participant) => participant.userId._id.toString() !== userId.toString()
    );

    return partner.userId._id;
  });

  const relationships = await Relationship.find({
    status: "accepted",
    $or: [
      {
        requesterId: userId,
        recipientId: { $in: partnerIds },
      },
      {
        recipientId: userId,
        requesterId: { $in: partnerIds },
      },
    ],
  })
    .select("requesterId recipientId")
    .lean();

  const friendIds = new Set();

  relationships.forEach((relationship) => {
    const requesterId = relationship.requesterId.toString();
    const recipientId = relationship.recipientId.toString();

    friendIds.add(requesterId === userId.toString() ? recipientId : requesterId);
  });

  return conversations.map((conversation) => {
    if (conversation.type === "group") {
      return {
        ...conversation,
        conversationCategory: "group",
      };
    }

    const partner = conversation.participants.find(
      (participant) => participant.userId._id.toString() !== userId.toString()
    );

    return {
      ...conversation,
      conversationCategory: friendIds.has(partner.userId._id.toString())
        ? "friend"
        : "stranger",
    };
  });
};

module.exports = {
  formatConversations,
};
