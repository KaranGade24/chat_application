import React, { useContext, useState } from "react";
import styles from "./UserList.module.css";
import { FiPhone, FiVideo } from "react-icons/fi";
import MessageContextProvider, {
  useMessageContext,
} from "../store/Messages/MessageContextProvider";
import AddFriendModal from "./AddFriendModal";
import defaultAvatar from "../assets/defaultAvatar.png";
import MessageContext from "../store/Messages/MessageContext";

function UserList({ handleOnClick, selectedUser, onAction, mode = "chat" }) {
  const { users, user: currentUser } = useMessageContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { userStatuses } = useContext(MessageContext);

  const handleAddClick = () => {
    setIsModalOpen(true);
  };

  return (
    <div className={styles.userList}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h2 className={styles.title}>Users</h2>
        <button
          onClick={handleAddClick}
          className={styles.addBtn}
          title="Add Friend"
        >
          ➕
        </button>
      </div>

      {isModalOpen && (
        <AddFriendModal
          user={currentUser}
          onClose={() => setIsModalOpen(false)}
        />
      )}

      <ul className={styles.userItems}>
        {users.map((user, index) => (
          <li
            key={index}
            onClick={(e) => {
              if (mode === "chat") handleOnClick?.(e, user);
            }}
            className={styles.userItem}
            style={{
              backgroundColor:
                selectedUser?._id === user._id
                  ? "#968e8e9d"
                  : "hsl(0deg 0% 100%)",
            }}
          >
            <img
              src={user.profilePic || defaultAvatar}
              alt={user.name}
              className={styles.profilePic}
            />
            <div className={styles.userInfo}>
              <p className={styles.userName}>{user.name}</p>
              <span
                style={{ color: "black" }}
                className={`${styles.status} ${styles[user.status]}`}
              >
                {userStatuses.find((u) => u._id === user._id)?.isOnline
                  ? "online"
                  : userStatuses.find((u) => u._id === user._id)?.lastSeen
                  ? `last seen: ${new Date(
                      userStatuses.find((u) => u._id === user._id).lastSeen
                    ).toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    })}`
                  : "offline"}
              </span>

              {mode === "video" && (
                <div className={styles.actions}>
                  <FiPhone
                    className={styles.icon}
                    onClick={(e) => {
                      e.stopPropagation();
                      onAction?.(user, "voice");
                    }}
                    title="Voice Call"
                  />
                  <FiVideo
                    className={styles.icon}
                    onClick={(e) => {
                      e.stopPropagation();
                      onAction?.(user, "video");
                    }}
                    title="Video Call"
                  />
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default UserList;
