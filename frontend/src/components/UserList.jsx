import React, { useContext, useEffect, useState } from "react";
import styles from "./UserList.module.css";
import { FiPhone, FiVideo } from "react-icons/fi";
import MessageContextProvider, {
  useMessageContext,
} from "../store/Messages/MessageContextProvider";
import AddFriendModal from "./AddFriendModal";
import defaultAvatar from "../assets/defaultAvatar.png";
import CallerContext from "../store/CallerContext/CallerContext";
import { Plus } from "lucide-react";

function UserList({ handleOnClick, selectedUser, onAction, mode = "chat" }) {
  const { users, user: currentUser, userStatuses } = useMessageContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { callRef, setCallState } = useContext(CallerContext);
  const [, forceUpdate] = useState(0);

  const handleAddClick = () => {
    setIsModalOpen(true);
  };

  useEffect(() => {
    forceUpdate((prev) => prev + 1);
  }, [userStatuses, callRef, setCallState, users, currentUser]);

  return (
    <div className={styles.userList}>
      <div className={styles.header}>
        <h2 className={styles.title}>Users</h2>
        <button
          onClick={handleAddClick}
          className={styles.addBtn}
          title="Add Friend"
        >
          <Plus size={20} strokeWidth={2.5} /> {/* Lucide Plus icon */}
        </button>
      </div>

      {isModalOpen && (
        <AddFriendModal
          user={currentUser}
          onClose={() => setIsModalOpen(false)}
        />
      )}

      <ul className={styles.userItems}>
        {users.map((user, index) => {
          const status = userStatuses.find((u) => u._id === user._id);
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

          return (
            <li
              key={index}
              onClick={(e) => {
                if (mode === "chat") handleOnClick?.(e, user);
              }}
              className={styles.userItem}
              style={{
                backgroundColor:
                  selectedUser?._id === user._id
                    ? "hsl(216.59deg 100% 35.69%)"
                    : "hsl(219.13deg 100% 9.02%)",
              }}
            >
              <img
                src={user.avatar?.url || defaultAvatar}
                alt={user?.name}
                className={styles.profilePic}
              />
              <div className={styles.userInfo}>
                <p className={styles.userName}>{user?.name}</p>
                <span className={`${styles.status} ${styles[user.status]}`}>
                  {statusText}
                </span>

                {mode === "call" && (
                  <div className={styles.actions}>
                    <FiPhone
                      className={styles.icon}
                      onClick={(e) => {
                        e.stopPropagation();
                        callRef.current = "callRequest";
                        setCallState("callRequest");
                        onAction?.(user, "voice");
                      }}
                      title="Voice Call"
                    />
                    <FiVideo
                      className={styles.icon}
                      onClick={(e) => {
                        e.stopPropagation();
                        callRef.current = "callRequest";
                        setCallState("callRequest");
                        onAction?.(user, "video");
                      }}
                      title="Video Call"
                    />
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default UserList;
