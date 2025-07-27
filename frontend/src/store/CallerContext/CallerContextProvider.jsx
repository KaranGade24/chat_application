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
  const [isIncommingCall, setIsIncommingCall] = useState(null);
  const [isCurrectUser, serIsCurrectUser] = useState(null);
  const [storeSocket, setStoreSocket] = useState(null);
  const [targetUserId, SetTargetUserId] = useState(null);
  const [activeUser, setActiveUser] = useState(null);
  const [mode, setMode] = useState(null); // "call" or "video"
  const socket = Socket(isCurrectUser);
  const peerConnectionRef = useRef(null);

  useEffect(() => {
    const socket = Socket(isCurrectUser);

    if (!socket) return;

    setStoreSocket(socket);

    socket.on("call-user", async ({ from, offer, mode }) => {
      setIsIncommingCall({ callerId: from, offer, mode });
      SetTargetUserId(from);
    });

    socket.on("call-end", ({ from }) => {
      console.log("Call was ended by:", from);

      // Stop media and clean up
      localStream?.getTracks().forEach((track) => track.stop());
      peerConnection?.close();

      // Reset context
      setLocalStream(null);
      setRemoteStream(null);
      setPeerConnection(null);
      setInCall(false);
      setIsIncommingCall(null);
      setCaller(null);
      setCallee(null);
      setCallType(null);
      setMode(null);
      setActiveUser(null);
      alert("Call was endded");
    });

    //listen Accept call
    socket.on("accept-call", async ({ answer }) => {
      if (peerConnection) {
        await peerConnection.setRemoteDescription(
          new RTCSessionDescription(answer)
        );
      }
    });

    // listen ice-candidate

    socket.on("ice-candidate", async ({ fromUserId, candidate }) => {
      const pc = peerConnectionRef.current;
      if (pc && candidate) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.error("Failed to add ICE candidate:", err);
        }
      }
    });

    return () => {
      socket.off("call-user");
      socket.off("call-end");
      socket.off("accept-call");
      socket.off("ice-candidate");
    };
  }, [socket]);

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
        isIncommingCall,
        setIsIncommingCall,
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
      }}
    >
      {children}
    </CallerContext.Provider>
  );
};

export default CallerContextProvider;
