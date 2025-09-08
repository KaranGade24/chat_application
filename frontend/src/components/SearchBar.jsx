import React, { useContext, useEffect, useState } from "react";
import { FaSearch, FaUserCircle } from "react-icons/fa";
import styles from "./SearchBar.module.css";
import MessageContext from "../store/Messages/MessageContext";
import { useNavigate } from "react-router-dom";

function SearchBar() {
  const { selectedUser } = useContext(MessageContext);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();

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
      

      {/* Profile info */}
      <div className={styles.profile}>
        <FaUserCircle className={styles.profileIcon} />
        <button
          onClick={(e) => {
            e.preventDefault();
            navigate("/app/profile");
          }}
          className={styles.profileBtn}
        >
          Profile
        </button>
      </div>
    </div>
  );
}

export default SearchBar;
