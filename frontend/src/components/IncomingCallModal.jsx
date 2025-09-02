import React from "react";
import styles from "./IncomingCallModal.module.css";
import { Phone, PhoneOff } from "lucide-react";

const IncomingCallModal = ({ caller, onAccept, endCall }) => {
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h3>{caller?.name} is calling you...</h3>

        <div className={styles.actions}>
          <button onClick={onAccept} className={styles.accept}>
            <Phone /> Accept
          </button>
          <button
            onClick={() => {
              endCall();
            }}
            className={styles.reject}
          >
            <PhoneOff /> Reject
          </button>
        </div>
      </div>
    </div>
  );
};

export default IncomingCallModal;
