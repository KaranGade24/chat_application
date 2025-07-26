import React, { useState, useEffect } from "react";
import MessageContext from "./MessageContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import Socket from "../../../config/Socket";

const userdummy = [
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

export const useMessageContext = () => useContext(MessageContext);

function MessageContextProvider({ children }) {
  const [selectedUser, setSelectedUser] = useState(null);
  const [friendList, setFriendList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [messageLoadFriendList, setMessageLoadFriendList] = useState([]);
  // const navigate = useNavigate();

  const fetchCurrentUser = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/auth/me`, {
        withCredentials: true,
      });

      console.log("Fetched current user:", res.data);
      setUser(res.data.user);
    } catch (err) {
      console.error("Auth error:", err?.response?.status, err?.response?.data);

      // 401 Unauthorized
      if (err?.response?.status === 401) {
        setUser(null);
        // navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchFriendList = async (userId) => {
    if (!userId) return;

    setLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/friends/${userId}`,
        { withCredentials: true }
      );

      console.log("Friend list:", res.data);
      setFriendList(res.data.friends || []);
    } catch (err) {
      console.error(
        "Error fetching friends:",
        err?.response?.data || err.message
      );
    } finally {
      setLoading(false);
    }
  };

  const getMessagesOnUserSelect = async (senderId, receiverId) => {
    try {
      console.log("in sencond fun");
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/messages`,
        {
          params: { senderId, receiverId },
          withCredentials: true,
        }
      );

      const formatted = response.data.map((msg) => {
        console.log(msg.sender, msg.receiver);
        return {
          _id: msg.sender === senderId ? senderId : msg.receiver,
          from: msg.sender === senderId ? "me" : "user",
          text: msg.message,
        };
      });

      return formatted;
    } catch (error) {
      console.error("Error fetching messages:", error);
      return [];
    }
  };

  const updateFriendMessages = async (senderId, receiverId) => {
    console.log("in first func");

    const messages = await getMessagesOnUserSelect(senderId, receiverId);

    setFriendList((prevList) =>
      prevList.map((friend) =>
        friend._id === receiverId ? { ...friend, Messages: messages } : friend
      )
    );
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (user && user._id) {
      fetchFriendList(user._id);
    }
  }, [user]);

  useEffect(() => {
    const socket = Socket(user);
    if (selectedUser && user) {
      console.log("in selected uder to get msgss");
      if (messageLoadFriendList.includes(selectedUser._id)) return;
      setMessageLoadFriendList((prev) => [...prev, selectedUser._id]);
      updateFriendMessages(user._id, selectedUser._id);
    }
  }, [user, selectedUser]);

  return (
    <MessageContext.Provider
      value={{
        selectedUser,
        setSelectedUser,
        users: friendList,
        user,
        loading,
        setUsers: setFriendList,
        setUser,
        setLoading,
        updateFriendMessages,
        setMessageLoadFriendList,
        messageLoadFriendList,
      }}
    >
      {children}
    </MessageContext.Provider>
  );
}

export default MessageContextProvider;
