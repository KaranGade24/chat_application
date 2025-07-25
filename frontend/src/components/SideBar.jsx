import React from "react";
import styles from "./SideBar.module.css";
import { FiSettings } from "react-icons/fi";
import { BsChatDots } from "react-icons/bs";
import { MdMessage, MdOutlineMessage } from "react-icons/md";
import { HiOutlineChatAlt2 } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import { FiUser } from "react-icons/fi";
import { useState } from "react";

function SideBar() {
  const navigate = useNavigate();
  const [isSelected, setIsSelected] = useState("");
  return (
    <div className={styles.mainContainer}>
      <div className={styles.sidebar}>
        <p>LOGO</p>
        <p
          className={isSelected === "chat" ? styles.isSelected : ""}
          onClick={() => {
            setIsSelected("chat");
            navigate("chat");
          }}
        >
          <MdOutlineMessage size={30} />
        </p>
        <p>
          <MdMessage size={30} />
        </p>
        <p>
          <MdMessage size={30} />
        </p>
        <p
          className={isSelected === "profile" ? styles.isSelected : ""}
          onClick={() => {
            setIsSelected("profile");
            navigate("profile");
          }}
        >
          <FiUser size={30} />
        </p>
      </div>
    </div>
  );
}

export default SideBar;
