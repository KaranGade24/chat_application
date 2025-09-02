import { createContext } from "react";

const CallerContext = createContext({
  socketRef: { current: null },
  peerConnectionRef: { current: null },
  localStreamRef: { current: null },
  remoteStreamRef: { current: null },
  userId: null,
  callUser: (remoteUserId, callMode) => {},
  callRef: { current: null },
  callInfo: { current: { to: "", from: "" } },
  answerCall: () => {},
  callState: null,
  setCallState: (state) => {},
  mode: { current: "video" },
  activeUser: { current: null },
  endCall: () => {},
});

export default CallerContext;
