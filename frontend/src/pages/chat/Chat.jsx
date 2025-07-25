import React, { useContext, useEffect, useState } from "react";
import UserList from "../../components/UserList";
import UserChat from "../../components/UserChat";
import styles from "./Chat.module.css";
import MessageContext from "../../store/Messages/MessageContext";

function Chat() {
  const { selectedUser, setSelectedUser } = useContext(MessageContext);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showChatOnly, setShowChatOnly] = useState(false);

  const handleResize = () => {
    const mobile = window.innerWidth < 768;
    setIsMobile(mobile);
    if (!mobile && !showChatOnly) setShowChatOnly(false); // Reset view when desktop
  };

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [window.innerWidth]);

  const handleOnClick = (e, user) => {
    e.preventDefault();
    setSelectedUser(user);

    setShowChatOnly(true);
  };

  const handleBack = () => {
    setShowChatOnly(false);
    setSelectedUser(null);
  };

  return (
    <div className={styles.chatContainer}>
      {!isMobile || !showChatOnly ? (
        <UserList handleOnClick={handleOnClick} selectedUser={selectedUser} />
      ) : null}
      {!isMobile || showChatOnly ? (
        <UserChat selectedUser={selectedUser} onBack={handleBack} />
      ) : null}
    </div>
  );
}

export default Chat;
