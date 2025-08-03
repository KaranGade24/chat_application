// store/CallerContext/CallerContextProvider.js
import React, { useState, useEffect, useRef, useContext } from "react";
import CallerContext from "./CallerContext";
import Socket from "../../../config/Socket";
import MessageContext from "../Messages/MessageContext";
import { endCall } from "../../pages/CallVideoPage/AllCallFunctions";

const CallerContextProvider = ({ children }) => {
  const { setUserStatuses, users: friendList } = useContext(MessageContext);
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
  const [targetUserId, setTargetUserId] = useState(null);
  const [activeUser, setActiveUser] = useState(null);
  const [mode, setMode] = useState(null); // "voice" or "video"
  // const socket = Socket(isCurrectUser);
  const peerConnectionRef = useRef(null);
  const pendingCandidatesRef = useRef([]);
  var socket = Socket(isCurrectUser);
  const callRef = useRef(null);

  useEffect(() => {
    const sock = Socket(isCurrectUser);
    setStoreSocket(sock);
    // return () => sock.disconnect();
  }, [isCurrectUser]);

  useEffect(() => {
    const socketInstance = Socket(isCurrectUser);
    if (!socketInstance) return;

    setStoreSocket(socketInstance);

    // 1️⃣ Incoming call handler
    socketInstance.on("call-user", ({ from, offer, mode }) => {
      setIncomingCall({ callerId: from, offer, mode });
      setTargetUserId(from);
      callRef.current = "incomingCall";
      setMode(mode);
      setIncomingCall({ callerId: from, offer, mode });
    });

    // 2️⃣ Call accepted by receiver → set remote description
    socketInstance.on("accept-call", async ({ answer }) => {
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.setRemoteDescription(
          new RTCSessionDescription(answer)
        );
        callRef.current = "callAccepted";
        // setMode()
      } else {
        console.warn("❌ peerConnectionRef.current is null");
      }
    });

    // 3️⃣ ICE Candidate received
    socketInstance.on("ice-candidate", async ({ candidate }) => {
      const pc = peerConnectionRef.current;
      const iceCandidate = new RTCIceCandidate(candidate);

      if (!pc || pc.signalingState === "closed") {
        console.warn(
          "🚫 Skipping ICE candidate — peerConnection is null or closed."
        );
        return;
      }

      if (!pc.remoteDescription || !pc.remoteDescription.type) {
        // Queue the ICE until description is ready
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

      localStream?.getTracks().forEach((track) => track.stop());
      peerConnection?.close();

      // Reset
      setLocalStream(null);
      setRemoteStream(null);
      setPeerConnection(null);
      peerConnectionRef.current = null;
      pendingCandidatesRef.current = [];

      setInCall(false);
      // setIncomingCall(null);
      setCaller(null);
      setCallee(null);
      setCallType(null);
      setMode(null);
      setActiveUser(null);
      callRef.current = "callEnded";
      setTimeout(() => {
        alert("📞 Call ended.");
      }, 1000);
    });

    // 🔁 Clean up listeners
    return () => {
      socketInstance.off("call-user");
      socketInstance.off("accept-call");
      socketInstance.off("ice-candidate");
      socketInstance.off("call-end");
    };
  }, [isCurrectUser]);

  useEffect(() => {
    if (!storeSocket) return;

    storeSocket.emit("check-user-online", friendList, (statusList) => {
      setUserStatuses(statusList);
    });

    return () => {
      storeSocket.off("check-user-online");
    };
  }, [friendList, storeSocket]);

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
        setTargetUserId,
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
