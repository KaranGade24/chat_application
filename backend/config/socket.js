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
      try {
        if (!sender || !receiver || !message) return;

        // Step 1: Check if receiver has sender in their friend list
        const receiverUser = await User.findById(receiver);
        let newUser = null;

        if (!receiverUser.friends.includes(sender)) {
          await User.findByIdAndUpdate(receiver, {
            $addToSet: { friends: sender },
          });

          // Get the full sender details to send to receiver
          newUser = await User.findById(sender).select(
            "name email profilePic status"
          );

          const senderSocketId = userSocketMap.get(receiver);
          if (newUser && senderSocketId) {
            io.to(senderSocketId).emit("add-user", newUser);
          }
        }

        // Step 2: Ensure sender has receiver in THEIR friend list
        const senderUser = await User.findById(sender);

        if (!senderUser.friends.includes(receiver)) {
          return; // do not send message if not mutual
        }

        // Step 3: Create and save message
        const newMessage = await Message.create({
          sender,
          receiver,
          message,
        });

        // Step 4: Emit message to receiver (if online)
        const receiverSocketId = userSocketMap.get(receiver);

        if (receiverSocketId) {
          io.to(receiverSocketId).emit("receive-message", {
            userId: sender,
            message,
          });
        }
      } catch (error) {
        console.error("Socket send-message error:", error);
      }
    });

    socket.on("isTyping", async ({ isTyping, receiverId }) => {
      const { userId } = socket.handshake.query;
      console.log("✅ Connected:", userId, socket.id);

      if (userId) {
        userSocketMap.set(userId, socket.id);
        await User.findByIdAndUpdate(userId, { isOnline: true });
      }

      if (typeof isTyping !== "boolean" || !receiverId) return;

      const receiverSocketId = userSocketMap.get(receiverId);

      console.log(`Typing: ${isTyping} → receiver socket: ${receiverSocketId}`);

      if (receiverSocketId) {
        io.to(receiverSocketId).emit("isTyping", {
          isTyping,
          senderId: receiverId,
        });
      }
    });

    // Server: Listen for "add-user" event from client
    socket.on("add-user", ({ newUser, userId }) => {
      const userSocketId = userSocketMap.get(userId);

      if (userSocketId) {
        // Emit "add-user" event only to the specific user
        io.to(userSocketId).emit("add-user", newUser); // send newUser directly
      } else {
        console.log(`User with ID ${userId} not connected.`);
      }
    });

    // 📴 Handle disconnect
    socket.on("disconnect", async () => {
      console.log("❌ Disconnected:", socket.id);

      for (let [uid, sid] of userSocketMap.entries()) {
        if (sid === socket.id) {
          const user = await User.findByIdAndUpdate(
            uid,
            {
              isOnline: false,
              lastSeen: new Date(),
            },
            { new: true }
          );
          console.log("user after log out:", { user });
          userSocketMap.delete(uid);
          break;
        }
      }
    });
  });
};
