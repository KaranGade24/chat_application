import React, { useContext } from "react";
import styles from "./CallComponent.module.css";
import { FiPhone } from "react-icons/fi";
import CallerContext from "../store/CallerContext/CallerContext";

export default function CallComponent({ onAccept }) {
  const { activeUser, endCall } = useContext(CallerContext);
  const user = activeUser.current;

  return (
    <div className={styles.callScreen}>
      <div className={styles.body}>
        <FiPhone className={styles.icon} />
        <h2>Calling {user?.name}…</h2>
        <p>Connecting over voice call</p>
      </div>

      <div className={styles.footer}>
        <button
          className={styles.hangUp}
          onClick={() => {
            endCall();
          }}
        >
          Hang Up
        </button>
      </div>
    </div>
  );
}
