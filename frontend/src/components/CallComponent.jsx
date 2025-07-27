import React from "react";
import styles from "./CallComponent.module.css";
import { FiPhone } from "react-icons/fi";

export default function CallComponent({ onAccept, user, onHangUp }) {
  return (
    <div className={styles.callScreen}>
      <div className={styles.body}>
        <FiPhone className={styles.icon} />
        <h2>Calling {user.name}…</h2>
        <p>Connecting over voice call</p>
      </div>

      <div className={styles.footer}>
        <button className={styles.hangUp} onClick={onHangUp}>
          Hang Up
        </button>
        <button className={styles.accept} onClick={onAccept}>
          Accept Call
        </button>
      </div>
    </div>
  );
}
