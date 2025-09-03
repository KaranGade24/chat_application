import React, { useState, useEffect, useRef } from "react";
import styles from "./CallVideoPage.module.css";

import UserList from "../../components/UserList";
import CallComponent from "../../components/CallComponent";
import VideoCallComponent from "../../components/VideoCallComponent";
import Socket from "../../../config/Socket";
import { useMessageContext } from "../../store/Messages/MessageContextProvider";
import { useContext } from "react";
import CallerContext from "../../store/CallerContext/CallerContext";

export default function CallVideoPage() {
  const { callUser, callRef, localStreamRef, mode, activeUser, endCall } =
    useContext(CallerContext);
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
    if (!socket) return;

    if (!friendList || friendList.length === 0) return;

    // Call `check-user-online` and handle everything inside the callback
    socket.emit("check-user-online", friendList, async (statusList) => {
      setUserStatuses(statusList);
      const selectedStatus = statusList.find((f) => f._id === selectUser._id);
      if (!selectedStatus || !selectedStatus.isOnline) {
        alert("The selected user is currently offline and cannot be called.");
        return;
      }

      activeUser.current = [selectUser];
      console.log(
        "activeUser: ",
        activeUser.current,
        "selected User : ",
        selectUser
      );

      mode.current = action;
      callUser(selectUser._id, action);
    });
  };

  const hangUp = () => {
    endCall();
    // setMode(null);/
  };

  return (
    <div className={styles.container}>
      {callRef.current !== "callRequest" && (
        <UserList mode={"call"} onAction={handleAction} />
      )}

      {callRef.current === "callRequest" && (
        <div className={styles.content}>
          {mode.current === "voice" ? (
            <CallComponent onHangUp={hangUp} />
          ) : (
            <VideoCallComponent onHangUp={hangUp} />
          )}
        </div>
      )}
    </div>
  );
}
