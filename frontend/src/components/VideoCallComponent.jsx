import React from "react";
import styles from "./VideoCallComponent.module.css";
import { FiVideo } from "react-icons/fi";

export default function VideoCallComponent({ user }) {
  return (
    <div className={styles.videoScreen}>
      <div className={styles.body}>
        <FiVideo className={styles.icon} />
        <h2>Video calling {user.name}…</h2>
        <p>Connecting over video call</p>
      </div>
      <div className={styles.footer}>
        <button className={styles.hangUp}>End Call</button>
      </div>
    </div>
  );
}
