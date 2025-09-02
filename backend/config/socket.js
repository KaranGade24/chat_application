const User = require("../model/User");
const Message = require("../model/Messages");

const userSocketMap = new Map();
exports.socketfuntion = (io) => {
  const emitAllUserStatuses = async () => {
    console.log("status event triger");
    const users = await User.find({}).select("_id lastSeen");
    const statuses = users.map((u) => ({
      _id: u._id.toString(),
      isOnline: userSocketMap.has(u._id.toString()),
      lastSeen: u.lastSeen,
    }));

    io.emit("user-statuses", statuses);
  };

  io.on("connection", async (socket) => {
    const { userId } = socket.handshake.query;
    console.log("✅ Connected:", userId, socket.id);

    if (userId) {
      userSocketMap.set(userId, socket.id);
      await User.findByIdAndUpdate(userId, { isOnline: true, lastSeen: null });
      await emitAllUserStatuses();
    }

    // 💬 Receive a new message
    socket.on("send-message", async ({ sender, receiver, message }) => {
      try {
        if (!sender || !receiver || !message) return;

        console.log("sendinmsg....", { sender, receiver, message });
        // Step 1: Check if receiver is prresent in sender's  friend list
        const existSenderUser = await User.findById(sender);
        let newUser = null;
        const existReceiverUser = await User.findById(receiver);
        if (
          !existSenderUser.friends.includes(receiver) ||
          !existReceiverUser.friends.includes(sender)
        ) {
          await User.findByIdAndUpdate(sender, {
            $addToSet: { friends: receiver },
          });

          await User.findByIdAndUpdate(receiver, {
            $addToSet: { friends: sender },
          });

          newUser = await User.findById(receiver).select(
            "name email profilePic status"
          );

          const receiveSocketId = userSocketMap.get(receiver);
          if (newUser && receiveSocketId) {
            console.log(
              "adding new user 49 socket.js",
              newUser,
              receiveSocketId
            );
            io.to(receiveSocketId).emit("add-user", newUser);
          }
        }

        // Step 2: Ensure sender is exist or not
        const senderUser = await User.findById(sender);

        if (!senderUser.friends.includes(receiver)) {
          return; // do not send message if not mutual
        }

        // Step 3: Create and save message if message only consists text msg not files
        if (!message.isFile) {
          const newMessage = await Message.create({
            sender,
            receiver,
            message: message.text,
          });
        }

        // Step 4: Emit message to receiver (if online)
        const receiverSocketId = userSocketMap.get(receiver);

        if (receiverSocketId) {
          console.log({ message });
          console.log("emitting mag");
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
        console.log({ newUser, userSocketId, userId });
        // Emit "add-user" event only to the specific user
        io.to(userSocketId).emit("new-user", newUser); // send newUser directly
      } else {
        console.log(`User with ID ${userId} not connected.`);
      }
    });

    socket.on("check-user-online", async (users, callback) => {
      try {
        const results = await Promise.all(
          users.map(async (u) => {
            if (userSocketMap.has(u._id)) {
              return { _id: u._id, isOnline: true };
            } else {
              const userData = await User.findById(u._id).select("lastSeen");
              return {
                _id: u._id,
                isOnline: false,
                lastSeen: userData?.lastSeen || null,
              };
            }
          })
        );

        callback(results);

        // Optionally emit to all clients if data changed
        io.emit("user-statuses", results);
      } catch (err) {
        console.error("Error checking user online status:", err);
        callback([]);
      }
    });

    //in backend socket.io
    // 📞 Handle incoming call
    //  Handle answer

    socket.on("call-user", ({ offer, targetUserId, callerId, mode }) => {
      console.log("call-user", { offer, targetUserId, callerId, mode });
      const userSocketId = userSocketMap.get(targetUserId);
      if (userSocketId) {
        console.log("send incoming call", { userSocketId });
        io.to(userSocketId).emit("incoming-call", {
          offer,
          callerId,
          userId: targetUserId,
          callMode: mode,
        });
      }
    });

    socket.on("call-accepted", ({ answer, to, from }) => {
      console.log("call-accepted", { answer, to, from });
      const userSocketId = userSocketMap.get(to);
      io.to(userSocketId).emit("call-answered", { answer });
    });

    socket.on("ice-candidate", ({ to, from, candidate }) => {
      const userSocketId = userSocketMap.get(to);
      io.to(userSocketId).emit("ice-candidate", { candidate });
    });

    // Listen for 'call-end' event from either caller or receiver
    socket.on("end-call", ({ to }) => {
      const userSocketId = userSocketMap.get(to);
      if (userSocketId) {
        console.log("end-call");
        io.to(userSocketId).emit("call-ended");
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
      await emitAllUserStatuses();
    });
  });
};

exports.userSocketMap = userSocketMap