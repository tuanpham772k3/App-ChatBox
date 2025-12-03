import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    }, // Tham chiếu đến conversation chứa tin nhăn này

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }, // Tham chiếu đến người gửi tin nhắn

    content: {
      type: String,
      required: true,
      maxlength: 2000, // Giới hạn độ dài tin nhắn
    }, // Nội dung tin nhắn

    type: {
      type: String,
      enum: ["text", "image", "file", "emoji"],
      default: "text",
    }, // Loại tin nhắn: text, image, file, emoji

    // Thông tin file (nếu là tin nhắn file/image)
    file: {
      url: {
        type: String,
        default: null,
      }, // URL file trên Cloudinary
      public_id: {
        type: String,
        default: null,
      }, // ID để xóa/replace file trên Cloudinary
      filename: {
        type: String,
        default: null,
      }, // Tên file gốc
      size: {
        type: Number,
        default: null,
      }, // Kích thước file (bytes)
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

    // Trạng thái tin nhắn
    status: {
      type: String,
      enum: ["sent", "delivered", "read"],
      default: "sent",
    }, // Trạng thái: đã gửi, đã giao, đã đọc

    // Thông tin đọc tin nhắn
    readBy: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        }, // Người đã đọc
        readAt: {
          type: Date,
          default: Date.now,
        }, // Thời gian đọc
      },
    ],

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
  },
  { timestamps: true } // Tự động thêm createdAt và updatedAt
);

// Index để tối ưu truy vấn
messageSchema.index({ conversation: 1, createdAt: -1 }); // Tìm tin nhắn theo conversation, sắp xếp theo thời gian
messageSchema.index({ sender: 1 }); // Tìm tin nhắn theo người gửi
messageSchema.index({ status: 1 }); // Tìm tin nhắn theo trạng thái

// Middleware: Cập nhật lastMessage trong conversation khi có tin nhắn mới
messageSchema.post("save", async function (doc) {
  try {
    const Conversation = mongoose.model("Conversation");

    // Cập nhật lastMessage trong conversation
    await Conversation.findByIdAndUpdate(doc.conversation, {
      lastMessage: {
        sender: doc.sender,
        content: doc.content,
        createdAt: doc.createdAt,
      },
    });
  } catch (error) {
    console.error("Error updating conversation lastMessage:", error);
  }
});

// Middleware: Xóa lastMessage trong conversation khi tin nhắn cuối bị xóa
messageSchema.post("remove", async function (doc) {
  try {
    if (doc && doc.isDeleted) {
      const Conversation = mongoose.model("Conversation");

      //Tìm tin nhắn cuối cùng còn lại trong conversation
      const lastMessage = await mongoose
        .model("Message")
        .findOne({
          conversation: doc.conversation,
          isDeleted: false,
        })
        .sort({ createdAt: -1 });

      //Cập nhật lastMessage
      await Conversation.findByIdAndUpdate(doc.conversation, {
        lastMessage: lastMessage
          ? {
              sender: lastMessage.sender,
              content: lastMessage.content,
              createdAt: lastMessage.createdAt,
            }
          : { sender: null, content: null, createdAt: null },
      });
    }
  } catch (error) {
    console.error("Error updating conversation lastMessage after delete:", error);
  }
});

const Message = mongoose.model("Message", messageSchema);
export default Message;
