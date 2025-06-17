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
            <video class='remote-camera' ref={el => el && u.videoTrack && u.videoTrack.play(el)} />
            <samp>{u.uid}</samp>
          </div>
        ))}
      </div>
    );
  }

  function Devicetools({ onMicToggle, onCamToggle, onHangup, remoteUsers, micOn, cameraOn, calling }) {
    return (
      <div className="device-tools">
        <div></div>
        <div id="device-tools-buttons-container">
          <button onClick={onMicToggle} className="icon-button">
            {!micOn ?
                <i className={`fa-duotone fa-solid fa-microphone-slash `} /> 
                : <i className={`fa-duotone fa-solid fa-microphone `} /> 
        } 
        </button>
        <button onClick={onCamToggle} className="icon-button">
            {cameraOn ?
                <i className={`fa-duotone fa-solid fa-video-slash `} /> 
                : <i className={`fa-duotone fa-solid fa-video `} /> 
        } 
        </button>
        <button onClick={onHangup} className="icon-button">
            {calling ?
                <i className={`fa-duotone fa-solid fa-phone-slash `} /> 
                : <i className={`fa-duotone fa-solid fa-phone `} /> 
        } 
        </button>
        </div>
        <div id="participant-count">Participants: {1 + remoteUsers.length}</div>
        
        
      </div>
    );
  }

  function Main(props) {
    return (
      <>
        <UserList remoteUsers={props.remoteUsers} />
        <Devicetools {...props} />
      </>
    );
  }

  function CreateClass({ appId, channel, token }) {
    const [isConnected, setIsConnected] = useState(false);
    const [micOn, setMicOn] = useState(false);
    const [camOn, setCamOn] = useState(true);
    const [localMicTrack, setLocalMicTrack] = useState(null);
    const [localCamTrack, setLocalCamTrack] = useState(null);
    const [remoteUsers, setRemoteUsers] = useState([]);
    const [isJoining, setIsJoining] = useState(false);
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

        client.on("user-unpublished", (user, mediaType) => {
        if (mediaType === "video") {
            setRemoteUsers(us =>
            us.map(u =>
                u.uid === user.uid ? { ...u, videoTrack: null } : u
            ).filter(u => u.videoTrack)
            );
        }
        // No need to remove the user entirely when audio-only is unpublished
        });
        
      return () => client.leave();
    }, []);

    const createLocalTracks = async () => {
      let localAudioTrack = null;
      let localVideoTrack = null;
      localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
      localVideoTrack = await AgoraRTC.createCameraVideoTrack();
    //   const [mic, cam] = await AgoraRTC.createMicrophoneAndCameraTracks();
      setLocalMicTrack(localAudioTrack);
      setLocalCamTrack(localVideoTrack);
      localAudioTrack.play("local-microphone");
      localVideoTrack.play("local-camera");
      clientRef.current.publish([localAudioTrack, localVideoTrack]);
    };

    const joinCall = async () => {
      setIsJoining(true);
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
        setIsJoining(false);

        await createLocalTracks();
      }
    };

    const toggleMic = () => {
      if (localMicTrack) {
        console.log('found local mic track', localMicTrack);
        localMicTrack.setMuted(!micOn);
        setMicOn(!micOn);
      }
      console.log('didnt found local mic track')
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

      // Programmatically navigate to another page
      window.location.href = '/';
    };

    return (
      <>
        <button class="button-inside-join-card" onClick={joinCall} disabled={isConnected}>
          {isJoining ? "Connecting" : "Join"}
        </button>
        {isConnected && (<Portal selector="#main-component">
            <Main
            localMic={localMicTrack}
            localCam={localCamTrack}
            remoteUsers={remoteUsers}
            onMicToggle={toggleMic}
            onCamToggle={toggleCam}
            onHangup={hangup}
            micOn={micOn}
            cameraOn={camOn}
            calling={isConnected}

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