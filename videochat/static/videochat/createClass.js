  const { useState, useEffect, useRef } = React;
  const { createRoot } = ReactDOM;
  const { createPortal } = ReactDOM;

  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    return parts.length === 2 ? parts.pop().split(';').shift() : null;
  }

  function UserList({ remoteUsers }) {
    return (
      <div className="user-list">
        <div className="user">
          <video id="local-camera" />
          <audio id="local-microphone" />
          <samp>You</samp>
        </div>
        {remoteUsers.map(u => (
          <div className="user" key={u.uid}>
            <video ref={el => el && u.videoTrack && u.videoTrack.play(el)} />
            <samp>{u.uid}</samp>
          </div>
        ))}
      </div>
    );
  }

  function NextComponent({ onMicToggle, onCamToggle, onHangup, remoteUsers }) {
    return (
      <div className="next-component">
        <button onClick={onMicToggle}>Mic</button>
        <button onClick={onCamToggle}>Cam</button>
        <button onClick={onHangup}>Hang Up</button>
        <p>Participants: {1 + remoteUsers.length}</p>
      </div>
    );
  }

  function Main(props) {
    return (
      <>
        <UserList remoteUsers={props.remoteUsers} />
        <NextComponent {...props} />
      </>
    );
  }

  function CreateClass({ appId, channel, token }) {
    const [isConnected, setIsConnected] = useState(false);
    const [micOn, setMicOn] = useState(true);
    const [camOn, setCamOn] = useState(true);
    const [localMicTrack, setLocalMicTrack] = useState(null);
    const [localCamTrack, setLocalCamTrack] = useState(null);
    const [remoteUsers, setRemoteUsers] = useState([]);
    const clientRef = useRef(null);
    const csrftoken = getCookie('csrftoken');

    useEffect(() => {
      const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
      clientRef.current = client;

      client.on("user-published", async (user, mediaType) => {
        await client.subscribe(user, mediaType);
        if (mediaType === "video" && user.videoTrack) {
          setRemoteUsers(us => [...us, user]);
        }
        if (mediaType === "audio" && user.audioTrack) {
          user.audioTrack.play();
        }
      });

      client.on("user-unpublished", user => {
        setRemoteUsers(us => us.filter(u => u.uid !== user.uid));
      });

      return () => client.leave();
    }, []);

    const createLocalTracks = async () => {
      const [mic, cam] = await AgoraRTC.createMicrophoneAndCameraTracks();
      setLocalMicTrack(mic);
      setLocalCamTrack(cam);
      mic.play("local-microphone");
      cam.play("local-camera");
      clientRef.current.publish([mic, cam]);
    };

    const joinCall = async () => {
      try {
        await clientRef.current.join(appId, channel, token || null);
        setIsConnected(true);
        await createLocalTracks();
      } catch {
        const res = await fetch("/create-channel/", {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrftoken },
          body: JSON.stringify({ channelName: channel, uid: 0 }),
          credentials: "include"
        });
        const data = await res.json();
        await clientRef.current.join(appId, data.channel_name, data.token);
        setIsConnected(true);
        await createLocalTracks();
      }
    };

    const toggleMic = () => {
      if (localMicTrack) {
        localMicTrack.setEnabled(!micOn);
        setMicOn(!micOn);
      }
    };

    const toggleCam = () => {
      if (localCamTrack) {
        localCamTrack.setEnabled(!camOn);
        setCamOn(!camOn);
      }
    };

    const hangup = () => {
      clientRef.current.leave();
      setIsConnected(false);
      setRemoteUsers([]);
      localMicTrack?.close();
      localCamTrack?.close();
      setLocalMicTrack(null);
      setLocalCamTrack(null);
    };

    return (
      <>
        <button onClick={joinCall} disabled={isConnected}>
          {isConnected ? "Connected" : "Join"}
        </button>
        {isConnected && (<Portal selector="#main-component">
            <Main
            localMic={localMicTrack}
            localCam={localCamTrack}
            remoteUsers={remoteUsers}
            onMicToggle={toggleMic}
            onCamToggle={toggleCam}
            onHangup={hangup}
            />
        </Portal>
        //   document.getElementById("main-component")
        )}
      </>
    );
  }

  document.querySelectorAll(".join-class-button").forEach(el => {
    const props = {
      appId: el.dataset.appId,
      channel: el.dataset.channel,
      token: el.dataset.token,
    };
    createRoot(el).render(<CreateClass {...props} />);
  });

  const Portal = ({ children, selector }) => {
  const hasCleared = React.useRef(false);
  const target = document.querySelector(selector);
  if (!target) return null;

  if (!hasCleared.current) {
    target.innerHTML = "";
    hasCleared.current = true;
  }

  return createPortal(children, target);
};