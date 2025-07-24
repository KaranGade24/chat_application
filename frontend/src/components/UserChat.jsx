import React, { useEffect, useState } from "react";
import styles from "./UserChat.module.css";
import EmojiPicker from "emoji-picker-react";
import EmptyChatPlaceholder from "./EmptyChatPlaceholder";
import { AiOutlineSend } from "react-icons/ai";
import defaultAvatar from "../assets/defaultAvatar.png"; // Assuming you have a default avatar image

function UserChat({ selectedUser, onBack }) {
  const [userMessages, setUserMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  useEffect(() => {
    if (selectedUser) {
      setUserMessages(selectedUser.Messages || []);
    }
  }, [selectedUser]);

  const handleSend = () => {
    if (!input.trim()) return;
    const newMessage = { from: "me", text: input };
    setUserMessages((prev) => [...prev, newMessage]);
    setInput("");
  };

  const handleEmojiClick = (emoji) => {
    setInput((prev) => prev + emoji.emoji);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const newMessage = { from: "me", text: `📎 Sent file: ${file.name}` };
      setUserMessages((prev) => [...prev, newMessage]);
    }
  };

  useEffect(() => {
    if (input) {
      setIsTyping(true);
      const timeout = setTimeout(() => setIsTyping(false), 1000);
      return () => clearTimeout(timeout);
    }
  }, [input]);

  return (
    <div className={styles.userChat}>
      {selectedUser ? (
        <>
          {/* Header */}
          <div className={styles.header}>
            {onBack && (
              <div className={styles.backArrow} onClick={onBack}>
                &larr;
              </div>
            )}
            <img
              src={selectedUser.profilePic || defaultAvatar}
              alt={selectedUser.name}
              className={styles.profilePic}
            />
            <div>
              <h3 className={styles.userName}>{selectedUser.name}</h3>
              <span
                className={`${styles.status} ${styles[selectedUser.status]}`}
              >
                {selectedUser.status}
              </span>
            </div>
          </div>

          {/* Chat Body */}
          <div className={styles.chatBody}>
            {userMessages.map((msg, index) => (
              <div
                key={index}
                className={
                  msg.from === "me" ? styles.myMessage : styles.theirMessage
                }
              >
                {msg.text}
              </div>
            ))}
            {isTyping && (
              <div className={styles.typingIndicator}>
                {selectedUser.name} is typing
                <span className={styles.dots}>
                  <span>.</span>
                  <span>.</span>
                  <span>.</span>
                </span>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className={styles.inputArea}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type a message..."
              className={styles.input}
            />

            {/* <button onClick={() => setShowEmojiPicker((prev) => !prev)}>
              😊
            </button>
            {showEmojiPicker && (
              <div className={styles.emojiPicker}>
                <EmojiPicker onEmojiClick={handleEmojiClick} />
              </div>
            )}
            <label className={styles.fileUpload}>
              📎
              <input type="file" onChange={handleFileChange} hidden />
            </label> */}

            <button onClick={handleSend} className={styles.sendBtn}>
              <AiOutlineSend size={15} />
            </button>
          </div>
        </>
      ) : (
        <EmptyChatPlaceholder />
      )}
    </div>
  );
}

export default UserChat;
