import React, { useContext, useEffect, useState } from "react";
import UserList from "../../components/UserList";
import UserChat from "../../components/UserChat";
import styles from "./Chat.module.css";
import MessageContext from "../../store/Messages/MessageContext";
import CallerContext from "../../store/CallerContext/CallerContext";

function Chat() {
  const { selectedUser, setSelectedUser } = useContext(MessageContext);
  const { activeUser } = useContext(CallerContext);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showChatOnly, setShowChatOnly] = useState(false);
  const [isUserChatVisible] = useState(false);
  const [showModal, setShowModal] = useState(false);

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
    setShowModal(false);
    setShowChatOnly(true);
  };

  const handleBack = () => {
    setShowChatOnly(false);
    setSelectedUser(null);
    setShowModal(false);
  };

  return (
    <div className={styles.chatContainer}>
      {!isMobile || !showChatOnly ? (
      <div 
      className={styles.userListContainer}
      
      >
        <UserList handleOnClick={handleOnClick} selectedUser={selectedUser} />
      </div>
      ) : null}
      {!isMobile || showChatOnly ? (
        <>
          <UserChat
            isUserChatVisible={isUserChatVisible}
            selectedUser={selectedUser}
            onBack={handleBack}
            showModal={showModal}
            setShowModal={setShowModal}
          />
        </>
      ) : null}
    </div>
  );
}

export default Chat;
