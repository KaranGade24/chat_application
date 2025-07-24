import { io } from "socket.io-client";

let socket = null;

const Socket = (currentUser) => {
  if (!socket && currentUser?._id) {
    socket = io(import.meta.env.VITE_API_URL, {
      transports: ["websocket"],
      query: { userId: currentUser._id },
      withCredentials: true,
    });
  }

  return socket;
};

export default Socket;
