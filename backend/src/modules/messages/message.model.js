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

    // Idempotency key do client tạo. Dùng để retry/dedupe khi gửi tin nhắn.
    // Không đặt unique ở field-level để tránh unique "global"; sẽ dùng compound unique index bên dưới.
    clientMessageId: {
      type: String,
      default: null,
      trim: true,
    },

    content: {
      type: String,
      trim: true,
      maxLength: 2000,
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

// Idempotency: cùng 1 sender trong 1 conversation không được có 2 message cùng clientMessageId
messageSchema.index(
  { conversationId: 1, senderId: 1, clientMessageId: 1 },
  {
    unique: true,
    partialFilterExpression: { clientMessageId: { $exists: true, $ne: null } },
  }
);

const Message = mongoose.model("Message", messageSchema);
module.exports = Message;
