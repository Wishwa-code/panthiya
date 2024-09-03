function CreateClass() {
        const [calling, setCalling] = React.useState(false);
        const [isConnected, setIsConnected] = React.useState(false);
        const [appId, setAppId] = React.useState('95c3c83fa4a34edc8ed24e22eed1bd82');
        const [channel, setChannel] = React.useState("");
        const [token, setToken] = React.useState("");
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

        const createMeeting = () => {
            fetch('/create-channel/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrftoken,
                },
                body: JSON.stringify({
                    channelName: channel, 
                    uid: 0
                }),
                  withCredentials: true
            })
            .then(response => response.json())
            .then(data => {
                console.log('Token and Channel:', data);
                setToken(data.token);
                setChannel(data.channel_name);
                console.log("pringint app idhere",appId);
                joinCall(data);
            })
            .catch((error) => {
                console.error('Error:', error);
            });
        }

        const joinCall = (data) => {
            console.log("data came", data);
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
              })
              .catch((error) => console.error("Failed to join channel", error));

            return () => {
              client.current && client.current.leave();
            };
          } 
        

        return (
          <>
            <div className="room">
              {isConnected ? (
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
              ) : (
                <div className="join-room">

                  <input
                    onChange={(e) => setChannel(e.target.value)}
                    placeholder="Enter name for the channel"
                    value={channel}
                  />

                  

                  <button 
                    className=''
                    onClick={() => createMeeting()}
                  >
                    create meeting
                  </button>
                </div>
              )}
            </div>
            {isConnected && (
              <div className="control">
                <div className="left-control">
                  <button className="btn" onClick={handleMicToggle}>
                    <i className={`i-microphone ${!micOn ? "off" : ""}`} />
                  </button>
                  <button className="btn" onClick={handleCameraToggle}>
                    <i className={`i-camera ${!cameraOn ? "off" : ""}`} />
                  </button>
                </div>
                <button
                  className={`btn btn-phone ${calling ? "btn-phone-active" : ""}`}
                  onClick={handleHangup}
                >
                  {calling ? <i className="i-phone-hangup" /> : <i className="i-mdi-phone" />}
                </button>
                <p>channel:{channel}<hr></hr>token:{token}</p>
              </div>
            )}
          </>
        );
      };