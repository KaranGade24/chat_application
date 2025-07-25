import React, { useState, useContext, useEffect } from "react";
import styles from "./ProfilePage.module.css";
import { FaEnvelope, FaUser, FaLock, FaCamera } from "react-icons/fa";
import MessageContext from "../../store/Messages/MessageContext";

const ProfilePage = () => {
  const { user, onUpdateProfile } = useContext(MessageContext);
  const [form, setForm] = useState({
    name: "",
    email: "",
    bio: "",
    avatar: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [editMode, setEditMode] = useState(false);
  const [showPwdFields, setShowPwdFields] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name,
        email: user.email,
        bio: user.bio || "",
        avatar: user.avatar?.url || "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAvatar = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm({ ...form, avatar: URL.createObjectURL(file) });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdateProfile(form);
    setEditMode(false);
    setShowPwdFields(false);
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.avatarWrapper}>
            {form.avatar ? (
              <img src={form.avatar} alt="Avatar" className={styles.avatar} />
            ) : (
              <FaUser className={styles.avatarIcon} />
            )}
            {editMode && (
              <label htmlFor="avatarUpload" className={styles.cameraLabel}>
                <FaCamera />
                <input
                  id="avatarUpload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatar}
                  hidden
                />
              </label>
            )}
          </div>
          <h1 className={styles.title}>My Profile</h1>
          <button
            className={styles.editToggle}
            onClick={() => {
              setEditMode(!editMode);
              setShowPwdFields(false);
            }}
          >
            {editMode ? "Cancel" : "Edit Profile"}
          </button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <FaUser className={styles.fieldIcon} />
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Full Name"
              disabled={!editMode}
              required
            />
          </div>

          <div className={styles.field}>
            <FaEnvelope className={styles.fieldIcon} />
            <input
              type="email"
              name="email"
              value={form.email}
              disabled={true}
            />
          </div>

          <div className={styles.field}>
            <svg
              className={styles.fieldIcon}
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm0 2c-3.3 0-10 1.7-10 5v3h20v-3c0-3.3-6.7-5-10-5z"
                stroke="#555"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <textarea
              name="bio"
              value={form.bio}
              onChange={handleChange}
              placeholder="Bio (optional)"
              disabled={!editMode}
              rows="3"
            />
          </div>

          {editMode && (
            <>
              {/* <button
                type="button"
                className={styles.pwdToggle}
                onClick={() => setShowPwdFields(!showPwdFields)}
              >
                <FaLock className={styles.fieldIcon} />
                {showPwdFields ? "Hide Password Fields" : "Change Password"}
              </button> */}

              {/* {showPwdFields && (
                <>
                  <div className={styles.field}>
                    <FaLock className={styles.fieldIcon} />
                    <input
                      type="password"
                      name="currentPassword"
                      value={form.currentPassword}
                      onChange={handleChange}
                      placeholder="Current Password"
                      required
                    />
                  </div> */}
              {/* <div className={styles.field}>
                    <FaLock className={styles.fieldIcon} />
                    <input
                      type="password"
                      name="newPassword"
                      value={form.newPassword}
                      onChange={handleChange}
                      placeholder="New Password"
                      required
                    />
                  </div> */}
              {/* <div className={styles.field}>
                    <FaLock className={styles.fieldIcon} />
                    <input
                      type="password"
                      name="confirmPassword"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm New Password"
                      required
                    />
                  </div> */}
              {/* </> */}
              {/* )} */}

              <button type="submit" className={styles.saveBtn}>
                Save Changes
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
