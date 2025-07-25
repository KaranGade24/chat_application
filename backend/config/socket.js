const Message = require("../model/Messages");
const User = require("../model/User");

exports.socketfuntion = (io) => {
  const userSocketMap = new Map();

  io.on("connection", async (socket) => {
    const { userId } = socket.handshake.query;
    console.log("✅ Connected:", userId, socket.id);

    if (userId) {
      userSocketMap.set(userId, socket.id);
      await User.findByIdAndUpdate(userId, { isOnline: true });
    }

    // 💬 Receive a new message
    socket.on("send-message", async ({ sender, receiver, message }) => {
      console.log({ sender, receiver, message });
      if (!sender || !receiver || !message) return;

      const newMessage = await Message.create({
        sender,
        receiver,
        message,
      });

      // const senderSocketId = userSocketMap.get(sender);
      const receiverSocketId = userSocketMap.get(receiver);

      // const frontendMessageForSender = { from: "me", text: message };
      const frontendMessageForReceiver = message;

      if (receiverSocketId) {
        io.to(receiverSocketId).emit("receive-message", {
          userId: sender,
          message: frontendMessageForReceiver,
        });
      }

      // if (senderSocketId) {
      //   io.to(senderSocketId).emit("message-sent", {
      //     userId: receiver,
      //     message: frontendMessageForSender,
      //   });
      // }
    });

    // 📴 Handle disconnect
    socket.on("disconnect", async () => {
      console.log("❌ Disconnected:", socket.id);

      for (let [uid, sid] of userSocketMap.entries()) {
        if (sid === socket.id) {
          await User.findByIdAndUpdate(uid, { isOnline: false });
          userSocketMap.delete(uid);
          break;
        }
      }
    });
  });
};
