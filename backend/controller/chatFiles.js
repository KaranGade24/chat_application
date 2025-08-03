const { uploadFileToCloudinary } = require("../handler/clodinary");
const Message = require("../model/Messages");
const User = require("../model/User");

exports.uploadFile = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).send("No files uploaded");
    }

    const { receiverId, senderId } = req.body;
    if (!senderId || !receiverId)
      return res.status(400).send("Invalid request");

    const uploadedResults = await Promise.all(
      req.files.map((file) => uploadFileToCloudinary(file))
    );
    console.log({ uploadedResults });
    const sender = await User.findById(senderId);
    const receiver = await User.findById(receiverId);
    if (!sender || !receiver) {
      return res.status(404).send("Sender or receiver not found");
    }

    const newMessage = new Message({
      sender: senderId,
      receiver: receiverId,
      message: "", // if text is also being sent
      attachments: uploadedResults,
      seen: "not-delivered", // default status if needed
    });

    await newMessage.save();

    res.status(201).json(newMessage);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};
