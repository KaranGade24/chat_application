import React from "react";
import styles from "./EmptyChatPlaceholder.module.css";

function EmptyChatPlaceholder() {
  return (
    <div className={styles.placeholder}>
      <div className={styles.content}>
        <svg
          className={styles.svg}
          width="200"
          height="200"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M4 4H20C21.1046 4 22 4.89543 22 6V15C22 16.1046 21.1046 17 20 17H7L4 20V6C4 4.89543 4.89543 4 6 4Z"
            // stroke="#999"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M8 9H16M8 13H14"
            stroke="#555"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
        <h2>No Chat Selected</h2>
        <p>Select a user from the list to start a conversation.</p>
      </div>
    </div>
  );
}

export default EmptyChatPlaceholder;
