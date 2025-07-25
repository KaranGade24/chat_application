import React, { createContext } from "react";

const MessageContext = createContext({
  selectedUser: null,
  setSelectedUser: () => {},
  users: [],
  user: null,
  loading: false,
  setFriendList: () => {},
  setUser: () => {},
  setLoading: () => {},
  updateFriendMessages: () => {},
  messageLoadFriendList: [],
  setMessageLoadFriendList: () => {},
  setUsers:()=>{},
});

export default MessageContext;
