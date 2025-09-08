import React from "react";
import styles from "./EmptyStatePage.module.css";

const EmptyStatePage = () => (
  <div className={styles.container}>
    <svg
      className={styles.illustration}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      width="200"
      height="200"
      fill="none"
    >
      <circle cx="32" cy="32" r="30" stroke="#CBD5E0" strokeWidth="4" />
      <path
        d="M20 28h24M20 36h24"
        stroke="#A0AEC0"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M32 16v8M32 40v8"
        stroke="#A0AEC0"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
    <h2 className={styles.title}>Nothing Selected Yet</h2>
    <p className={styles.message}>
      Click on a sidebar item to start a conversation!
    </p>
  </div>
);

export default EmptyStatePage;
