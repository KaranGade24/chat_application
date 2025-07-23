import React from "react";
import styles from "./SideBar.module.css";
import { FiSettings } from "react-icons/fi";
import { BsChatDots } from "react-icons/bs";
import { MdMessage, MdOutlineMessage } from "react-icons/md";
import { HiOutlineChatAlt2 } from "react-icons/hi";
import { useNavigate } from "react-router-dom";

function SideBar() {
  const navigate = useNavigate();
  return (
    <div className={styles.mainContainer}>
      <div className={styles.sidebar}>
        <p>LOGO</p>
        <p onClick={() => navigate("chat")}>
          <MdOutlineMessage size={30} />{" "}
        </p>
        <p>
          <MdMessage size={30} />{" "}
        </p>
        <p>
          <MdMessage size={30} />{" "}
        </p>
        <p>
          <MdMessage size={30} />{" "}
        </p>
      </div>
    </div>
  );
}

export default SideBar;
