// src/components/UserChat/UserChat.jsx
import { useEffect, useState, useMemo } from "react";
import styles from "./UserChat.module.css";
import EmojiPicker from "emoji-picker-react";
import EmptyChatPlaceholder from "./EmptyChatPlaceholder";
import { AiOutlineSend } from "react-icons/ai";
import defaultAvatar from "../assets/defaultAvatar.png";
import Socket from "../../config/Socket";
import { useMessageContext } from "../store/Messages/MessageContextProvider";
import { ClipLoader } from "react-spinners";
import UserInfoModal from "./UserInfoModal";

export default function UserChat({ selectedUser, onBack }) {
  const {
    user,
    updateFriendMessages,
    setMessageLoadFriendList,
    messageLoadFriendList,
    users,
    setUsers,
  } = useMessageContext();
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [userMessages, setUserMessages] = useState([]);
  const [input, setInput] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Initialize socket once per user
  const socket = useMemo(() => {
    if (!user) return null;
    return Socket(user);
  }, [user]);

  useEffect(() => {
    if (!socket || !selectedUser) return;

    if (input.trim() === "") return;

    socket.emit("isTyping", {
      isTyping: true,
      receiverId: selectedUser._id,
    });

    const timeout = setTimeout(() => {
      socket.emit("isTyping", {
        isTyping: false,
        receiverId: selectedUser._id,
      });
    }, 2000);

    return () => clearTimeout(timeout);
  }, [input]);

  useEffect(() => {
    if (!socket || !selectedUser || !user) {
      return;
    }

    console.log({ socket, selectedUser, user });
    const handleTyping = ({ isTyping, senderId }) => {
      console.log("📩 Typing event received:", {
        isTyping,
        senderId,
        userId: user._id,
      });

      // Show typing only if the selectedUser (friend) is the one typing
      if (user._id === senderId) {
        console.log("istyping.........");
        setIsTyping(isTyping);
      }
    };

    socket.on("isTyping", handleTyping);
    console.log("selected user:", selectedUser);

    return () => {
      socket.off("isTyping", handleTyping); // cleanup
    };
  }, [socket, selectedUser, user]);

  // When selectedUser changes, load their messages
  useEffect(() => {
    if (!selectedUser || !user) {
      setUserMessages([]);
      return;
    }
    setLoadingMessages(true);
    if (messageLoadFriendList.includes(selectedUser._id)) {
      const updated = users.find((u) => u._id === selectedUser._id);
      setUserMessages(updated?.Messages || []);
      setLoadingMessages(false);
      return;
    }

    setMessageLoadFriendList((prev) => [...prev, selectedUser._id]);

    updateFriendMessages(user._id, selectedUser._id).then(() => {
      const updated = users.find((u) => u._id === selectedUser._id);
      setUserMessages(updated?.Messages || []);
      setLoadingMessages(false);
    });
  }, [selectedUser, user, users]);

  // Scroll to bottom on new messages
  useEffect(() => {
    const chatBody = document.querySelector(`.${styles.chatBody}`);
    if (chatBody) chatBody.scrollTop = chatBody.scrollHeight;
  }, [userMessages]);

  // Listen for incoming messages over socket
  useEffect(() => {
    if (!socket || !selectedUser) return;

    const handleReceive = ({ userId, message }) => {
      if (userId === selectedUser._id) {
        setUserMessages((prev) => [
          ...prev,
          { _id: userId, from: "user", text: message },
        ]);

        // Update context (so future reload has the message)
        setUsers((prevUsers) =>
          prevUsers.map((u) =>
            u._id === selectedUser._id
              ? {
                  ...u,
                  Messages: [
                    ...(u.Messages || []),
                    { _id: userId, from: "user", text: message },
                  ],
                }
              : u
          )
        );
      }
    };

    socket.on("receive-message", handleReceive);
    return () => {
      socket.off("receive-message", handleReceive);
    };
  }, [socket, selectedUser]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || !selectedUser || !user) return;

    const newMessage = { _id: user._id, from: "me", text };

    // Locally update visible messages
    setUserMessages((prev) => [...prev, newMessage]);

    // Emit the message
    socket.emit("send-message", {
      sender: user._id,
      receiver: selectedUser._id,
      message: text,
    });

    // ✅ Also update context (users list)
    setUsers((prevUsers) =>
      prevUsers.map((u) =>
        u._id === selectedUser._id
          ? {
              ...u,
              Messages: [...(u.Messages || []), newMessage],
            }
          : u
      )
    );

    setInput("");
  };

  const handleEmojiClick = (emojiData) => {
    setInput((prev) => prev + emojiData.emoji);
  };

  const handleHeaderClick = () => {
    setShowModal(true);
  };

  return (
    <div className={styles.userChat}>
      {selectedUser ? (
        <>
          <div className={styles.header} onClick={handleHeaderClick}>
            {onBack && (
              <button
                className={styles.backBtn}
                onClick={(e) => {
                  e.preventDefault();
                  onBack();
                }}
              >
                ← Back
              </button>
            )}
            <img
              src={selectedUser.profilePic || defaultAvatar}
              alt={selectedUser.name}
              className={styles.profilePic}
            />
            <div className={styles.userInfo}>
              <h3>{selectedUser.name}</h3>
              <span className={styles.status}>
                {selectedUser.isOnline ? "online" : "last seen: todo"}
              </span>
              {isTyping && (
                <div className={styles.typingIndicator}>Typing...</div>
              )}
            </div>
          </div>
          {/* by clicking  on the header  selected user info model is visible */}
          {showModal && (
            <UserInfoModal
              user={selectedUser}
              onClose={() => setShowModal(false)}
            />
          )}

          <div className={styles.chatBody}>
            {loadingMessages ? (
              <div className={styles.loadingMsg}>
                <ClipLoader size={40} color="blue" />
              </div>
            ) : (
              userMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={
                    msg.from === "me" ? styles.myMessage : styles.theirMessage
                  }
                >
                  {msg.text}
                </div>
              ))
            )}
          </div>

          <div className={styles.inputArea}>
            <button
              className={styles.emojiBtn}
              onClick={() => setShowEmojiPicker((v) => !v)}
            >
              😊
            </button>
            {showEmojiPicker && (
              <div className={styles.emojiPicker}>
                <EmojiPicker onEmojiClick={handleEmojiClick} />
              </div>
            )}
            <input
              className={styles.input}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type a message..."
            />
            <button className={styles.sendBtn} onClick={handleSend}>
              <AiOutlineSend size={20} />
            </button>
          </div>
        </>
      ) : (
        <EmptyChatPlaceholder />
      )}
    </div>
  );
}
