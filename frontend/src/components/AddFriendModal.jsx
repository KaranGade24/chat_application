import React, { useState } from "react";
import styles from "./AddFriendModal.module.css";
import axios from "axios";
import { useMessageContext } from "../store/Messages/MessageContextProvider";
import { toast } from "react-toastify";

const AddFriendModal = ({ user, onClose }) => {
  const [email, setEmail] = useState("");
  const { setFriendList } = useMessageContext();
  console.log("User in AddFriendModal:", user);
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

      // console.log(response.data.message); // "Friend added successfully"
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
      setFriendList((prev) => [response.data.friend, ...prev]);
      onClose(); // Close the modal
    } catch (error) {
      // console.error("Error adding friend");
      // console.error(
      //   "Add Friend Error:",
      //   error.response?.data?.error || error.message
      // );
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
