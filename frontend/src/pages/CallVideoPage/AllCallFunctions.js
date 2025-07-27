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
    setRemoteStream, // 🔥 Add this to fix undefined remote stream
  }
) => {
  try {
    console.log("📞 Calling user ID:", receiverId);

    // 1. Get local media stream
    const localStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: mode === "video",
    });
    // 2. Create peer connection
    const peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        {
          urls: "turn:openrelay.metered.ca:80",
          username: "openrelayproject",
          credential: "openrelayproject",
        },
      ],
    });

    // 3. ICE candidate handling
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", {
          toUserId: receiverId,
          candidate: event.candidate,
        });
      }
    };

    // 4. Add local tracks to peer connection (SEND audio/video)
    localStream.getTracks().forEach((track) => {
      peerConnection.addTrack(track, localStream);
    });

    // ✅ Correct order
    peerConnection.ontrack = (event) => {
      const inbound = new MediaStream();
      inbound.addTrack(event.track);
      setRemoteStream((prevStream) => {
        if (!prevStream) return inbound;
        prevStream.addTrack(event.track);
        return prevStream;
      });
    };

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    socket.emit("make-call", {
      receiverId,
      offer,
      mode,
    });

    // 7. Update context state
    setLocalStream(localStream);
    setPeerConnection(peerConnection);
    peerConnectionRef.current = peerConnection;
    setCallee(receiverId);
    setCallType(mode);
    setInCall(true);

    return { localStream, peerConnection };
  } catch (error) {
    console.error("🚨 getUserMedia error:", error.name, error.message);
    alert("Could not start the call. Please check mic/camera permissions.");
  }
};

//After accepting call

export const acceptCallRequest = async (
  { mode, callerId, offer },
  socket,
  {
    setLocalStream,
    setRemoteStream,
    setPeerConnection,
    setInCall,
    setCallee,
    setCallType,
    peerConnectionRef,
    setIncomingCall,
    pendingCandidatesRef,
    callRef,
  }
) => {
  try {
    console.log("✅ Accepting call from:", callerId);

    // 1. FIXED: Use consistent mode check
    const localStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: mode === "video", //mode === "video", // 🔥 FIXED here
    });

    const peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        {
          urls: "turn:openrelay.metered.ca:80",
          username: "openrelayproject",
          credential: "openrelayproject",
        },
      ],
    });

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", {
          toUserId: callerId,
          candidate: event.candidate,
        });
      }
    };

    localStream.getTracks().forEach((track) => {
      peerConnection.addTrack(track, localStream);
    });

    peerConnection.ontrack = (event) => {
      const inbound = new MediaStream();
      inbound.addTrack(event.track);
      setRemoteStream((prevStream) => {
        if (!prevStream) return inbound;
        prevStream.addTrack(event.track);
        return prevStream;
      });
    };

    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

    for (const candidate of pendingCandidatesRef.current) {
      try {
        await peerConnection.addIceCandidate(candidate);
      } catch (err) {
        console.error("Buffered ICE error:", err);
      }
    }
    pendingCandidatesRef.current = [];

    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);

    socket.emit("accept-call", {
      callerId,
      answer,
    });

    setLocalStream(localStream);
    setPeerConnection(peerConnection);
    peerConnectionRef.current = peerConnection;
    setCallee(callerId);
    setCallType(mode);
    callRef.current = "callAccepted";
    setInCall(true);
  } catch (error) {
    console.error("❌ getUserMedia error:", error.name, error.message);
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
  setIncomingCall,
  targetUserId,
  currentUserId,
  storeSocket: socket,
  setActiveUser,
  setMode,
  callRef,
}) => {
  if (localStream) {
    localStream.getTracks().forEach((track) => track.stop());
  }
  if (peerConnection) {
    peerConnection.close();
  }

  // 🔴 Emit event to tell the other user that the call ended
  if (socket && targetUserId) {
    console.log(
      "Ending call to all funtions",
      currentUserId,
      "=>",
      targetUserId
    );

    socket.emit("call-end", {
      to: targetUserId,
      me: currentUserId,
    });
  }

  setInCall(false);
  setLocalStream(null);
  setPeerConnection(null);
  setCallee(null);
  setCallType(null);
  callRef.current = "callEnded";
  setActiveUser(null);
  setMode(null);
};
