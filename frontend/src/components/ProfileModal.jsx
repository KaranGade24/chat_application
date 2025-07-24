import React, { useState } from "react";
import styles from "./ProfileModal.module.css";
import { MdPerson } from "react-icons/md"; // Assuming you want to
//  use this icon
import defaultAvatar from "../assets/defaultAvatar.png"; // Assuming you have a default avatar image

const ProfileModal = ({ user, isOpen, onClose, onUpdate }) => {
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState(user);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = () => {
    onUpdate(formData);
    setEditMode(false);
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button className={styles.closeBtn} onClick={onClose}>
          &times;
        </button>
        <h2>{editMode ? "Edit Profile" : "User Profile"}</h2>

        <div className={styles.profileSection}>
          {editMode ? (
            // <label htmlFor="">
            <div>
              <label htmlFor="avatar" className={styles.avatarLabel}>
                Upload Avatar
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    avatar: URL.createObjectURL(e.target.files[0]),
                  })
                }
              />
            </div>
          ) : (
            <img
              src={user?.avatar?.url || defaultAvatar}
              alt="User Avatar"
              className={styles.avatar}
            />
          )}

          <div className={styles.fieldGroup}>
            <label>Name:</label>
            {editMode ? (
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
            ) : (
              <p>{user.name}</p>
            )}
          </div>

          <div className={styles.fieldGroup}>
            <label>Email:</label>
            <p>{formData.email}</p>
          </div>

          <div className={styles.buttonGroup}>
            {editMode ? (
              <>
                <button className={styles.saveBtn} onClick={handleUpdate}>
                  Save
                </button>
                <button
                  className={styles.cancelBtn}
                  onClick={() => setEditMode(false)}
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                className={styles.editBtn}
                onClick={() => setEditMode(true)}
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
