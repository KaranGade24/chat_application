import React, { useEffect, useRef, useState } from "react";
import styles from "./AfterAcceptingCall.module.css";
import {
  FiMic,
  FiMicOff,
  FiVolume2,
  FiPhoneOff,
  FiClock,
  FiUser,
} from "react-icons/fi";

const AfterAcceptingCall = ({
  mode, // "voice" or "video"
  localStream,
  remoteStream,
  onEnd,
  user, // callee user info
}) => {
  const [muted, setMuted] = useState(false);
  const [isCamOn, setIsCamOn] = useState(mode === "video");
  const [callTime, setCallTime] = useState(0);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const audioRef = useRef(null);
  const isVideo = mode === "video";

  useEffect(() => {
    setIsCamOn(mode === "video");
  }, [mode]);

  // 🕒 Call Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setCallTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // 🎥 Stream Binding
  useEffect(() => {
    if (isCamOn) {
      if (localVideoRef.current && localStream) {
        localVideoRef.current.srcObject = localStream;
      }
      if (remoteVideoRef.current && remoteStream) {
        remoteVideoRef.current.srcObject = remoteStream;
      }
    } else if (mode === "voice" && audioRef.current && remoteStream) {
      audioRef.current.srcObject = remoteStream;
    }
  }, [localStream, remoteStream, mode]);

  // 🔄 Re-bind check (for stream issues)
  useEffect(() => {
    const interval = setInterval(() => {
      if (isVideo && remoteVideoRef.current?.srcObject !== remoteStream) {
        remoteVideoRef.current.srcObject = remoteStream;
      }
      if (isVideo && localVideoRef.current?.srcObject !== localStream) {
        localVideoRef.current.srcObject = localStream;
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isVideo, localStream, remoteStream]);

  // 🎙️ Mute toggle
  const handleMuteToggle = () => {
    const audioTrack = localStream?.getAudioTracks?.()[0];
    if (audioTrack) audioTrack.enabled = muted;
    setMuted((prev) => !prev);
  };

  // 🔊 Speaker Toggle
  const toggleSpeaker = async () => {
    if ("setSinkId" in HTMLMediaElement.prototype) {
      try {
        const current = audioRef.current || remoteVideoRef.current;
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

  // ⏱️ Format time
  const formatTime = (sec) => {
    const m = Math.floor(sec / 60)
      .toString()
      .padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div className={styles.callContainer}>
      {/* 📞 Render based on call type */}
      {isVideo ? (
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
      ) : (
        <>
          <div className={styles.audioBanner}>🔊 Voice Call Ongoing</div>
          <audio ref={audioRef} autoPlay playsInline />
        </>
      )}

      {/* 👤 Caller Info & Timer */}
      <div className={styles.overlay}>
        <div className={styles.userInfo}>
          <FiUser className={styles.userIcon} />
          <h2>{user?.name || "Unknown"}</h2>
          <div className={styles.callDuration}>
            <FiClock />
            <span>{formatTime(callTime)}</span>
          </div>
        </div>

        {/* 🎛️ Controls */}
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
            onClick={onEnd}
          >
            <FiPhoneOff />
            <span>End</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AfterAcceptingCall;
