import React, { useContext, useEffect, useState } from "react";
import { FaSearch, FaUserCircle } from "react-icons/fa";
import styles from "./SearchBar.module.css";
import MessageContext from "../store/Messages/MessageContext";
import ProfileModal from "./ProfileModal";

function SearchBar() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { selectedUser } = useContext(MessageContext);
  const [isMobile, setIsMobile] = useState(false);
  const { user } = useContext(MessageContext);

  const handleResize = () => {
    setIsMobile(window.innerWidth <= 768); // True if mobile size, false if not
  };

  useEffect(() => {
    handleResize(); // Check initially
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [window.innerWidth]);

  return (
    <div className={styles.searchContainer}>
      {/* Conditionally render search bar */}

      {(isMobile && !selectedUser) || !isMobile ? (
        <div className={styles.searchBar}>
          <FaSearch className={styles.icon} />
          <input
            type="text"
            placeholder="Search..."
            className={styles.input}
            aria-label="Search"
          />
        </div>
      ) : null}

      {/* Profile info */}
      <div className={styles.profile}>
        <FaUserCircle className={styles.profileIcon} />
        <button
          onClick={(e) => {
            e.preventDefault();
            setIsModalOpen(true);
          }}
          className={styles.profileBtn}
        >
          Profile
        </button>
        <ProfileModal
          user={user}
          isOpen={isModalOpen}
          onClose={(e) => {
            e.preventDefault();
            setIsModalOpen(false);
          }}
          // onUpdate={handleUpdate}
        />
      </div>
    </div>
  );
}

export default SearchBar;
