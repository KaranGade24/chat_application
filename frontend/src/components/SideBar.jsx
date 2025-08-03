import React from "react";
import styles from "./SideBar.module.css";
import { FiSettings } from "react-icons/fi";
import { BsChatDots } from "react-icons/bs";
import { MdMessage, MdOutlineMessage } from "react-icons/md";
import { FiPhone } from "react-icons/fi"; // Feather Icon
import { HiOutlineChatAlt2 } from "react-icons/hi";
import { NavLink, useNavigate } from "react-router-dom";
import { FiUser } from "react-icons/fi";
import { useState } from "react";

function SideBar() {
  const navigate = useNavigate();
  const [isSelected, setIsSelected] = useState("");
  return (
    <div className={styles.mainContainer}>
      <div className={styles.sidebar}>
        <NavLink to="/" style={{ marginBottom: "0", paddingBottom: "0" }}>
          <svg
            width="50"
            height="50"
            viewBox="0 0 40 40"
            className={styles.logo}
          >
            <defs>
              <linearGradient
                id="logoGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#4c8bf5" />
                <stop offset="50%" stopColor="#6dd5ed" />
                <stop offset="100%" stopColor="#ffb86b" />
              </linearGradient>
            </defs>
            <circle
              cx="12"
              cy="15"
              r="8"
              fill="url(#logoGradient)"
              opacity="0.9"
            />
            <circle
              cx="28"
              cy="15"
              r="8"
              fill="url(#logoGradient)"
              opacity="0.7"
            />
            <path
              d="M8 20 Q20 35 32 20"
              stroke="url(#logoGradient)"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
            <circle cx="15" cy="12" r="2" fill="white" />
            <circle cx="25" cy="12" r="2" fill="white" />
          </svg>
        </NavLink>
        <NavLink
          to="chat"
          className={({ isActive }) => (isActive ? styles.isActive : "")}
        >
          <p>
            <MdOutlineMessage size={30} />
          </p>
        </NavLink>

        <NavLink
          to="call"
          className={({ isActive }) => (isActive ? styles.isActive : "")}
        >
          <p>
            <FiPhone size={22} />
          </p>
        </NavLink>

        {/* <NavLink
          to="status"
          className={({ isActive }) => (isActive ? styles.isActive : "")}
        >
          <p>
            <MdMessage size={30} />
          </p>
        </NavLink> */}

        <NavLink
          to="profile"
          className={({ isActive }) => (isActive ? styles.isActive : "")}
        >
          <p>
            <FiUser size={30} />
          </p>
        </NavLink>
      </div>
    </div>
  );
}

export default SideBar;
