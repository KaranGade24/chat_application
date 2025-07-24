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
      enum: ["text", "image", "video", "file", "audio"],
      default: "text",
    },
    attachments: [
      {
        url: String,
        filename: String,
      },
    ],
    seen: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
