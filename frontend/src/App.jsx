import { Outlet, useNavigate } from "react-router-dom";
import "./App.css";
import Header from "./components/Header";
import SideBar from "./components/SideBar";
import { useContext, useEffect, useMemo, useState } from "react";
import MessageContext from "./store/Messages/MessageContext";
import FullPageLoader from "./components/FullPageLoader";
import { toast, ToastContainer } from "react-toastify";
import IncomingCallModal from "./components/IncomingCallModal";
import CallerContext from "./store/CallerContext/CallerContext";
import Socket from "../config/Socket";
import AfterAcceptingCall from "./components/AfterAcceptingCall";
import senderCallRing from "./assets/senderCallRing.mp3";
import receiverCallRing from "./assets/receiverCallRing.mp3";
import CallVideoPage from "./pages/CallVideoPage/CallVideoPage";

function App() {
  const {
    loading,
    user: currentUser,
    users,
    setUserStatuses,
    fetchFriendList,
  } = useContext(MessageContext);
  const navigate = useNavigate();

  const {
    callRef,
    answerCall,
    callState,
    mode,
    endCall,
    callInfo,
    activeUser,
  } = useContext(CallerContext);

  useEffect(() => {
    if (loading) {
      return; // Prevent navigation while loading
    }
    // If user is not authenticated, redirect to login
    if (!currentUser) {
      navigate("/");
    }
  }, [currentUser, navigate, loading]);

  useEffect(() => {
    if (!currentUser) return;
    const socket = Socket(currentUser);

    if (!socket) return;
    if (!users || users.length === 0) return;

    socket.on("add-friend", (newUser) => {
      console.log("new user:", newUser);
      // // alert("new user added");
      // const user = users.find((u) => u._id === newUser._id);
      // const currUser = currentUser._id === newUser._id ? true : false;

      // if (user || currUser) return;
      // // console.log({ currentUser });

      toast.success(`${newUser.name} is now your friend!`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light", // or "dark", "colored"
        newestOnTop: true,
        pauseOnFocusLoss: true,
        rtl: false, // for right-to-left languages
        icon: true, // or pass a custom icon component
        role: "alert", // for accessibility
      });
      setTimeout(() => {
        fetchFriendList(currentUser._id);
      }, 1000);
      // return;
      // setUsers((prev) => [newUser, ...prev]);

      console.log("new user is set", { users, newUser });
    });

    let timeOutForFetchFriends = null;
    socket.on("delete-friend", async (userId) => {
      console.log("delete friend:");

      timeOutForFetchFriends = setTimeout(async () => {
        await fetchFriendList(currentUser._id);
      }, 1000);

      toast.success(`Friend removed`, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    });

    return () => {
      if (timeOutForFetchFriends) {
        clearTimeout(timeOutForFetchFriends);
      }
      socket.off("add-friend");
      socket.off("delete-friend");
    };
  }, [currentUser, users]);

  useEffect(() => {
    const socket = Socket(currentUser);

    if (!socket) return;

    if (!users || users.length === 0) return;

    // Trigger a status check manually (on mount or user change)
    socket.emit("check-user-online", users, (statusList) => {
      setUserStatuses(statusList);
    });
  }, [users, window.location.href]);

  useEffect(() => {
    if (!currentUser) return;

    let socket = Socket(currentUser);

    if (!socket) {
      socket = Socket(currentUser);
    }

    socket.on("user-statuses", (updatedStatuses) => {
      setUserStatuses(updatedStatuses);
    });
  }, [currentUser]);

  useEffect(() => {
    if (callRef.current === "incomingCall" || callState === "incomingCall") {
      activeUser.current = users.filter((u) => u._id === callInfo.current.from);
    }
  }, [callRef.current, users]);
  return (
    <div className="app">
      {(callRef.current === "incomingCall" ||
        callRef.current === "callRequest" ||
        callState === "incomingCall" ||
        callState === "callRequest") && (
        <audio
          loop={true}
          autoPlay={true}
          src={
            callRef.current === "callRequest" || callState === "callRequest"
              ? senderCallRing
              : callRef.current === "incomingCall" ||
                callState === "incomingCall"
              ? receiverCallRing
              : ""
          }
        ></audio>
      )}

      {loading ? (
        <FullPageLoader />
      ) : currentUser ? (
        <>
          <ToastContainer position="top-right" autoClose={3000} />
          <SideBar />
          <div className="main">
            <Header />
            <Outlet />
          </div>

          {(callState === "callRequest" ||
            callRef.current === "callRequest") && <CallVideoPage />}

          {(callState === "callAccepted" ||
            callRef.current === "callAccepted") && (
            <AfterAcceptingCall mode={mode.current} />
          )}

          {(callState === "incomingCall" ||
            callRef.current === "incomingCall") && (
            <IncomingCallModal
              onAccept={() => {
                answerCall();
              }}
              endCall={() => {
                endCall();
              }}
              caller={
                users.find((u) => u._id === callInfo.current.from) || {
                  name: "Unknown",
                }
              }
            />
          )}
        </>
      ) : (
        <div className="unauthenticated">
          <h1>Please log in to continue</h1>
          <button onClick={() => navigate("/login")}>Go to Login</button>
        </div>
      )}
    </div>
  );
}

export default App;
