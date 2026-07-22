const Relationship = require("../relationship/relationship.model.js");

const resolveLastMessage = (conversation, userId) => {
  const participant = conversation.participants.find(
    (p) => p.userId._id.toString() === userId.toString()
  );

  if (!participant) {
    return null;
  }

  const { lastMessage } = conversation;

  if (!lastMessage) {
    return null;
  }

  const { clearedMessagesHistoryAt } = participant;

  if (
    clearedMessagesHistoryAt &&
    new Date(lastMessage.createdAt) <= new Date(clearedMessagesHistoryAt)
  ) {
    return null;
  }

  return lastMessage;
};

const resolveConversationCategory = async (conversation, userId) => {
  if (conversation.type === "group") {
    return "group";
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

  return isFriend ? "friend" : "stranger";
};

const formatConversation = async (conversation, userId) => {
  return {
    ...conversation,
    lastMessage: resolveLastMessage(conversation, userId),
    conversationCategory: await resolveConversationCategory(conversation, userId),
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
