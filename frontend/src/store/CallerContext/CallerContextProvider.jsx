// store/CallerContext/CallerContextProvider.js
import React, { useState, useEffect, useRef } from "react";
import CallerContext from "./CallerContext";
import Socket from "../../../config/Socket";

const CallerContextProvider = ({ children }) => {
  const [inCall, setInCall] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [peerConnection, setPeerConnection] = useState(null);
  const [caller, setCaller] = useState(null);
  const [callee, setCallee] = useState(null);
  const [callType, setCallType] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const [isCurrectUser, serIsCurrectUser] = useState(null);
  const [storeSocket, setStoreSocket] = useState(null);
  const [targetUserId, SetTargetUserId] = useState(null);
  const [activeUser, setActiveUser] = useState(null);
  const [mode, setMode] = useState(null); // "call" or "video"
  // const socket = Socket(isCurrectUser);
  const peerConnectionRef = useRef(null);
  const pendingCandidatesRef = useRef([]);
  var socket = Socket(isCurrectUser);
  const callRef = useRef(null);

  useEffect(() => {
    const socketInstance = Socket(isCurrectUser);
    if (!socketInstance) return;

    setStoreSocket(socketInstance);

    // 1️⃣ Incoming call handler
    socketInstance.on("call-user", ({ from, offer, mode }) => {
      setIncomingCall({ callerId: from, offer, mode });
      SetTargetUserId(from);
      callRef.current = "incomingCall";
    });

    // 2️⃣ Call accepted by receiver → set remote description
    socketInstance.on("accept-call", async ({ answer }) => {
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.setRemoteDescription(
          new RTCSessionDescription(answer)
        );
        callRef.current = "callAccepted";
      } else {
        console.warn("❌ peerConnectionRef.current is null");
      }
    });

    // 3️⃣ ICE Candidate received
    socketInstance.on("ice-candidate", async ({ candidate }) => {
      const pc = peerConnectionRef.current;
      const iceCandidate = new RTCIceCandidate(candidate);
      if (!pc || !pc.remoteDescription?.type) {
        pendingCandidatesRef.current.push(iceCandidate);
      } else {
        try {
          await pc.addIceCandidate(iceCandidate);
        } catch (err) {
          console.error("❌ ICE candidate error:", err);
        }
      }
    });

    // 4️⃣ Call Ended
    socketInstance.on("call-end", ({ to, me }) => {
      const isReceiver = isCurrectUser?._id !== to;
      if (!isReceiver) return;

      console.log("📞 Call ended by other user", me);

      localStream?.getTracks().forEach((track) => track.stop());
      peerConnection?.close();

      // Reset
      setLocalStream(null);
      setRemoteStream(null);
      setPeerConnection(null);
      peerConnectionRef.current = null;
      pendingCandidatesRef.current = [];

      setInCall(false);
      setIncomingCall(null);
      setCaller(null);
      setCallee(null);
      setCallType(null);
      setMode(null);
      setActiveUser(null);
      callRef.current = "callEnded";

      alert("📞 Call was ended by the other user.");
    });

    // 🔁 Clean up listeners
    return () => {
      socketInstance.off("call-user");
      socketInstance.off("accept-call");
      socketInstance.off("ice-candidate");
      socketInstance.off("call-end");
    };
  }, [isCurrectUser]);

  return (
    <CallerContext.Provider
      value={{
        inCall,
        setInCall,
        localStream,
        setLocalStream,
        remoteStream,
        setRemoteStream,
        peerConnection,
        setPeerConnection,
        caller,
        setCaller,
        callee,
        setCallee,
        callType,
        setCallType,
        incomingCall,
        setIncomingCall,
        isCurrectUser,
        serIsCurrectUser,
        storeSocket,
        setStoreSocket,
        targetUserId,
        SetTargetUserId,
        activeUser,
        setActiveUser,
        mode,
        setMode,
        peerConnectionRef,
        pendingCandidatesRef,
        callRef,
      }}
    >
      {children}
    </CallerContext.Provider>
  );
};

export default CallerContextProvider;
