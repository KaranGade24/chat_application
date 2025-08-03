import styles from "./UserInfoModal.module.css";
import defaultAvatar from "../assets/defaultAvatar.png";
import axios from "axios";
import { useContext } from "react";
import MessageContext from "../store/Messages/MessageContext";

const UserInfoModal = ({ user, onClose, onBack, selectedUserStatus }) => {
  const {
    user: currentUser,
    setUsers,
    selectedUser,
  } = useContext(MessageContext);
  const handleDeleteForYou = async () => {
    // Remove receiver from current user's friend list
    const response = await axios.delete(
      `${import.meta.env.VITE_API_URL}/friends/delete-friend`,
      {
        data: {
          currentUserId: currentUser._id,
          targetUserId: selectedUser._id,
        },
        withCredentials: true,
      }
    );
    if (response.status === 200) {
      setUsers(response.data.updatedUser.friends);
      onBack();
      onClose(); // close modal
    }
  };

  const handleDeleteForBoth = async () => {
    // Remove each other from friend list
    const res = await axios.delete(
      `${import.meta.env.VITE_API_URL}/friends/delete-both-user-from-side`,
      {
        data: {
          currentUserId: currentUser._id,
          targetUserId: selectedUser._id,
        },
        withCredentials: true,
      }
    );
    if (res.status === 200) {
      setUsers(res.data.friends);
      onBack();
      onClose(); // close modal
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <button className={styles.closeBtn} onClick={onClose}>
          ×
        </button>
        <img
          src={user.profilePic || defaultAvatar}
          alt={user.name}
          className={styles.avatar}
        />
        <h2>{user.name}</h2>
        <p>
          Status:
          {selectedUserStatus?.isOnline
            ? "online"
            : selectedUserStatus?.lastSeen
            ? `last seen: ${new Date(
                selectedUserStatus.lastSeen
              ).toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              })}`
            : "offline"}
        </p>
        <div className={styles.buttonContainer}>
          <button className={styles.deleteOneBtn} onClick={handleDeleteForYou}>
            🗑️ Delete for You
          </button>
          <button
            className={styles.deleteBothBtn}
            onClick={handleDeleteForBoth}
          >
            ❌ Delete for Both
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserInfoModal;
