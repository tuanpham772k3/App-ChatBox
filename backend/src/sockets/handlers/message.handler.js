const Message = require("../../modules/messages/message.model.js");
const Conversation = require("../../modules/conversations/conversation.model.js");
const { emitConversationEvent } = require("../emitters/conversation.emitter.js");

const shouldAdvanceReceiptPointer = (currentAt, nextAt) => {
  if (!nextAt) return false;
  if (!currentAt) return true;

  return new Date(nextAt).getTime() > new Date(currentAt).getTime();
};

const registerMessageHandlers = (io, socket) => {
  const buildPendingDeliveredQuery = ({ conversationId, participant, userId }) => {
    const query = {
      conversationId,
      senderId: { $ne: userId },
    };

    if (participant.lastDeliveredAt) {
      query.createdAt = { $gt: participant.lastDeliveredAt };
    }

    const visibleFrom = participant.clearedMessagesHistoryAt || participant.joinedAt;
    if (visibleFrom) {
      query.createdAt = query.createdAt
        ? { ...query.createdAt, $gte: visibleFrom }
        : { $gte: visibleFrom };
    }

    return query;
  };

  const handleDeliverySync = async () => {
    const conversations = await Conversation.find({
      "participants.userId": socket.user._id,
      isActive: true,
    })
      .select("participants")
      .lean();

    await Promise.all(
      conversations.map(async (conversation) => {
        const participant = conversation.participants.find(
          (p) => String(p.userId) === String(socket.user._id)
        );

        if (!participant) return;

        const latestUndeliveredMessage = await Message.findOne(
          buildPendingDeliveredQuery({
            conversationId: conversation._id,
            participant,
            userId: socket.user._id,
          })
        )
          .select("createdAt")
          .sort({ createdAt: -1, _id: -1 })
          .lean();

        if (!latestUndeliveredMessage) return;

        const updatedConversation = await Conversation.findOneAndUpdate(
          {
            _id: conversation._id,
            "participants.userId": socket.user._id,
            isActive: true,
          },
          {
            $set: {
              "participants.$.lastDeliveredAt": latestUndeliveredMessage.createdAt,
            },
          },
          {
            new: true,
            select: "participants",
            lean: true,
          }
        );

        if (!updatedConversation) return;

        emitConversationEvent.messageDeliveredUpdated({
          io,
          conversationId: String(conversation._id),
          userId: String(socket.user._id),
          lastDeliveredAt: latestUndeliveredMessage.createdAt,
          participants: updatedConversation.participants,
        });
      })
    );
  };

  // Delivered receipt
  const handleMarkDelivered = async ({ messageId }) => {
    try {
      if (!messageId) return;

      const message = await Message.findOne({
        _id: messageId,
        senderId: { $ne: socket.user._id },
      })
        .select("_id conversationId createdAt")
        .lean();

      if (!message) return;

      const conversation = await Conversation.findOne({
        _id: message.conversationId,
        "participants.userId": socket.user._id,
        isActive: true,
      }).select("participants");

      if (!conversation) return;

      const participant = conversation.participants.find((p) =>
        p.userId?.equals(socket.user._id)
      );

      if (!participant) return;

      if (!shouldAdvanceReceiptPointer(participant.lastDeliveredAt, message.createdAt)) {
        return;
      }

      participant.lastDeliveredAt = message.createdAt;

      await conversation.save();

      emitConversationEvent.messageDeliveredUpdated({
        io,
        conversationId: String(message.conversationId),
        userId: String(socket.user._id),
        lastDeliveredAt: message.createdAt,
        participants: conversation.participants,
      });
    } catch (error) {
      console.error("Error updating delivered pointer:", error);
    }
  };

  // Read receipt
  const handleMarkSeen = async ({ messageId }) => {
    try {
      if (!messageId) return;

      const message = await Message.findById(messageId)
        .select("_id conversationId createdAt")
        .lean();

      if (!message) return;

      const conversation = await Conversation.findOne({
        _id: message.conversationId,
        "participants.userId": socket.user._id,
        isActive: true,
      }).select("participants");

      if (!conversation) return;

      const participant = conversation.participants.find((p) =>
        p.userId?.equals(socket.user._id)
      );

      if (!participant) return;

      if (!shouldAdvanceReceiptPointer(participant.lastReadAt, message.createdAt)) {
        return;
      }

      participant.lastReadAt = message.createdAt;
      participant.unreadCount = 0;

      await conversation.save();

      emitConversationEvent.messageSeenUpdated({
        io,
        conversationId: String(message.conversationId),
        userId: String(socket.user._id),
        lastReadAt: message.createdAt,
        participants: conversation.participants,
      });
    } catch (error) {
      console.error("Error updating read pointer:", error);
    }
  };

  // Register events
  socket.on("message:mark_delivered", handleMarkDelivered);
  socket.on("message:mark_seen", handleMarkSeen);

  handleDeliverySync();
};

module.exports = { registerMessageHandlers };
