import React, { useContext, useEffect, useRef, useState } from "react";
import OngoingCallComponent from "./OngoingCallComponent";
import CallerContext from "../store/CallerContext/CallerContext";
import { endCall } from "../pages/CallVideoPage/AllCallFunctions";
import MessageContext from "../store/Messages/MessageContext";

export default function CallScreenManager() {
  const {
    inCall,
    localStream,
    remoteStream,
    callee,
    mode, // "call" or "video"
    peerConnection,
    setInCall,
    setLocalStream,
    setPeerConnection,
    setCallee,
    setCallType,
    setIncomingCall,
    targetUserId,
    storeSocket,
    setActiveUser,
    setMode,
  } = useContext(CallerContext);

  const { user: currentUser } = useContext(MessageContext);
  const audioRef = useRef(null);

  // 🎧 Attach remote stream to audio element (only for audio calls)

  useEffect(() => {
   
    if (mode === "voice" && audioRef.current && remoteStream) {
      audioRef.current.srcObject = remoteStream;
    }
  }, [remoteStream, mode]);

  const handleEndCall = () => {
    endCall({
      localStream,
      peerConnection,
      setInCall,
      setLocalStream,
      setPeerConnection,
      setCallee,
      setCallType,
      setIncomingCall,
      targetUserId,
      currentUserId: currentUser._id,
      storeSocket,
      setActiveUser,
      setMode,
    });
  };

  // 🧠 Bonus: Add debugging logs to verify stream presence
  useEffect(() => {
    console.log("Local stream tracks:", localStream?.getTracks());
    console.log("Remote stream tracks:", remoteStream?.getTracks());
  }, [localStream, remoteStream]);

  return (
    <>
      {/* ✅ Always render for audio-only call or backup */}
      {mode === "voice" && remoteStream && (
        <audio ref={audioRef} autoPlay playsInline />
      )}

      {/* ✅ Show ongoing call UI for both video and voice */}
      {inCall && (
        <OngoingCallComponent
          user={callee}
          onHangUp={handleEndCall}
          callType={mode}
          localStream={localStream}
          remoteStream={remoteStream}
        />
      )}
    </>
  );
}
