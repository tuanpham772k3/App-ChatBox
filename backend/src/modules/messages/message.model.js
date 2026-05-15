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
      filename: { type: String },
      mimeType: { type: String },
      size: { type: Number },
    },

    // Thông tin reply (trả lời tin nhắn khác) // Tin nhắn được trả lời
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },

    // Thông tin forward (chuyển tiếp tin nhắn)// Người gửi tin nhắn gốc (nếu là tin nhắn chuyển tiếp)
    forwardedFrom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    }, // Soft delete

    isEdited: {
      type: Boolean,
      default: false,
    },

    editedAt: {
      type: Date,
      default: null,
    },

    status: {
      type: String,
      enum: ["sent", "delivered"],
      default: "sent",
    },
  },
  { timestamps: true }
);

messageSchema.index({ conversationId: 1, createdAt: -1 });

const Message = mongoose.model("Message", messageSchema);
module.exports = Message;
