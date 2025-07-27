import { Outlet, useNavigate } from "react-router-dom";
import "./App.css";
import Header from "./components/Header";
import SideBar from "./components/SideBar";
import { useContext, useEffect } from "react";
import MessageContext from "./store/Messages/MessageContext";
import FullPageLoader from "./components/FullPageLoader";
import { ToastContainer } from "react-toastify";
import IncomingCallModal from "./components/IncomingCallModal";
import {
  acceptCallRequest,
  endCall,
} from "./pages/CallVideoPage/AllCallFunctions";
import CallerContext from "./store/CallerContext/CallerContext";
import Socket from "../config/Socket";
import AfterAcceptingCall from "./components/AfterAcceptingCall";

function App() {
  const { loading, user: currentUser, users } = useContext(MessageContext); // or any global loading logic

  const {
    isIncommingCall,
    setIsIncommingCall,
    serIsCurrectUser,
    localStream,
    peerConnection,
    setInCall,
    setLocalStream,
    setPeerConnection,
    setCallee,
    setCallType,
    targetUserId,
    storeSocket,
    setActiveUser,
    setMode,
    setRemoteStream,
    setCaller,
    inCall,
    remoteStream,
    mode,
    peerConnectionRef,
    setIsIncomingCall,
  } = useContext(CallerContext);
  const navigate = useNavigate();
  useEffect(() => {
    serIsCurrectUser(currentUser);
    if (loading) {
      return; // Prevent navigation while loading
    }
    // If user is not authenticated, redirect to login
    if (!currentUser) {
      navigate("/login");
    }
  }, [currentUser, navigate, loading]);

  const onReject = () => {
    endCall({
      localStream,
      peerConnection,
      setInCall,
      setLocalStream,
      setPeerConnection,
      setCallee,
      setCallType,
      setIsIncommingCall,
      targetUserId,
      storeSocket,
      setActiveUser,
      setMode,
    });
  };

  const onAccept = (isIncommingCall) => {
    acceptCallRequest(
      {
        mode: isIncommingCall.mode,
        callerId: isIncommingCall.callerId,
        offer: isIncommingCall.offer,
      },
      storeSocket,
      {
        setLocalStream,
        setRemoteStream,
        setPeerConnection,
        setInCall,
        setCaller,
        setCallType,
        peerConnectionRef,
        setIsIncomingCall,
      }
    );
  };
  console.log("incall from app", inCall);
  useEffect(() => {
    const socket = Socket(currentUser);

    if (!socket) return;

    socket.on("call-end", ({ from }) => {
      console.log("Call was ended by:", from);
    });
  }, []);

  return (
    <div className="app">
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

          {inCall && (
            <AfterAcceptingCall
              mode={mode} // either "call" or "video-call"
              localStream={localStream}
              remoteStream={remoteStream}
              onEnd={onReject} // or use endCall() here
            />
          )}

          {!inCall && isIncommingCall !== null && (
            <IncomingCallModal
              caller={users.find((u) => u._id === isIncommingCall.callerId)}
              onReject={onReject}
              onAccept={() => {
                onAccept(isIncommingCall);
              }}
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
