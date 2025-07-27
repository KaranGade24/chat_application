import React, { useState, useEffect } from "react";
import MessageContext from "./MessageContext";
import axios from "axios";
import { useContext } from "react";
import Socket from "../../../config/Socket";

export const useMessageContext = () => useContext(MessageContext);

function MessageContextProvider({ children }) {
  const [selectedUser, setSelectedUser] = useState(null);
  const [friendList, setFriendList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [messageLoadFriendList, setMessageLoadFriendList] = useState([]);
  const [userStatuses, setUserStatuses] = useState([]);
  // const navigate = useNavigate();

  const fetchCurrentUser = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/auth/me`, {
        withCredentials: true,
      });

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
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/messages`,
        {
          params: { senderId, receiverId },
          withCredentials: true,
        }
      );

      const formatted = response.data.map((msg) => {
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
      if (messageLoadFriendList.includes(selectedUser._id)) return;
      setMessageLoadFriendList((prev) => [...prev, selectedUser._id]);
      updateFriendMessages(user._id, selectedUser._id);
    }
  }, [user, selectedUser]);

  useEffect(() => {
    const socket = Socket(user);

    if (!socket) return;

    socket.on("user-statuses", (updatedStatuses) => {
      setUserStatuses(updatedStatuses);
    });
  }, [window.location.href]);

  useEffect(() => {
    const socket = Socket(user);

    if (!socket) return;

    if (!friendList || friendList.length === 0) return;

    // Trigger a status check manually (on mount or user change)
    socket.emit("check-user-online", friendList, (statusList) => {
      setUserStatuses(statusList);
    });
  }, [friendList, selectedUser]);

  //listen incomming call

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
        userStatuses,
        setUserStatuses,
      }}
    >
      {children}
    </MessageContext.Provider>
  );
}

export default MessageContextProvider;
