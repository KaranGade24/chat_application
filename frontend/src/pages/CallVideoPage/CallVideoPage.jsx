import React, { useState, useEffect } from "react";
import styles from "./CallVideoPage.module.css";

import UserList from "../../components/UserList";
import CallComponent from "../../components/CallComponent";
import VideoCallComponent from "../../components/VideoCallComponent";
import Socket from "../../../config/Socket";
import { useMessageContext } from "../../store/Messages/MessageContextProvider";
import { makeCallRequest } from "./AllCallFunctions";
import { useContext } from "react";
import CallerContext from "../../store/CallerContext/CallerContext";

export default function CallVideoPage() {
  const {
    setLocalStream,
    setPeerConnection,
    setInCall,
    setCallee,
    setCallType,
    activeUser,
    setActiveUser,
    mode,
    setMode,
    peerConnectionRef,
    setRemoteStream,
  } = useContext(CallerContext);

  const { user, users: friendList, setUserStatuses } = useMessageContext();
  // responsive breakpoint hook
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const handleAction = async (selectUser, action) => {
    const socket = Socket(user);
    console.log(socket, "from call videpage");
    if (!socket) return;

    if (!friendList || friendList.length === 0) return;

    // Call `check-user-online` and handle everything inside the callback
    socket.emit("check-user-online", friendList, (statusList) => {
      setUserStatuses(statusList);

      const selectedStatus = statusList.find((f) => f._id === selectUser._id);

      if (!selectedStatus || !selectedStatus.isOnline) {
        alert("The selected user is currently offline and cannot be called.");
        return; // 💡 Ensures code below doesn't run
      }
    });
    // 1. Check online…
    setActiveUser(selectUser);
    setMode(action);

    // 2. **Use `action`, not `mode`**, to start the call:
    await makeCallRequest(
      action, // ← voice-call or video-call
      selectUser._id,
      socket,
      {
        setLocalStream,
        setPeerConnection,
        setInCall,
        setCallee,
        setCallType,
        peerConnectionRef,
        setRemoteStream,
      }
    );
  };

  const hangUp = () => {
    setMode(null);
    setActiveUser(null);
  };

  return (
    <div className={styles.container}>
      {(!isMobile || mode === null) && (
        <UserList mode="video" onAction={handleAction} />
      )}

      {mode && activeUser && (
        <div className={isMobile ? styles.mobileFull : styles.content}>
          {mode === "voice" ? (
            <CallComponent onHangUp={hangUp} user={activeUser} />
          ) : (
            <VideoCallComponent user={activeUser} />
          )}
        </div>
      )}
    </div>
  );
}
