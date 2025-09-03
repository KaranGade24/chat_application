import styles from "./UserInfoModal.module.css";
import defaultAvatar from "../assets/defaultAvatar.png";
import axios from "axios";
import { useContext, useState } from "react";
import MessageContext from "../store/Messages/MessageContext";
import { toast } from "react-toastify";

const UserInfoModal = ({ user, onClose, onBack, selectedUserStatus }) => {
  const {
    user: currentUser,
    setUsers,
    selectedUser,
  } = useContext(MessageContext);
  const [loading, setLoading] = useState(false);

  const handleDeleteForBoth = async () => {
    // Remove each other from friend list
    try {
      setLoading(true);
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
    } catch (err) {
      toast.error("Something went wrong", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <button className={styles.closeBtn} onClick={onClose}>
          ×
        </button>
        <img
          src={user.avatar?.url || defaultAvatar}
          alt={user?.name}
          className={styles.avatar}
        />
        <h2>{user?.name}</h2>
        <p>
          <h3>User ID:</h3>
          {user?.email}
        </p>
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
            : ""}
        </p>
        <div className={styles.buttonContainer}>
          <button
            disabled={loading}
            className={styles.deleteBothBtn}
            onClick={handleDeleteForBoth}
          >
            {loading ? "Deleting..." : "❌ Delete user"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserInfoModal;
