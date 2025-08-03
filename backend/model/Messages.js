const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      //   required: true,
      ref: "Chat", // optional: only if you're tracking chat rooms/groups
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      default: "",
    },
    type: {
      type: String,
      enum: ["text", "image", "video", "file", "audio", "pdf", "other"],
      default: "text",
    },
    attachments: [
      {
        url: { type: String },
        filename: { type: String },
        type: { type: String },
        size: { type: String },
        cloudinary_id: { type: String },
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date },
      },
    ],

    seen: {
      type: String,
      enum: ["delivered", "not-delivered", "not-seen", "seen"],
      default: "not-delivered",
    },
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
