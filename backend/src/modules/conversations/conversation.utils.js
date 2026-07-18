const Relationship = require("../relationship/relationship.model.js");

const formatConversation = async (conversation, userId) => {
  if (conversation.type === "group") {
    return {
      ...conversation,
      conversationCategory: "group",
    };
  }

  const partner = conversation.participants.find(
    (participant) => participant.userId._id.toString() !== userId.toString()
  );

  const isFriend = await Relationship.exists({
    status: "accepted",
    $or: [
      {
        requesterId: userId,
        recipientId: partner.userId._id,
      },
      {
        recipientId: userId,
        requesterId: partner.userId._id,
      },
    ],
  });

  return {
    ...conversation,
    conversationCategory: isFriend ? "friend" : "stranger",
  };
};

const formatConversations = (conversations, userId) => {
  return Promise.all(
    conversations.map((conversation) => {
      return formatConversation(conversation, userId);
    })
  );
};

module.exports = {
  formatConversation,
  formatConversations,
};
