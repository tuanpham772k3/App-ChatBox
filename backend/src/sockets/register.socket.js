const Conversation = require("../modules/conversations/conversation.model.js");
const Message = require("../modules/messages/message.model.js");
const { authSocket } = require("./auth.socket.js");
const { messageSocket } = require("./message.socket.js");
const { conversationSocket } = require("./conversation.socket.js");
const { broadcastPresence } = require("./presence.socket.js");
const { emitConversationDelivered } = require("./realtime.emitter.js");

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

const syncDeliveredPointersOnReconnect = async (io, socket) => {
  const conversations = await Conversation.find({
    "participants.userId": socket.userId,
    isActive: true,
  })
    .select("participants")
    .lean();

  await Promise.all(
    conversations.map(async (conversation) => {
      const participant = conversation.participants.find(
        (p) => String(p.userId) === String(socket.userId)
      );

      if (!participant) return;

      const latestUndeliveredMessage = await Message.findOne(
        buildPendingDeliveredQuery({
          conversationId: conversation._id,
          participant,
          userId: socket.userId,
        })
      )
        .select("createdAt")
        .sort({ createdAt: -1, _id: -1 })
        .lean();

      if (!latestUndeliveredMessage) return;

      const updatedConversation = await Conversation.findOneAndUpdate(
        {
          _id: conversation._id,
          "participants.userId": socket.userId,
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

      emitConversationDelivered({
        io,
        conversationId: String(conversation._id),
        userId: String(socket.userId),
        lastDeliveredAt: latestUndeliveredMessage.createdAt,
        participants: updatedConversation.participants,
      });
    })
  );
};

const registerSocket = (io) => {
  // Auth middleware
  authSocket(io);

  // Xử lý connection
  io.on("connection", async (socket) => {
    try {
      console.log(`User connected: ${socket.user.username} (${socket.id})`);

      // Join room user_{userId}
      socket.join(`user_${socket.userId}`);

      socket.on("delivery_sync", async () => {
        try {
          await syncDeliveredPointersOnReconnect(io, socket);
        } catch (err) {
          console.error("Delivery sync error:", err);
        }
      });

      try {
        await broadcastPresence(io, socket.userId, "online");
      } catch (err) {
        console.error("Broadcast online error:", err);
      }

      // Xử lý disconnect
      socket.on("disconnect", async () => {
        try {
          console.log(`User disconnected: ${socket.user?.username} (${socket.id})`);

          const userRoom = io.sockets.adapter.rooms.get(`user_${socket.userId}`);
          const hasAnotherActiveSession = Boolean(userRoom && userRoom.size > 0);

          if (hasAnotherActiveSession) return;

          await broadcastPresence(io, socket.userId, "offline");
        } catch (err) {
          console.error("disconnect handler error:", {
            userId: socket.userId,
            error: err,
          });
        }
      });

      // Đăng ký socket handlers
      messageSocket(io, socket);
      conversationSocket(io, socket);
    } catch (err) {
      console.error("Error in socket connection handler:", err);
      socket.disconnect(true);
    }
  });
};

module.exports = { registerSocket };
