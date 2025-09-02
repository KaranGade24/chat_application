import React, { useContext, useEffect, useRef, useState } from "react";
import CallerContext from "./CallerContext";
import MessageContext from "../Messages/MessageContext";
import Socket from "../../../config/Socket";
import { Slide, toast } from "react-toastify";

// Define a configuration for the RTCPeerConnection
const peerConnectionConfig = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

function CallerContextProvider({ children }) {
  const { user } = useContext(MessageContext);
  const socketRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const [userId, setUserId] = useState(user?._id);
  const callRef = useRef(null);
  const [callState, setCallState] = useState(null);
  const callInfo = useRef({ caller: "", callee: "" });
  const incomingCallInfo = useRef(null);
  const pendingCandidatesRef = useRef([]);
  const mode = useRef("video");
  const activeUser = useRef(null);
  const callEnded = useRef(true);
  const [remoteUserId, setRemoteUserId] = useState(null);
  const callTimeoutRef = useRef(null); // Ref for the call timeout
  const isCallingRef = useRef(false); // New ref to prevent multiple calls

  // A helper function to reset all call state
  const resetCallState = () => {
    setCallState("idle");
    callRef.current = "idle";
    callInfo.current = { caller: "", callee: "" };
    incomingCallInfo.current = null;
    pendingCandidatesRef.current = [];
    remoteStreamRef.current = null;
    localStreamRef.current = null;
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (callTimeoutRef.current) {
      clearTimeout(callTimeoutRef.current);
    }
    isCallingRef.current = false;
    callEnded.current = true;
  };

  const endCall = (timeOut = false) => {
    // Graceful cleanup of resources
    // 1. Notify the other peer if the connection is still active and we initiated the end
    if (callEnded.current && socketRef.current && remoteUserId) {
      socketRef.current.emit("end-call", { to: remoteUserId });
    }

    // 2. Stop local media tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
    }

    // 3. Stop remote media tracks
    if (remoteStreamRef.current) {
      remoteStreamRef.current.getTracks().forEach((track) => track.stop());
    }

    // 4. Close the PeerConnection
    if (peerConnectionRef.current) {
      try {
        peerConnectionRef.current.close();
      } catch (e) {
        console.error("Error closing peer connection:", e);
      }
    }

    // 5. Reset all state and refs
    resetCallState();

    if (!timeOut) {
      toast.success("📞 Call ended successfully!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Slide,
        icon: "✅",
        style: {
          background: "#e0f7fa",
          color: "#00796b",
          fontWeight: "bold",
          fontSize: "16px",
          borderLeft: "5px solid #00796b",
          padding: "12px 16px",
        },
      });
    }

    if (timeOut) {
      toast.info("📞 Call timed out", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    }
  };

  useEffect(() => {
    if (!userId) setUserId(user?._id);
    if (!socketRef.current && user?._id) {
      socketRef.current = Socket(user);
    }
  }, [user, userId]);

  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = Socket(user);
    }

    if (!socketRef.current) return;

    // Listen for an incoming call
    socketRef.current.on(
      "incoming-call",
      async ({ offer, callerId, userId, callMode }) => {
        // setTimeout(() => {
        //   endCall(true);
        // }, 15000);

        // Prevent new incoming calls if we are already in a call
        if (callRef.current && callRef.current !== "idle") {
          console.warn(
            `Already in a call. Rejecting new call from ${callerId}.`
          );
          socketRef.current.emit("call-rejected", { to: callerId });
          toast.info("Someone tried to call you, but you were busy.", {
            position: "top-center",
          });
          return;
        }

        callRef.current = "incomingCall";
        setRemoteUserId(callerId);
        incomingCallInfo.current = {
          offer,
          callerId,
          userId,
        };
        callInfo.current = { caller: callerId, callee: userId };
        mode.current = callMode;
        setCallState("incomingCall");
        callInfo.current = { to: userId, from: callerId, offer };
      }
    );

    // The other peer answered the call
    socketRef.current.on("call-answered", async ({ answer }) => {
      callRef.current = "callAccepted";
      setCallState("callAccepted");
      if (
        peerConnectionRef.current &&
        peerConnectionRef.current.signalingState !== "stable" &&
        !peerConnectionRef.current.remoteDescription
      ) {
        try {
          await peerConnectionRef.current.setRemoteDescription(
            new RTCSessionDescription(answer)
          );

          // Clear the call timeout since the call was answered
          if (callTimeoutRef.current) {
            clearTimeout(callTimeoutRef.current);
          }

          // Process queued ICE candidates
          for (const candidate of pendingCandidatesRef.current) {
            try {
              await peerConnectionRef.current.addIceCandidate(candidate);
            } catch (err) {
              console.error("❌ Failed to add queued ICE candidate:", err);
            }
          }
          pendingCandidatesRef.current = [];
        } catch (err) {
          console.error("❌ Failed to set remote description:", err);
          endCall(); // End the call if there's a critical error
        }
      } else {
        console.warn("⚠️ Skipping duplicate or invalid remote description.");
      }
    });

    // Handle the exchange of ICE candidates
    socketRef.current.on("ice-candidate", async ({ candidate }) => {
      const iceCandidate = new RTCIceCandidate(candidate);
      const pc = peerConnectionRef.current;

      if (!pc || !pc.remoteDescription?.type) {
        // Queue candidates if the remote description hasn't been set yet
        console.warn("⏳ Queuing ICE candidate - peerConnection not ready yet");
        pendingCandidatesRef.current.push(iceCandidate);
      } else {
        try {
          await pc.addIceCandidate(iceCandidate);
        } catch (err) {
          console.error("❌ Failed to add ICE candidate:", err);
        }
      }
    });

    // Handle when the other peer ends the call
    socketRef.current.on("call-ended", () => {
      // We set this to false so our local endCall function doesn't try to emit again
      callEnded.current = false;
      endCall();
    });

    // Handle cases where the other peer is busy
    socketRef.current.on("call-rejected", () => {
      toast.warn("The user is currently on another call.", {
        position: "top-center",
      });
      endCall();
    });

    // Handle cases where the other peer doesn't answer
    socketRef.current.on("call-no-answer", () => {
      toast.error("The user didn't answer the call.", {
        position: "top-center",
      });
      endCall();
    });

    // Clean up event listeners on component unmount
    return () => {
      socketRef.current?.off("incoming-call");
      socketRef.current?.off("call-answered");
      socketRef.current?.off("ice-candidate");
      socketRef.current?.off("call-ended");
      socketRef.current?.off("call-rejected");
      socketRef.current?.off("call-no-answer");
      endCall(); // Ensure call is ended on unmount
    };
  }, [user]);

  const callUser = async (remoteUserId, callMode) => {
    // Prevent starting a new call if one is already in progress

    // setTimeout(() => {
    //   endCall(true);
    // }, 15000);

    if (isCallingRef.current) {
      console.warn(
        "Already in the process of a call. Ignoring new call request."
      );
      return;
    }
    isCallingRef.current = true;

    incomingCallInfo.current = {
      callerId: user._id,
      userId: remoteUserId,
    };
    setRemoteUserId(remoteUserId);
    callInfo.current = {
      caller: user._id,
      callee: remoteUserId,
    };
    if (!socketRef.current) return;
    callRef.current = "callRequest";
    setCallState("callRequest");
    mode.current = callMode;

    try {
      // Get user media, handle potential errors
      const stream = await navigator.mediaDevices.getUserMedia({
        video: callMode === "video",
        audio: true,
      });

      localStreamRef.current = stream;

      peerConnectionRef.current = new RTCPeerConnection(peerConnectionConfig);
      peerConnectionRef.current.onicecandidate = (event) => {
        if (event.candidate) {
          socketRef.current.emit("ice-candidate", {
            to: remoteUserId,
            from: user._id,
            candidate: event.candidate,
          });
        }
      };

      peerConnectionRef.current.ontrack = (event) => {
        remoteStreamRef.current = event.streams[0];
      };

      // Add local tracks to the connection
      stream.getTracks().forEach((track) => {
        peerConnectionRef.current.addTrack(track, stream);
      });

      // Create and send the offer
      const offer = await peerConnectionRef.current.createOffer();
      await peerConnectionRef.current.setLocalDescription(offer);

      socketRef.current.emit("call-user", {
        offer,
        targetUserId: remoteUserId,
        callerId: user._id,
        mode: callMode,
      });

      // Set a timeout for the call request
      callTimeoutRef.current = setTimeout(() => {
        endCall();
        toast.error("Call timed out. The user didn't respond.", {
          position: "top-center",
        });
      }, 30000); // 30 seconds timeout
    } catch (err) {
      console.error("❌ Failed to get user media or create call:", err);
      toast.error(
        "Could not access your media devices. Please check permissions.",
        {
          position: "top-center",
        }
      );
      isCallingRef.current = false;
      endCall();
    }
  };

  const answerCall = async () => {
    // If the call is already answered or in an unexpected state, exit
    if (callRef.current !== "incomingCall") {
      console.warn("Cannot answer a call that is not incoming.");
      return;
    }

    const offer = incomingCallInfo.current?.offer;
    const callerId = incomingCallInfo.current?.callerId;
    const userId = incomingCallInfo.current?.userId;

    callRef.current = "callAccepted";
    setCallState("callAccepted");
    try {
      // clearTimeout(callTimeoutRef.current);

      // Get user media for the answerer
      const stream = await navigator.mediaDevices.getUserMedia({
        video: mode.current === "video",
        audio: true,
      });
      localStreamRef.current = stream;

      peerConnectionRef.current = new RTCPeerConnection(peerConnectionConfig);
      peerConnectionRef.current.onicecandidate = (event) => {
        if (event.candidate) {
          socketRef.current.emit("ice-candidate", {
            to: callerId,
            candidate: event.candidate,
            from: userId,
          });
        }
      };

      peerConnectionRef.current.ontrack = (event) => {
        remoteStreamRef.current = event.streams[0];
      };

      // Add local tracks
      stream.getTracks().forEach((track) => {
        peerConnectionRef.current.addTrack(track, stream);
      });

      // Set the remote description (offer)
      await peerConnectionRef.current.setRemoteDescription(
        new RTCSessionDescription(offer)
      );

      // Create and set the answer
      const answer = await peerConnectionRef.current.createAnswer();
      await peerConnectionRef.current.setLocalDescription(answer);

      // Send the answer to the caller
      if (socketRef.current) {
        socketRef.current.emit("call-accepted", {
          answer,
          to: callerId,
          from: userId,
        });
      }

      // Process any queued ICE candidates that arrived before the remote description was set
      for (const candidate of pendingCandidatesRef.current) {
        try {
          await peerConnectionRef.current.addIceCandidate(candidate);
        } catch (err) {
          console.error(
            "❌ Failed to add queued ICE candidate during answer:",
            err
          );
        }
      }
      pendingCandidatesRef.current = [];
    } catch (err) {
      console.error("❌ Failed to answer call:", err);
      toast.error("Failed to answer the call. Check your media permissions.", {
        position: "top-center",
      });
      endCall();
    }
  };

  return (
    <CallerContext.Provider
      value={{
        socketRef,
        peerConnectionRef,
        localStreamRef,
        remoteStreamRef,
        userId,
        callUser,
        callRef,
        callInfo,
        answerCall,
        callState,
        setCallState,
        mode,
        activeUser,
        endCall,
        incomingCallInfo,
      }}
    >
      {children}
    </CallerContext.Provider>
  );
}

export default CallerContextProvider;
