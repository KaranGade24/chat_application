import React, { useState } from "react";
import MessageContext from "./MessageContext";

const user = [
  {
    id: 1,
    name: "Aarav Sharma",
    email: "aarav.sharma@example.com",
    status: "online",
    profilePic: "https://randomuser.me/api/portraits/men/11.jpg",
    Messages: [
      { from: "me", text: "Hey, how are you?" },
      { from: "user", text: "I'm good, thanks! How about you?" },
      { from: "me", text: "Doing well, just busy with work." },
    ],
  },
  {
    id: 2,
    name: "Meera Desai",
    email: "meera.desai@example.com",
    status: "offline",
    profilePic: "https://randomuser.me/api/portraits/women/44.jpg",
    Messages: [
      { from: "me", text: "Hey Meera, did you get my email?" },
      { from: "user", text: "Yes, I saw it this morning." },
      { from: "me", text: "Great, let me know your thoughts." },
    ],
  },
  {
    id: 3,
    name: "Rahul Verma",
    email: "rahul.verma@example.com",
    status: "away",
    profilePic: "https://randomuser.me/api/portraits/men/32.jpg",
    Messages: [
      { from: "me", text: "Are you joining the meeting today?" },
      { from: "user", text: "I might be a little late." },
      { from: "me", text: "No problem, join when you're ready." },
    ],
  },
  {
    id: 4,
    name: "Anjali Mehta",
    email: "anjali.mehta@example.com",
    status: "busy",
    profilePic: "https://randomuser.me/api/portraits/women/68.jpg",
    Messages: [
      { from: "me", text: "Hi Anjali, can we catch up later?" },
      { from: "user", text: "Sure, maybe after 6 PM?" },
      { from: "me", text: "Perfect, I’ll ping you then." },
    ],
  },
  {
    id: 5,
    name: "Kunal Patil",
    email: "kunal.patil@example.com",
    status: "online",
    profilePic: "https://randomuser.me/api/portraits/men/85.jpg",
    Messages: [
      { from: "me", text: "Yo! What’s the plan for the weekend?" },
      { from: "user", text: "Thinking of going on a trek!" },
      { from: "me", text: "Nice! Count me in." },
    ],
  },
];

function MessageContextProvider({ children }) {
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState(user);
  console.log("users:", users);

  return (
    <MessageContext.Provider
      value={{
        selectedUser,
        setSelectedUser,
        users,
        setUsers,
      }}
    >
      {children}
    </MessageContext.Provider>
  );
}

export default MessageContextProvider;
