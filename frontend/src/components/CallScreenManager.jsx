import React, { useContext, useState } from "react";
import CallComponent from "./CallComponent";
import OngoingCallComponent from "./OngoingCallComponent";
import CallerContext from "../store/CallerContext/CallerContext";

export default function CallScreenManager() {
  const { inCall } = useContext(CallerContext);
  const [isCallAccepted, setIsCallAccepted] = useState(false);
  const [isCallActive, setIsCallActive] = useState(true);

  const handleAnswerCall = () => {
    setIsCallAccepted(true);
  };

  const handleEndCall = () => {
    setIsCallActive(false);
    alert("Call ended.");
  };

  if (!isCallActive) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>Call ended.</div>
    );
  }
  console.log("incall", inCall);
  return inCall ? (
    <OngoingCallComponent user={user} onHangUp={handleEndCall} />
  ) : (
    <CallComponent
      user={user}
      onHangUp={handleEndCall}
      onAccept={handleAnswerCall}
    />
  );
}
