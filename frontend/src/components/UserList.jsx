import React, { useContext, useState } from "react";
import styles from "./UserList.module.css";
import MessageContext from "../store/Messages/MessageContext";

function UserList({ handleOnClick, selectedUser }) {
  const { users } = useContext(MessageContext);
  console.log(users);
  return (
    <div className={styles.userList}>
      <h2 className={styles.title}>Users</h2>
      <ul className={styles.userItems}>
        {users.map((user) => (
          <li
            onClick={(e) => {
              handleOnClick(e, user);
              console.log("clicked");
            }}
            key={user.id}
            className={styles.userItem}
            style={{
              backgroundColor:
                selectedUser?.id === user.id
                  ? "#968e8e9d"
                  : "hsl(0deg 0% 100%)",
            }}
          >
            <img
              src={user.profilePic}
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
