export const makeCallRequest = async (
  mode,
  receiverId,
  socket,
  {
    setLocalStream,
    setPeerConnection,
    setInCall,
    setCallee,
    setCallType,
    peerConnectionRef,
  }
) => {
  try {
    console.log("Calling user ID:", receiverId);

    // 1. Get local media stream
    const localStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: mode === "video-call",
    });

    // 2. Create peer connection
    const peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", {
          toUserId: receiverId,
          candidate: event.candidate,
        });
      }
    };

    // 3. Add tracks to peer connection
    localStream.getTracks().forEach((track) => {
      peerConnection.addTrack(track, localStream);
    });

    // 4. Create and set local offer
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    // 5. Emit socket event to receiver
    socket.emit("make-call", {
      receiverId,
      mode,
      offer,
    });

    // 6. Update context states
    setLocalStream(localStream);
    setPeerConnection(peerConnection);
    peerConnectionRef.current = pc;
    setCallee(receiverId);
    setCallType(mode);
    setInCall(true);

    return { localStream, peerConnection };
  } catch (error) {
    console.error("Error making call:", error);
    alert("Could not start the call. Please check permissions.");
  }
};

//After accepting call

export const acceptCallRequest = async (
  { mode, callerId, offer }, // incoming call data
  socket,
  {
    setLocalStream,
    setRemoteStream,
    setPeerConnection,
    setInCall,
    setCaller,
    setCallType,
    peerConnectionRef,
    setIsIncomingCall,
  }
) => {
  try {
    console.log("Accepting call from:", callerId);

    // 1. Get local media stream
    const localStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: mode === "video-call",
    });

    // 2. Create peer connection
    const peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", {
          toUserId: callerId,
          candidate: event.candidate,
        });
      }
    };

    // 3. Add local tracks to peer connection
    localStream.getTracks().forEach((track) => {
      peerConnection.addTrack(track, localStream);
    });

    // 4. Listen for remote stream
    const remoteStream = new MediaStream();
    peerConnection.addEventListener("track", (event) => {
      remoteStream.addTrack(event.track);
    });

    // 5. Set remote offer from caller
    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

    // 6. Create and send answer
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);

    socket.emit("accept-call", {
      callerId,
      answer,
    });

    // 7. Store everything in state/context
    setLocalStream(localStream);
    setRemoteStream(remoteStream);
    setPeerConnection(peerConnection);
    peerConnectionRef.current = pc;
    setCaller(callerId);
    setCallType(mode);
    setIsIncomingCall(null);
    setInCall(true);
  } catch (error) {
    console.error("Error accepting call:", error);
    alert("Could not accept the call. Check your mic/cam permissions.");
  }
};

// handle end call

export const endCall = ({
  localStream,
  peerConnection,
  setInCall,
  setLocalStream,
  setPeerConnection,
  setCallee,
  setCallType,
  setIsIncommingCall,
  targetUserId,
  storeSocket: socket,
  setActiveUser,
  setMode,
}) => {
  if (localStream) {
    localStream.getTracks().forEach((track) => track.stop());
  }
  if (peerConnection) {
    peerConnection.close();
  }

  // 🔴 Emit event to tell the other user that the call ended
  console.log("Ending call to", targetUserId);
  if (socket && targetUserId) {
    socket.emit("call-end", { to: targetUserId });
  }

  setInCall(false);
  setLocalStream(null);
  setPeerConnection(null);
  setCallee(null);
  setCallType(null);
  setIsIncommingCall(null);
  setActiveUser(null);
  setMode(null);
};
