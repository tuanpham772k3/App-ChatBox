import mongoose from "mongoose";

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

        lastReadMessage: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Message",
          default: null,
        }, // tin nhắn cuối mà người dùng đã đọc

        lastReadAt: {
          type: Date,
          default: null,
        }, // mốc thời gian đã đọc tin nhắn cuối

        unreadCount: { type: Number, default: 0 }, // số lượng tin nhắn chưa đọc
      },
    ], // Danh sách người tham gia cuộc trò chuyện (tối thiểu 2 người)

    name: {
      type: String,
      default: null,
    }, // Tên nhóm (chỉ dùng cho group chat, null với private chat)

    avatar: {
      url: {
        type: String,
        default: null,
      }, // URL ảnh đại diện nhóm
      public_id: {
        type: String,
        default: null,
      }, // ID để xóa/replace ảnh trên Cloudinary
    }, // Ảnh đại diện nhóm (chỉ dùng cho group chat)

    lastMessage: {
      _id: { type: mongoose.Schema.Types.ObjectId, ref: "Message", default: null },
      sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
      type: { type: String, default: null },
      content: { type: String, default: null },
      file: { type: Object, default: null },
      isDeleted: { type: Boolean, default: false },
      createdAt: { type: Date, default: null }, // Thời gian gửi tin nhắn cuối cùng
    }, // Thông tin tin nhắn cuối cùng để hiển thị preview

    // Trạng thái cuộc trò chuyện
    isActive: {
      type: Boolean,
      default: true,
    }, // Cuộc trò chuyện có đang hoạt động không (để soft delete)

    // Thông tin quản lý nhóm (chỉ áp dụng cho group)
    admin: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ], // Danh sách admin của nhóm
  },
  { timestamps: true } // Tự động thêm createdAt và updatedAt
);

// Index để tối ưu truy vấn
conversationSchema.index({ participants: 1 }); // Tìm cuộc trò chuyện theo người tham gia
conversationSchema.index({ type: 1 }); // Tìm theo loại cuộc trò chuyện
conversationSchema.index({ "lastMessage.createdAt": -1 }); // Sắp xếp theo tin nhắn cuối

const Conversation = mongoose.model("Conversation", conversationSchema);
export default Conversation;
