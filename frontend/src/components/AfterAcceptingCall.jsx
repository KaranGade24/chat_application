import React, { useContext, useEffect, useRef, useState } from "react";
import styles from "./AfterAcceptingCall.module.css";
import {
  FiMic,
  FiMicOff,
  FiVolume2,
  FiPhoneOff,
  FiClock,
  FiUser,
} from "react-icons/fi";
import MessageContext from "../store/Messages/MessageContext";
import CallerContext from "../store/CallerContext/CallerContext";

const AfterAcceptingCall = ({
  mode, // "voice" or "video"
}) => {
  const [muted, setMuted] = useState(true);
  const [callTime, setCallTime] = useState(0);
  const { localStreamRef, remoteStreamRef, endCall, activeUser } =
    useContext(CallerContext);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const audioRef = useRef(null);

  const { user } = useContext(MessageContext);
  const isVideoCall = mode === "video" ? true : false;

  useEffect(() => {
    if (mode !== "video") return;

    if (localVideoRef.current && localStreamRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
    }

    if (remoteVideoRef.current && remoteStreamRef.current) {
      remoteVideoRef.current.srcObject = remoteStreamRef.current;
    }
  }, [
    localStreamRef,
    remoteStreamRef,
    remoteStreamRef.current,
    localStreamRef.current,
    localVideoRef,
    remoteVideoRef,
  ]);

  useEffect(() => {
    // If mode is a ref, use mode.current
    if (mode === "video") return;

    if (remoteStreamRef.current && audioRef.current) {
      audioRef.current.srcObject = remoteStreamRef.current;
    }
  }, [remoteStreamRef.current, audioRef.current]); // Only include .current if you absolutely need to

  // 🕒 Timer
  useEffect(() => {
    const interval = setInterval(() => setCallTime((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  // 🎙️ Mute toggle
  const handleMuteToggle = () => {
    const track = localStreamRef?.current?.getAudioTracks?.()[0];
    if (track) {
      track.enabled = !muted;
      setMuted((m) => !m);
    }
  };

  // 🔊 Toggle Speaker
  const toggleSpeaker = async () => {
    const element = isVideoCall ? remoteVideoRef.current : audioRef.current;

    if ("setSinkId" in HTMLMediaElement.prototype) {
      try {
        const newSink =
          element.sinkId === "default" ? "communications" : "default";
        await element.setSinkId(newSink);
        alert("Speaker output toggled.");
      } catch (error) {
        console.error("Speaker toggle error", error);
      }
    } else {
      alert("Speaker control not supported in your browser.");
    }
  };

  // ⏹️ End Call Handler
  const handleEndCall = () => {
    endCall();
  };

  // ⏱️ Format time (mm:ss)
  const formatTime = (seconds) => {
    const m = String(Math.floor(seconds / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div className={styles.callContainer}>
      {/* 🔴 Video Call View */}
      {isVideoCall ? (
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

      {/* ℹ️ Overlay Controls */}
      <div className={styles.overlay}>
        <div className={styles.userInfo}>
          <FiUser className={styles.userIcon} />
          <h2>{activeUser?.current[0]?.name || "Unknown"}</h2>
          <div className={styles.callDuration}>
            <FiClock />
            <span>{formatTime(callTime)}</span>
          </div>
        </div>

        <div className={styles.controls}>
          {/* 🎙️ Mute */}
          <button
            className={`${styles.controlBtn} ${muted ? styles.active : ""}`}
            onClick={handleMuteToggle}
          >
            {muted ? <FiMic /> : <FiMicOff />}
            <span>{muted ? "Mute" : "Unmute"}</span>
          </button>

          {/* 🔊 Speaker */}
          <button className={styles.controlBtn} onClick={toggleSpeaker}>
            <FiVolume2 />
            <span>Speaker</span>
          </button>

          {/* ⛔ End Call */}
          <button
            className={`${styles.controlBtn} ${styles.hangUp}`}
            onClick={handleEndCall}
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
