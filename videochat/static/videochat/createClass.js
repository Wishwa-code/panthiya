 function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    }

    function NextComponent({ localMic, localCam, remoteUsers }) {
  return (
    <div className="next-component">
      <h3>Chat & Controls</h3>
      <button onClick={() => localMic && localMic.setEnabled(!localMic.enabled)}>
        {localMic && localMic.enabled ? 'Mute Mic' : 'Unmute Mic'}
      </button>
      <button onClick={() => localCam && localCam.setEnabled(!localCam.enabled)}>
        {localCam && localCam.enabled ? 'Turn Off Cam' : 'Turn On Cam'}
      </button>
      <p>Participants: {1 + remoteUsers.length}</p>
    </div>
  );
}

function Main({ localMic, localCam, remoteUsers }) {
  return (
    <>
      <UserList
        localMic={localMic}
        localCam={localCam}
        remoteUsers={remoteUsers}
      />
      <NextComponent
        localMic={localMic}
        localCam={localCam}
        remoteUsers={remoteUsers}
      />
    </>
  );
}

    function UserList({ localMic, localCam, remoteUsers }) {
        return (
            <div className="user-list">
                <div className="user">
                    <video id="local-camera" />
                    <audio id="local-microphone" />
                    <samp className="user-name">You</samp>
                </div>
                {remoteUsers.map((user) => (
                    <div className="user" key={user.uid}>
                        <video
                            id={`remote-video-${user.uid}`}
                            ref={(video) => {
                                if (video && user.videoTrack) {
                                    user.videoTrack.play(video);
                                }
                            }}
                        />
                        <samp className="user-name">{user.uid}</samp>
                    </div>
                ))}
                
            </div>
            
        );
    }

    function CreateClass({ appId, channel, token }) {
        const [calling, setCalling] = React.useState(false);
        const [isConnected, setIsConnected] = React.useState(false);
        const [micOn, setMicOn] = React.useState(true);
        const [cameraOn, setCameraOn] = React.useState(true);
        const [localMicrophoneTrack, setLocalMicrophoneTrack] = React.useState(null);
        const [localCameraTrack, setLocalCameraTrack] = React.useState(null);
        const [remoteUsers, setRemoteUsers] = React.useState([]);
        const client = React.useRef(null);

        const csrftoken = getCookie('csrftoken');

        const createLocalTracks = async () => {
            const [microphoneTrack, cameraTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
            setLocalMicrophoneTrack(microphoneTrack);
            setLocalCameraTrack(cameraTrack);
            microphoneTrack.play("local-microphone");
            cameraTrack.play("local-camera");
            client.current.publish([microphoneTrack, cameraTrack]);
        };

        const handleMicToggle = () => {
            if (localMicrophoneTrack) {
                localMicrophoneTrack.setEnabled(!micOn);
                setMicOn(!micOn);
            }
        };

        const handleCameraToggle = () => {
            if (localCameraTrack) {
                localCameraTrack.setEnabled(!cameraOn);
                setCameraOn(!cameraOn);
            }
        };

        const handleHangup = () => {
            if (client.current) {
                client.current.leave();
                setIsConnected(false);
                setCalling(false);
                setRemoteUsers([]);
                localMicrophoneTrack && localMicrophoneTrack.close();
                localCameraTrack && localCameraTrack.close();
                setLocalMicrophoneTrack(null);
                setLocalCameraTrack(null);
            }
        };

        const joinCall = (data) => {
            return new Promise((resolve, reject) => {
                setCalling(true);
                client.current = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

                client.current.on("user-published", async (user, mediaType) => {
                    await client.current.subscribe(user, mediaType);
                    if (mediaType === "video") {
                        setRemoteUsers((prevUsers) => [...prevUsers, user]);
                    }
                    if (mediaType === "audio") {
                        user.audioTrack.play();
                    }
                });

                client.current.on("user-unpublished", (user) => {
                    setRemoteUsers((prevUsers) => prevUsers.filter((u) => u.uid !== user.uid));
                });

                client.current
                    .join(appId, data.channel_name, data.token || null)
                    .then(() => {
                        setIsConnected(true);
                        createLocalTracks();
                        resolve();
                    })
                    .catch((error) => {
                        console.error("Join failed", error);
                        reject(error);
                    });
            });
        };

        const handleJoinOrCreate = async () => {
            try {
                const data = { appId, channel_name: channel, token };
                await joinCall(data);
            } catch (joinErr) {
                try {
                    const res = await fetch('/create-channel/', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRFToken': csrftoken,
                        },
                        body: JSON.stringify({ channelName: channel, uid: 0 }),
                        credentials: 'include'
                    });
                    const data = await res.json();
                    await joinCall(data);
                } catch (createErr) {
                    console.error("Failed to create meeting after join failure", createErr);
                }
            }
        };

        // ✅ RENDER to main-component when connected
        React.useEffect(() => {
            if (isConnected) {
                const container = document.getElementById("main-component");
                if (container) {
                    container.innerHTML = "";
                    ReactDOM.render(
                       <Main
                            localMic={localMicrophoneTrack}
                            localCam={localCameraTrack}
                            remoteUsers={remoteUsers}
                            
                            />,
                        container
                    );
                }
            }
            return () => {
                console.log("Cleaning up client");
              client.current && client.current.leave();
            };
        }, [isConnected]);

        return (
            <div className="join-room">
                <button onClick={handleJoinOrCreate}>Join</button>
            </div>
        );
    }

    document.querySelectorAll('.join-class-button').forEach((el) => {
        const appId = el.dataset.appId;
        const channel = el.dataset.channel;
        const token = el.dataset.token;

        ReactDOM.render(
            <CreateClass appId={appId} channel={channel} token={token} />,
            el
        );
    });