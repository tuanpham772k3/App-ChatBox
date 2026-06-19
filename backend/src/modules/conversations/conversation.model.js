const mongoose = require("mongoose");

const participantSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      enum: ["owner", "admin", "member"],
      default: "member",
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
    clearedMessagesHistoryAt: {
      type: Date,
      default: null,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    lastReadAt: {
      type: Date,
      default: null,
    },
    lastDeliveredAt: {
      type: Date,
      default: null,
    },
    unreadCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    pinnedAt: {
      type: Date,
      default: null,
    },
  },
  { _id: false }
);

const avatarSchema = new mongoose.Schema(
  {
    url: String,

    publicId: {
      type: String,
      default: null,
    },
  },
  { _id: false }
);

const lastMessageSchema = new mongoose.Schema(
  {
    messageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    type: {
      type: String,
      default: null,
    },
    content: {
      type: String,
      default: null,
    },
    file: {
      type: Object,
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: null,
    },
  },
  { _id: false }
);

const conversationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["private", "group"],
      required: true,
    },
    participants: [participantSchema],
    name: {
      type: String,
      default: null,
    }, // only group
    avatar: {
      type: avatarSchema,
      default: () => ({}),
    },
    lastMessage: {
      type: lastMessageSchema,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

conversationSchema.index({
  "participants.userId": 1,
  isActive: 1,
  "lastMessage.createdAt": -1,
  "participants.deletedAt": 1,
  updatedAt: -1,
});

const Conversation = mongoose.model("Conversation", conversationSchema);
module.exports = Conversation;
