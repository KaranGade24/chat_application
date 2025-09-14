// src/components/UserChat/UserChat.jsx
import { useEffect, useState, useMemo, useRef } from "react";
import styles from "./UserChat.module.css";
import EmojiPicker from "emoji-picker-react";
import EmptyChatPlaceholder from "./EmptyChatPlaceholder";
import { AiOutlineSend } from "react-icons/ai";
import defaultAvatar from "../assets/defaultAvatar.png";
import Socket from "../../config/Socket";
import { useMessageContext } from "../store/Messages/MessageContextProvider";
import { ClipLoader } from "react-spinners";
import UserInfoModal from "./UserInfoModal";
import { ArrowLeft, FileUpIcon } from "lucide-react";
import axios from "axios";
import SelectedFilesPreview from "./SelectedFilesPreview";
import { v4 as uuidv4 } from "uuid";

export default function UserChat({
  selectedUser,
  onBack,
  showModal,
  setShowModal,
}) {
  const {
    user,
    updateFriendMessages,
    setMessageLoadFriendList,
    messageLoadFriendList,
    users,
    setUsers,
    setUserStatuses,
    userStatuses,
  } = useMessageContext();
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [userMessages, setUserMessages] = useState([]);
  const [input, setInput] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedUserStatus, setSelectedUserStatus] = useState(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);
  const [selectedFilesPreviewModel, setSelectedFilesPreviewModel] =
    useState(false);
  const [files, setFiles] = useState([]);
  const userStatus = useRef(null);
  // Initialize socket once per user
  const socket = useMemo(() => {
    if (!user) return null;
    return Socket(user);
  }, [user]);
  const [loadingToSendFiles, setLoadingToSendFiles] = useState(false);

  // listen is online or lastSeen
  useEffect(() => {
    const status = userStatuses.find((u) => u._id === selectedUser?._id);
    let statusText = "";
    if (status?.isOnline) {
      statusText = "online";
    } else if (status?.lastSeen) {
      const formatted = new Intl.DateTimeFormat("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(status.lastSeen));
      statusText = `last seen: ${formatted}`;
    }
    userStatus.current = statusText;
  }, [userStatuses, user]);

  useEffect(() => {
    // Listen to real-time broadcast of all user statuses from server
    socket.on("user-statuses", (updatedStatuses) => {
      setUserStatuses(updatedStatuses);

      const current = updatedStatuses.find((u) => u._id === selectedUser?._id);
      if (current) {
        setSelectedUserStatus(current);
      }
    });

    return () => {
      socket.off("user-statuses");
    };
  }, [selectedUser]);

  useEffect(() => {
    if (!users || users.length === 0) return;

    // Trigger a status check manually (on mount or user change)
    socket.emit("check-user-online", users, (statusList) => {
      setUserStatuses(statusList);

      const current = statusList.find((u) => u._id === selectedUser?._id);
      if (current) {
        setSelectedUserStatus(current);
      }
    });
  }, [users, selectedUser]);

  //is typing...

  useEffect(() => {
    if (!socket || !selectedUser) return;

    if (input.trim() === "") {
      socket.emit("isTyping", {
        isTyping: false,
        receiverId: selectedUser._id,
      });
      return;
    }

    socket.emit("isTyping", {
      isTyping: true,
      receiverId: selectedUser._id,
    });

    // Clear existing timeout if user is still typing
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("isTyping", {
        isTyping: false,
        receiverId: selectedUser._id,
      });
    }, 2000);

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [input]);

  useEffect(() => {
    if (!socket || !selectedUser || !user) {
      return;
    }

    const handleTyping = ({ isTyping, senderId }) => {
      // Show typing only if the selectedUser (friend) is the one typing
      if (user._id === senderId) {
        setIsTyping(isTyping);
      }
    };

    socket.on("isTyping", handleTyping);

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
  }, [userMessages, selectedFilesPreviewModel, users]);

  // Listen for incoming messages over socket
  useEffect(() => {
    if (!socket || !selectedUser) return;

    const handleReceive = ({ userId, message }) => {
      if (userId === selectedUser._id) {
        setUserMessages((prev) => [
          ...prev,
          {
            _id: userId,
            from: "user",
            text: message?.text ? message?.text : "",
            attachments: message?.attachments ? message?.attachments : [],
          },
        ]);

        // Update context (so future reload has the message)
        setUsers((prevUsers) =>
          prevUsers.map((u) =>
            u._id === selectedUser._id
              ? {
                  ...u,
                  Messages: [
                    ...(u.Messages || []),
                    {
                      _id: userId,
                      from: "user",
                      text: message?.text ? message.text : "",
                      attachments: message?.attachments || [],
                    },
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

  // Remove a file from the selected files preview
  const onRemoveFile = (index) => {
    const filteredFiles = files.filter((_, i) => i !== index);
    setFiles(filteredFiles);
  };

  //handel file input with upto limt of 10MB file user can upload
  const handleFileInput = async (selectedFiles) => {
    const files = Array.from(selectedFiles);
    const maxSizeInBytes = 10 * 1024 * 1024; // 10MB

    const validFiles = [];
    for (const file of files) {
      if (file.size > maxSizeInBytes) {
        alert(
          `File "${file?.name}" exceeds the 10MB limit and will be skipped.`
        );
      } else {
        validFiles.push(file);
      }
    }

    if (validFiles.length > 0) {
      const formData = new FormData();
      validFiles.forEach((file) => {
        formData.append("files", file);
      });

      // Add other fields like receiver and sender to FormData
      formData.append("receiverId", selectedUser._id);
      formData.append("senderId", user._id);
      try {
        const res = await axios.post(
          `${import.meta.env.VITE_API_URL}/chatfiles`,
          formData,
          {
            withCredentials: true,
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        if (res.status === 201) {
          console.log(res.data);
          const msg = {
            _id: res.data._id || uuidv4(),
            from: "me",
            text: "",
            attachments: res.data.attachments,
          };

          socket.emit("send-message", {
            sender: user._id,
            receiver: selectedUser._id,
            message: {
              text: "",
              attachments: [...res.data.attachments],
              isFile: true,
            },
          });

          setUserMessages((prev) => [...prev, msg]);

          setUsers((prevUsers) =>
            prevUsers.map((u) =>
              u._id === selectedUser._id
                ? {
                    ...u,
                    Messages: [...(u.Messages || []), msg],
                  }
                : u
            )
          );
        }
      } catch (err) {
        console.error("Upload failed:", err);
      } finally {
        setLoadingToSendFiles(false);
      }
    }

    setFiles([]);
    setSelectedFilesPreviewModel(false);
  };

  const handleSend = () => {
    const msg = input.trim();
    if (!msg || !selectedUser || !user) return;

    const newMessage = {
      _id: user._id,
      from: "me",
      sender: user._id,
      receiver: selectedUser._id,
      text: msg,
    };

    // Locally update visible messages
    setUserMessages((prev) => [...prev, newMessage]);

    // Emit the message
    socket.emit("send-message", {
      sender: user._id,
      receiver: selectedUser._id,
      message: { text: msg, isFile: false },
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
          <div
            className={styles.header}
            onClick={(e) => {
              e.preventDefault();
              handleHeaderClick();
            }}
          >
            {onBack && (
              <button
                className={styles.backBtn}
                onClick={(e) => {
                  e.preventDefault();
                  onBack();
                }}
              >
                <ArrowLeft size={18} strokeWidth={2.2} />
              </button>
            )}
            <img
              src={selectedUser.avatar?.url || defaultAvatar}
              alt={selectedUser?.name}
              className={styles.profilePic}
            />
            <div className={styles.userInfo}>
              <h3>{selectedUser?.name}</h3>
              <span className={styles.status}>{userStatus?.current}</span>
              {isTyping && (
                <div className={styles.typingIndicator}>Typing...</div>
              )}
            </div>
          </div>
          {/* by clicking  on the header  selected user info model is visible */}
          {showModal && (
            <UserInfoModal
              selectedUserStatus={selectedUserStatus}
              user={selectedUser}
              onBack={onBack}
              onClose={(e) => {
                // e.preventDefault();
                setShowModal(false);
              }}
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
                  style={{
                    backgroundColor: msg?.attachments?.length
                      ? "hsl(287deg 29% 47% / 49%)"
                      : "",
                    padding: msg?.attachments?.length ? "5px 5px" : "",
                  }}
                >
                  <p style={{ margin: "0px" }}> {msg.text}</p>
                  <div className={styles.attachmentWrapper}>
                    {msg?.attachments &&
                      msg.attachments.map((file, idx) => {
                        const fileType = file?.type;
                        const fileURL = file?.url;

                        return (
                          <div key={idx}>
                            {fileType?.startsWith("image/") ? (
                              <a
                                href={fileURL}
                                download={file.originalname}
                                target="_blank"
                              >
                                <img
                                  src={fileURL}
                                  alt={file.originalname || "image"}
                                  className={styles.chatImage}
                                />
                              </a>
                            ) : fileType?.startsWith("video/") ? (
                              <a
                                href={fileURL}
                                download={file.originalname}
                                target="_blank"
                              >
                                {" "}
                                <video
                                  controls
                                  src={fileURL}
                                  className={styles.chatVideo}
                                ></video>{" "}
                              </a>
                            ) : fileType === "application/pdf" ? (
                              <a
                                href={fileURL}
                                download={file.originalname}
                                target="_blank"
                              >
                                <embed
                                  src={fileURL}
                                  type="application/pdf"
                                  width="100%"
                                  height="200px"
                                  className={styles.chatPDF}
                                />
                              </a>
                            ) : (
                              <a
                                href={fileURL}
                                download={file.originalname}
                                className={styles.chatFileDownload}
                              >
                                📄 {file.originalname}
                              </a>
                            )}
                          </div>
                        );
                      })}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className={styles.inputArea}>
            {!selectedFilesPreviewModel && (
              <>
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
              </>
            )}

            <span className={styles.fileInput}>
              <input
                multiple
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={(e) => {
                  e.preventDefault();
                  setSelectedFilesPreviewModel(true);
                  setFiles(Array.from(e.target.files));
                }}
              />

              {selectedFilesPreviewModel && (
                <SelectedFilesPreview
                  onSendFiles={handleFileInput}
                  files={files}
                  onRemoveFile={onRemoveFile}
                  loading={loadingToSendFiles}
                />
              )}

              <button
                onClick={() => fileInputRef.current?.click()}
                style={{ margin: "5px" }}
              >
                <FileUpIcon />
              </button>
            </span>

            {!selectedFilesPreviewModel && (
              <input
                className={styles.input}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Type a message..."
              />
            )}
            <button
              className={styles.sendBtn}
              onClick={(e) => {
                e.preventDefault;
                if (selectedFilesPreviewModel) {
                  handleFileInput(files);
                  setLoadingToSendFiles(true);
                } else {
                  handleSend();
                }
              }}
            >
              <AiOutlineSend className={styles.sendIcon} />
            </button>
          </div>
        </>
      ) : (
        <EmptyChatPlaceholder />
      )}
    </div>
  );
}
