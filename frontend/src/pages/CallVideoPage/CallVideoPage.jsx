import React, { useEffect, useRef, useState } from "react";
import styles from "./CallVideoPage.module.css";

export default function CallVideoPage() {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [isCalling, setIsCalling] = useState(false);
  const [stream, setStream] = useState(null);
  const [peerConnection, setPeerConnection] = useState(null);

  useEffect(() => {
    // get local stream once
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((mediaStream) => {
        setStream(mediaStream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = mediaStream;
        }
      })
      .catch((err) => console.error("Error accessing media devices.", err));
  }, []);

  const startCall = async () => {
    if (!stream) return;
    setIsCalling(true);
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    // add tracks
    stream.getTracks().forEach((track) => pc.addTrack(track, stream));

    // when remote stream arrives
    pc.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    // create offer
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    // normally you send offer via signaling server, here we loopback for demo
    await pc.setRemoteDescription(offer);
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    await pc.setRemoteDescription(answer);

    setPeerConnection(pc);
  };

  const endCall = () => {
    if (peerConnection) {
      peerConnection.close();
      setPeerConnection(null);
    }
    setIsCalling(false);
    // stop remote video
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
  };

  const toggleAudio = () => {
    if (!stream) return;
    stream.getAudioTracks().forEach((track) => {
      track.enabled = !track.enabled;
    });
  };

  const toggleVideo = () => {
    if (!stream) return;
    stream.getVideoTracks().forEach((track) => {
      track.enabled = !track.enabled;
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.videos}>
        <video
          ref={localVideoRef}
          autoPlay
          muted
          className={styles.localVideo}
        />
        <video ref={remoteVideoRef} autoPlay className={styles.remoteVideo} />
      </div>
      <div className={styles.controls}>
        {!isCalling ? (
          <button className={styles.callBtn} onClick={startCall}>
            📞 Start Call
          </button>
        ) : (
          <>
            <button className={styles.controlBtn} onClick={toggleAudio}>
              🎙️ Mute/Unmute
            </button>
            <button className={styles.controlBtn} onClick={toggleVideo}>
              🎥 Video On/Off
            </button>
            <button className={styles.endBtn} onClick={endCall}>
              🔴 End Call
            </button>
          </>
        )}
      </div>
    </div>
  );
}
