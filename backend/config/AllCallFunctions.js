// 🟢 Listen for call request from client

exports.listenMakeCallSignleAndSendIncommingCallNotification = (
  receiverId,
  offer,
  mode,
  socket,
  io,
  userSocketMap,
  userId
) => {
  const receiverSocketId = userSocketMap.get(receiverId);
  console.log("all users", receiverId, userSocketMap);
  if (receiverSocketId) {
    io.to(receiverSocketId).emit("call-user", {
      from: userId,
      offer,
      mode,
    });
    console.log(`Call emitted to user ${receiverId}`);
  } else {
    console.log("Receiver is offline");
    socket.emit("user-offline", receiverId);
  }
};

//Accept call

exports.acceptCall = (io, callerId, answer, userSocketMap) => {
  const callerSocketId = userSocketMap.get(callerId);
  if (callerSocketId) {
    console.log("call accepted", answer);
    // to(callerSocketId)
    io.to(callerSocketId).emit("accept-call", { answer });
  }
};

//
exports.iceCandidate = (io, toUserId, candidate, userSocketMap, userId) => {
  const targetSocket = userSocketMap.get(toUserId);
  if (targetSocket) {
    io.to(targetSocket).emit("ice-candidate", { candidate });
  }
};

exports.listenEndCall = (socket, io, toId, meId, userSocketMap) => {
  toReceiver = userSocketMap.get(toId);
  toCaller = userSocketMap.get(meId);
  console.log(`Ending call. Notify user: ${toId}->${toCaller}`);
  // Emit to the both participant to close the call UI and media
  io.to(userSocketMap.get(toId)).emit("call-end", { from: meId });
  io.to(userSocketMap.get(meId)).emit("call-end", { from: toId });
};
