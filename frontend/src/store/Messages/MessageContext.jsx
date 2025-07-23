import React, { createContext } from "react";

const MessageContext = createContext({
  selectedUser: null,
  setSelectedUser: () => {},
  users: [],
});

export default MessageContext;
