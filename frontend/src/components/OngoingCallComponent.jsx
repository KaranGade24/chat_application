import React, { useState, useEffect } from "react";
import styles from "./OngoingCallComponent.module.css";
import {
  FiPhoneOff,
  FiMic,
  FiMicOff,
  FiVolume2,
  FiUser,
  FiClock,
} from "react-icons/fi";

export default function OngoingCallComponent({ user, onHangUp }) {
  const [muted, setMuted] = useState(false);
  const [callTime, setCallTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCallTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className={styles.callContainer}>
      <div className={styles.userInfo}>
        <FiUser className={styles.userIcon} />
        <h2>{user.name}</h2>
        <div className={styles.callDuration}>
          <FiClock />
          <span>{formatTime(callTime)}</span>
        </div>
      </div>

      <div className={styles.controls}>
        <button
          className={`${styles.controlBtn} ${muted ? styles.active : ""}`}
          onClick={() => setMuted((prev) => !prev)}
        >
          {muted ? <FiMicOff /> : <FiMic />}
          <span>{muted ? "Unmute" : "Mute"}</span>
        </button>

        <button className={styles.controlBtn}>
          <FiVolume2 />
          <span>Speaker</span>
        </button>

        <button
          className={`${styles.controlBtn} ${styles.hangUp}`}
          onClick={onHangUp}
        >
          <FiPhoneOff />
          <span>End</span>
        </button>
      </div>
    </div>
  );
}
