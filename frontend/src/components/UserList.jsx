import React, { useContext, useState } from "react";
import styles from "./UserList.module.css";
import MessageContext from "../store/Messages/MessageContext";
import { useMessageContext } from "../store/Messages/MessageContextProvider";
import AddFriendModal from "./AddFriendModal";
import defaultAvatar from "../assets/defaultAvatar.png"; // Assuming you have a default avatar image

function UserList({ handleOnClick, selectedUser }) {
  // const { users } = useContext(MessageContext);
  const { users, user: currentUser } = useMessageContext();
  console.log("Current User:", currentUser);
  const [isModalOpen, setIsModalOpen] = useState(false);
  console.log(users);

  const handleAddClick = () => {
    setIsModalOpen(true);
  };

  return (
    <div className={styles.userList}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h2 className={styles.title}>Users</h2>
        <button
          onClick={() => handleAddClick()}
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
            onClick={(e) => {
              handleOnClick(e, user);
            }}
            key={index}
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
              {/* <p className={styles.userEmail}>{user.email}</p> */}
              <span className={`${styles.status} ${styles[user.status]}`}>
                {user.status}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default UserList;
