const mongoose = require("mongoose");

const relationshipSchema = new mongoose.Schema(
  {
    requesterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    blockedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    status: {
      type: String,
      enum: [
        "pending", // lời mời chưa chấp nhận
        "accepted", // bạn bè
        "blocked", // đã chặn
      ],
      default: null,
    },
  },
  { timestamps: true }
);

relationshipSchema.index({ requesterId: 1, recipientId: 1 }, { unique: true });

const Relationship = mongoose.model("Relationship", relationshipSchema);
module.exports = Relationship;
