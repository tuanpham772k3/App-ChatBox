const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["private", "group"],
      required: true,
    },

    participants: [
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
        }, // Mốc thời gian người dùng tham gia cuộc trò chuyện
        clearedMessagesHistoryAt: {
          type: Date,
          default: null,
        }, // Mốc thời gian xóa lịch sử trò chuyện của người dùng (để soft delete)
        deletedAt: {
          type: Date,
          default: null,
        }, // Mốc thời gian người dùng xóa cuộc trò chuyện (soft delete)
        lastReadMessageId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Message",
          default: null,
        }, // tin nhắn cuối mà người dùng đã đọc
        lastReadAt: { type: Date, default: null }, // mốc thời gian đã đọc tin nhắn cuối
        unreadCount: { type: Number, default: 0, min: 0 },
        pinnedAt: {
          type: Date,
          default: null,
        }, // mốc thời gian ghim hội thoại (null = chưa ghim)
      },
    ],

    name: { type: String, default: null }, // only group

    avatar: {
      url: { type: String },
      public_id: { type: String, default: null }, // ID để xóa/replace ảnh trên Cloudinary
    },

    lastMessage: {
      messageId: { type: mongoose.Schema.Types.ObjectId, ref: "Message", default: null },
      senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
      type: { type: String, default: null },
      content: { type: String, default: null },
      file: { type: Object, default: null },
      isDeleted: { type: Boolean, default: false },
      createdAt: { type: Date, default: null },
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
  "participants.deletedAt": 1,
  isActive: 1,
  "lastMessage.createdAt": -1,
  updatedAt: -1,
});

const Conversation = mongoose.model("Conversation", conversationSchema);
module.exports = Conversation;
