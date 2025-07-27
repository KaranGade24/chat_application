import React, { useEffect, useRef, useState } from "react";
import styles from "./AfterAcceptingCall.module.css";
import { Mic, MicOff, Video, VideoOff, PhoneOff } from "lucide-react";

const AfterAcceptingCall = ({ mode, localStream, remoteStream, onEnd }) => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(mode === "video");
  const isVideo = mode === "video";

  useEffect(() => {
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
    if (remoteStream && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [localStream, remoteStream]);

  const toggleMic = () => {
    const audioTrack = localStream?.getAudioTracks()?.[0];
    if (audioTrack) audioTrack.enabled = !isMicOn;
    setIsMicOn((prev) => !prev);
  };

  const toggleCamera = () => {
    const videoTrack = localStream?.getVideoTracks()?.[0];
    if (videoTrack) videoTrack.enabled = !isCamOn;
    setIsCamOn((prev) => !prev);
  };

  return (
    <div className={styles.callContainer}>
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
        <div className={styles.audioBanner}>🔊 Audio Call Ongoing</div>
      )}

      <div className={styles.controls}>
        <button onClick={toggleMic}>{isMicOn ? <Mic /> : <MicOff />}</button>

        {isVideo && (
          <button onClick={toggleCamera}>
            {isCamOn ? <Video /> : <VideoOff />}
          </button>
        )}

        <button onClick={onEnd} className={styles.endCall}>
          <PhoneOff />
        </button>
      </div>
    </div>
  );
};

export default AfterAcceptingCall;
