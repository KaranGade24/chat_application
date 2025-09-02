import React, { useContext, useEffect, useRef } from "react";
import styles from "./VideoCallComponent.module.css";
import { FiVideo } from "react-icons/fi";
import CallerContext from "../store/CallerContext/CallerContext";

export default function VideoCallComponent({ onHangUp }) {
  const { localStreamRef, activeUser } = useContext(CallerContext);
  const localVideoRef = useRef(null);
  const user = activeUser.current;

  useEffect(() => {
    if (!localStreamRef.current) return;

    localVideoRef.current.srcObject = localStreamRef.current;
  }, [localStreamRef.current, localStreamRef, localVideoRef.current]);

  return (
    <div className={styles.videoScreen}>
      <div className={styles.body}>
        <FiVideo className={styles.icon} />
        <h2>Video calling {user?.name}…</h2>
        <p>Connecting over video call</p>
      </div>
      <video
        autoPlay
        muted
        ref={localVideoRef}
        style={{
          width: "200px",
          height: "200px",
          borderRadius: "10px",
          overflow: "hidden",
          margin: "0 auto",
        }}
      ></video>

      <div className={styles.footer}>
        <button
          onClick={() => {
            onHangUp();
          }}
          className={styles.hangUp}
        >
          End Call
        </button>
      </div>
    </div>
  );
}
