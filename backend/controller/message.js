// controllers/messageController.js
const Message = require("../model/Messages");

exports.getMessagesBetweenUsers = async (req, res) => {
  console.log("in message");
  try {
    const { senderId, receiverId } = req.query;
    console.log({ senderId, receiverId });
    if (!senderId || !receiverId) {
      return res
        .status(400)
        .json({ error: "Sender and Receiver IDs are required" });
    }

    const messages = await Message.find({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId },
      ],
    }).sort({ createdAt: 1 }); // Sort by time ascending
    console.log({ messages });
    res.status(200).json(messages);
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
