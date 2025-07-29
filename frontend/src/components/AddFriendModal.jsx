import React, { useEffect, useState } from "react";
import styles from "./AddFriendModal.module.css";
import axios from "axios";
import { useMessageContext } from "../store/Messages/MessageContextProvider";
import { toast } from "react-toastify";
import Socket from "../../config/Socket";

const AddFriendModal = ({ user, onClose }) => {
  const [email, setEmail] = useState("");
  const { setUsers, users, selectedUser } = useMessageContext();
  const socket = Socket(user);

  useEffect(() => {
    if (!socket) return;

    const handleAddUser = (newUser) => {
      // console.log("newuser to add:", newUser);

      const exists = users.some((u) => u._id === newUser._id);
      if (!exists) {
        if (newUser._id !== user._id) {
          setUsers((prev) => [...prev, newUser]);
        }
      }
    };

    socket.on("add-user", handleAddUser);

    return () => {
      socket.off("add-user", handleAddUser);
    };
  }, [socket, users, selectedUser, setUsers]);

  const handleSubmit = async () => {
    try {
      if (!email) return;

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/friends/add`,
        {
          userId: user._id,
          friendEmail: email,
        },
        { withCredentials: true }
      );

      if (response.status === 200) {
      }
      socket.emit("add-user", {
        newUser: response.data.friend,
        userId: response.data.friend._id,
      });
      toast.success("Friend added successfully!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light", // or "dark", "colored"
        newestOnTop: true,
        pauseOnFocusLoss: true,
        rtl: false, // for right-to-left languages
        icon: true, // or pass a custom icon component
        role: "alert", // for accessibility
      });
      setUsers((prev) => [response.data.friend, ...prev]);
      onClose(); // Close the modal
    } catch (error) {
      toast.error(
        error.response?.data?.error ||
          "Failed to add friend. Please try again.",
        {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light", // or "dark", "colored"
          newestOnTop: true,
          pauseOnFocusLoss: true,
          rtl: false, // for right-to-left languages
          icon: true, // or pass a custom icon component
          role: "alert", // for accessibility
        }
      );
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h3 className={styles.title}>Add Friend for {user.name}</h3>
        <input
          type="email"
          placeholder="Enter friend's email"
          className={styles.input}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <div className={styles.buttonGroup}>
          <button onClick={onClose} className={styles.cancelBtn}>
            Cancel
          </button>
          <button onClick={handleSubmit} className={styles.addBtn}>
            Add Friend
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddFriendModal;
