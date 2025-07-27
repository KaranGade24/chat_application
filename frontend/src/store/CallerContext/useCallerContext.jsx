// store/CallerContext/CallerContext.js
import { createContext } from "react";

const CallerContext = createContext({
  inCall: false,
  setInCall: () => {},
  localStream: null,
  setLocalStream: () => {},
  remoteStream: null,
  setRemoteStream: () => {},
  peerConnection: null,
  setPeerConnection: () => {},
  caller: null,
  setCaller: () => {},
  callee: null,
  setCallee: () => {},
  callType: null,
  setCallType: () => {},
  incomingCall: null,
  setIncomingCall: () => {},
  isCurrectUser: null,
  serIsCurrectUser: () => {},
  storeSocket: null,
  setStoreSocket: () => {},
  targetUserId: null,
  SetTargetUserId: () => {},
});

export default CallerContext;
