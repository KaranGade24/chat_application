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
    incomingCall,
    setIncomingCall,
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
    pendingCandidatesRef,
    callRef,
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
      setIncomingCall,
      targetUserId,
      currentUserId: currentUser._id,
      storeSocket,
      setActiveUser,
      setMode,
      callRef,
    });
  };

  const onAccept = (incomingCall) => {
    acceptCallRequest(
      {
        mode: incomingCall.mode,
        callerId: incomingCall.callerId,
        offer: incomingCall.offer,
      },
      storeSocket,
      {
        setLocalStream,
        setRemoteStream,
        setPeerConnection,
        setInCall,
        setCallee,
        setCallType,
        peerConnectionRef,
        setIncomingCall,
        pendingCandidatesRef,
        callRef,
      }
    );
  };
  useEffect(() => {
    const socket = Socket(currentUser);

    if (!socket) return;

    socket.on("call-end", ({ from }) => {});
  }, []);

  // console.log("incomingCall", mode);
  console.log("callRef.current", callRef.current);

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

          {callRef.current === "callAccepted" && (
            <AfterAcceptingCall
              localStream={localStream}
              mode={mode}
              onEnd={onReject}
              remoteStream={remoteStream}
              user={users.find((u) => u._id == incomingCall?.callerId) || "a"}
            />
          )}
          {callRef.current === "incomingCall" && (
            <IncomingCallModal
              caller={
                users.find((u) => u._id === incomingCall.callerId) || {
                  name: "Unknown",
                }
              }
              onReject={onReject}
              onAccept={() => {
                onAccept(incomingCall);
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
