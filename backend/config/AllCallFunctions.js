// 🟢 Listen for call request from client

exports.listenMakeCallSignleAndSendIncommingCallNotification = (
  socket,
  io,
  userSocketMap,
  userId
) => {
  socket.on("make-call", ({ receiverId, offer, mode }) => {
    const receiverSocketId = userSocketMap.get(receiverId);
    console.log("all users", receiverId, userSocketMap);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("call-user", {
        from: userId,
        offer,
        mode, // "audio" or "video"
      });
      console.log(`Call emitted to user ${receiverId}`);
    } else {
      console.log("Receiver is offline");
      socket.emit("user-offline", receiverId);
    }
  });
};

//Accept call

exports.acceptCall = (io, callerId, answer, userSocketMap) => {
  const callerSocketId = userSocketMap.get(callerId);
  if (callerSocketId) {
    io.to(callerSocketId).emit("accept-call", { answer });
  }
};

//
exports.iceCandidate = (io, toUserId, candidate, userSocketMap, userId) => {
  const targetSocket = userSocketMap.get(toUserId);
  if (targetSocket) {
    io.to(targetSocket).emit("ice-candidate", {
      fromUserId: userId,
      candidate,
    });
  }
};

exports.listenEndCall = (socket, io, toId, userSocketMap) => {
  toCaller = userSocketMap.get(toId);
  console.log(`Ending call. Notify user: ${toId}->${toCaller}`);
  // Emit to the other participant to close the call UI and media
  io.to(toCaller).emit("call-end", { from: socket.id });
};
