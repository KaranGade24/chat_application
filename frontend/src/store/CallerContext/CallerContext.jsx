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
  isIncommingCall: null,
  setIsIncommingCall: () => {},
  isCurrectUser: null,
  serIsCurrectUser: () => {},
  storeSocket: null,
  setStoreSocket: () => {},
  targetUserId: null,
  SetTargetUserId: () => {},
  activeUser: null,
  setActiveUser: () => {},
  mode: null,
  setMode: () => {},
  peerConnectionRef: null,
});

export default CallerContext;
