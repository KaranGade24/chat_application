import React, { useState, useEffect, useRef } from "react";
import styles from "./OngoingCallComponent.module.css";
import {
  FiPhoneOff,
  FiMic,
  FiMicOff,
  FiVolume2,
  FiUser,
  FiClock,
} from "react-icons/fi";

export default function OngoingCallComponent({
  user,
  onHangUp,
  callType,
  localStream,
  remoteStream,
}) {
  const [muted, setMuted] = useState(false);
  const [callTime, setCallTime] = useState(0);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  // Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setCallTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Attach streams
  useEffect(() => {
    const attachStreams = () => {
      if (callType === "video") {
        if (localVideoRef.current && localStream) {
          localVideoRef.current.srcObject = localStream;
        }
        if (remoteVideoRef.current && remoteStream) {
          remoteVideoRef.current.srcObject = remoteStream;
        }
      }
    };
    attachStreams();
  }, [callType, localStream, remoteStream]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (
        callType === "video" &&
        remoteVideoRef.current?.srcObject !== remoteStream
      ) {
        remoteVideoRef.current.srcObject = remoteStream;
      }
      if (
        callType === "video" &&
        localVideoRef.current?.srcObject !== localStream
      ) {
        localVideoRef.current.srcObject = localStream;
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [callType, localStream, remoteStream]);

  const handleMuteToggle = () => {
    const audioTrack = localStream?.getAudioTracks?.()[0];
    if (audioTrack) audioTrack.enabled = muted;
    setMuted((prev) => !prev);
  };

  const toggleSpeaker = async () => {
    if ("setSinkId" in HTMLMediaElement.prototype) {
      try {
        const current = remoteVideoRef.current;
        const newSink =
          current.sinkId === "default" ? "communications" : "default";
        await current.setSinkId(newSink);
        alert("Speaker toggled");
      } catch (e) {
        console.error("Speaker error", e);
      }
    } else {
      alert("Speaker control not supported");
    }
  };

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60)
      .toString()
      .padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div className={styles.callContainer}>
      {callType === "video" && (
        <>
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className={styles.remoteVideo}
          />
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className={styles.localVideo}
          />
        </>
      )}

      <div className={styles.overlay}>
        <div className={styles.userInfo}>
          <FiUser className={styles.userIcon} />
          <h2>{user?.name || "Unknown"}</h2>
          <div className={styles.callDuration}>
            <FiClock />
            <span>{formatTime(callTime)}</span>
          </div>
        </div>

        <div className={styles.controls}>
          <button
            className={`${styles.controlBtn} ${muted ? styles.active : ""}`}
            onClick={handleMuteToggle}
          >
            {muted ? <FiMicOff /> : <FiMic />}
            <span>{muted ? "Unmute" : "Mute"}</span>
          </button>

          <button className={styles.controlBtn} onClick={toggleSpeaker}>
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
    </div>
  );
}
