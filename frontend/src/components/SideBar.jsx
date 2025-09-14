import React, { useContext, useState } from "react";
import styles from "./SideBar.module.css";
import { FiPhone, FiMenu, FiX } from "react-icons/fi";
import { MdOutlineMessage } from "react-icons/md";
import { NavLink, useNavigate } from "react-router-dom";
import { UserCircle } from "lucide-react";
import chatFlowLogo from "../assets/logo.png";
import MessageContext from "../store/Messages/MessageContext";

function SideBar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useContext(MessageContext);
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div
      className={`${styles.sidebar} ${isOpen ? styles.open : styles.closed}`}
    >
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.logoContainer}>
          <img
            onClick={() => {
              navigate("/");
            }}
            src={chatFlowLogo}
            width={35}
            height={35}
            alt="ChatFlow Logo"
            className={styles.logo}
          />
          {isOpen && <span className={styles.logoText}>ChatFlow</span>}
        </div>

        <button className={styles.toggleBtn} onClick={toggleSidebar}>
          {isOpen ? <FiX size={22} /> : <FiMenu size={22} />}
        </button>
      </div>

      {/* Menu */}
      <div className={styles.menu}>
        <NavLink
          to="chat"
          className={({ isActive }) =>
            `${styles.menuItem} ${!isOpen && styles.closedMenuItemIcon} ${
              isActive ? styles.isActive : ""
            }`
          }
        >
          <MdOutlineMessage size={22} />
          {isOpen && <span>Chats</span>}
        </NavLink>

        <NavLink
          to="call"
          className={({ isActive }) =>
            `${styles.menuItem}  ${!isOpen && styles.closedMenuItemIcon} ${
              isActive ? styles.isActive : ""
            }`
          }
        >
          <FiPhone size={22} />
          {isOpen && <span>Calls</span>}
        </NavLink>

        <NavLink
          to="profile"
          className={({ isActive }) =>
            `${styles.menuItem} ${!isOpen && styles.closedMenuItemIcon} ${
              isActive ? styles.isActive : ""
            }`
          }
        >
          <UserCircle size={22} />
          {isOpen && <span>Profile</span>}
        </NavLink>
      </div>

      {/* Profile Section */}
      <div className={styles.profileSection}>
        <img
          src={user?.avatar?.url || "https://i.pravatar.cc/40"}
          alt={`Profile of ${user.name}`}
          className={styles.profileImg}
        />
        {isOpen && (
          <div>
            <p className={styles.profileName}>{user.name}</p>
            <p className={styles.profileStatus}>Online</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default SideBar;
