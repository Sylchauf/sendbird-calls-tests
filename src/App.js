import { useEffect, useState } from "react";
import "./App.css";

import SendBirdCall from "sendbird-calls";

/**
 * Variables Sendbird App
 * @TODO replace by the good value
 */
const APP_ID = "SENDBIRD_APP_ID";
const AGENT_ID = "AGENT_USER_ID";
const USER_ID = 208;

let call = null;

SendBirdCall.init(APP_ID);

const App = () => {
  const [inCall, setInCall] = useState(false);

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const access = SendBirdCall.useMedia({ audio: true, video: true });

    const authOption = { userId: USER_ID };

    return SendBirdCall.authenticate(authOption, (result, error) => {
      if (error) console.error(error);
      else {
        // The user has been successfully authenticated and is connected to Sendbird server.
        console.log("Authenticated");

        // Establishing websocket connection.
        SendBirdCall.connectWebSocket().then(() => {
          console.log("Websocket connected");
        });
      }
    });
  };

  const makeCall = async () => {
    if (call) return;

    const dialParams = {
      userId: AGENT_ID,
      isVideoCall: true,
      callOption: {
        localMediaView: document.getElementById("localVideo"),
        remoteMediaView: document.getElementById("remoteVideo"),
        audioEnabled: true,
        videoEnabled: true,
      },
    };

    call = SendBirdCall.dial(dialParams, (call, error) => {
      if (error) console.error(error);

      // Dialing succeeded.
      console.log("Ringing !");
    });

    call.onEstablished = () => setInCall(true);
    call.onEnded = () => {
      call = null;
    };
  };

  const handleEndCall = async () => {
    if (call) call.end();
  };

  const handleChangeCamera = async () => {
    const result = SendBirdCall.getAvailableVideoInputDevices();

    const otherCam = result.find((i) => i.label.includes("back"));

    SendBirdCall.selectVideoInputDevice(otherCam);
  };

  return (
    <div className="App">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {inCall ? (
          <button onClick={handleEndCall}>Stop call</button>
        ) : (
          <button onClick={() => makeCall()}>Start call</button>
        )}
        {inCall && (
          <button onClick={() => handleChangeCamera()}>Change camera</button>
        )}
      </div>
      <video id={"localVideo"} autoPlay muted></video>
      <video id={"remoteVideo"} autoPlay></video>
    </div>
  );
};

export default App;
