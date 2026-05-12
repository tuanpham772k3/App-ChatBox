const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },

    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    content: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: null,
    },

    type: {
      type: String,
      enum: ["text", "image", "file", "emoji"],
      required: true,
    },

    // Thông tin file (nếu là tin nhắn file/image)
    file: {
      url: { type: String }, // URL file trên Cloudinary
      public_id: { type: String }, // ID để xóa/replace file trên Cloudinary
      filename: { type: String }, // Tên file gốc
      mimeType: { type: String },
      size: { type: Number }, // Kích thước file (bytes)
    },

    // Thông tin reply (trả lời tin nhắn khác)
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    }, // Tin nhắn được trả lời

    // Thông tin forward (chuyển tiếp tin nhắn)
    forwardedFrom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    }, // Người gửi tin nhắn gốc (nếu là tin nhắn chuyển tiếp)

    // Tin nhắn đã bị xóa
    isDeleted: {
      type: Boolean,
      default: false,
    }, // Soft delete

    // Tin nhắn đã bị chỉnh sửa
    isEdited: {
      type: Boolean,
      default: false,
    },
    editedAt: {
      type: Date,
      default: null,
    }, // Thời gian chỉnh sửa

    // Trạng thái tin nhắn
    status: {
      type: String,
      enum: ["sent", "delivered"],
      default: "sent",
    }, // Trạng thái: đã gửi, đã giao
  },
  { timestamps: true } // Tự động thêm createdAt và updatedAt
);

// Index để tối ưu truy vấn
messageSchema.index({ conversationId: 1, createdAt: -1 }); // Tìm tin nhắn theo conversation, sắp xếp theo thời gian
messageSchema.index({ senderId: 1 }); // Tìm tin nhắn theo người gửi
messageSchema.index({ status: 1 }); // Tìm tin nhắn theo trạng thái

const Message = mongoose.model("Message", messageSchema);
module.exports = Message;
