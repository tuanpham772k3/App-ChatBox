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
        }, // tin nhắn cuối mà người dùng đã đọc
        lastReadAt: { type: Date }, // mốc thời gian đã đọc tin nhắn cuối
        unreadCount: { type: Number, default: 0 },
        pinnedAt: {
          type: Date,
          default: null,
        }, // mốc thời gian ghim hội thoại (null = chưa ghim)
      },
    ], // Danh sách người tham gia cuộc trò chuyện (tối thiểu 2 người)

    name: { type: String }, // only group

    avatar: {
      url: { type: String },
      public_id: { type: String }, // ID để xóa/replace ảnh trên Cloudinary
    },

    lastMessage: {
      messageId: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
      senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      type: { type: String },
      content: { type: String },
      file: { type: Object },
      isDeleted: { type: Boolean, default: false },
      createdAt: { type: Date }, // Thời gian gửi tin nhắn cuối cùng
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Index để tối ưu truy vấn
conversationSchema.index({ "participants.userId": 1, "participants.deletedAt": 1 });
conversationSchema.index({ type: 1 });
conversationSchema.index({ "lastMessage.createdAt": -1 });

const Conversation = mongoose.model("Conversation", conversationSchema);
module.exports = Conversation;
