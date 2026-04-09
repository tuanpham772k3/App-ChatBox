const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["private", "group"],
      required: true,
    }, // Loại cuộc trò chuyện: private (1-1) hoặc group (nhiều người)

    participants: [
      {
        user: {
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
        lastReadMessage: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Message",
        }, // tin nhắn cuối mà người dùng đã đọc
        lastReadAt: { type: Date }, // mốc thời gian đã đọc tin nhắn cuối
        unreadCount: { type: Number, default: 0 }, // số lượng tin nhắn chưa đọc
      },
    ], // Danh sách người tham gia cuộc trò chuyện (tối thiểu 2 người)

    name: { type: String }, // Tên nhóm (chỉ dùng cho group chat)

    avatar: {
      url: { type: String }, // URL ảnh đại diện nhóm
      public_id: { type: String }, // ID để xóa/replace ảnh trên Cloudinary
    }, // Ảnh đại diện nhóm (chỉ dùng cho group chat)

    lastMessage: {
      _id: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
      sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      type: { type: String },
      content: { type: String },
      file: { type: Object },
      isDeleted: { type: Boolean, default: false },
      createdAt: { type: Date }, // Thời gian gửi tin nhắn cuối cùng
    }, // Thông tin tin nhắn cuối cùng để hiển thị preview

    // Trạng thái cuộc trò chuyện
    isActive: {
      type: Boolean,
      default: true,
    }, // Cuộc trò chuyện có đang hoạt động không (để soft delete)
  },
  { timestamps: true } // Tự động thêm createdAt và updatedAt
);

// Index để tối ưu truy vấn
conversationSchema.index({ "participants.user": 1 }); // Tìm cuộc trò chuyện theo người tham gia
conversationSchema.index({ type: 1 }); // Tìm theo loại cuộc trò chuyện
conversationSchema.index({ "lastMessage.createdAt": -1 }); // Sắp xếp theo tin nhắn cuối

const Conversation = mongoose.model("Conversation", conversationSchema);
module.exports = Conversation;
