function Sender ({selectedUser, currentuser}) {
  const [displayUser, setDisplayUser] = React.useState({
    username: '',
    name: '',
    photo: 'https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_960_720.png',
  });
  const [callingStatus, setCallingStatus] = React.useState('calling');
  const [peerId, setPeerId] = React.useState(null);
  const [peer, setPeer] = React.useState(null);
  const [conn, setConn] = React.useState(null);
  const [call, setCall] = React.useState(null);
  const [localStream, setLocalStream] = React.useState(null);
  const [socket, setSocket] = React.useState(null);

  const localVideoRef = React.useRef(null);
  const remoteVideoRef = React.useRef(null);



  console.log("printing here",selectedUser,currentuser);

  React.useEffect(() => {
    const parsedDisplay = "wishwa";
    setDisplayUser(parsedDisplay);
    initializePeer();
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const handleBeforeUnload = (ev) => {
    endCall();
    if (peerId) ev.preventDefault();
    ev.returnValue = '';
  };

  const initializePeer = () => {
    const newPeer = new Peer();
    setPeer(newPeer);

    newPeer.on('open', (id) => {
      console.log(id);
      setPeerId(id);
      startCall(id);
      initializeWebSocket(id);
    });

    newPeer.on('connection', (newConn) => {
      setConn(newConn);
      console.log("peer conncteion received",newConn);
      newConn.on('data', (data) => {
        console.log('Received', data);
      });
    });

    newPeer.on('call', (newCall) => {
      setCall(newCall);
      console.log("new call received",newCall);
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then((stream) => {
          streamCall(newCall,stream);
        });
    });

    newPeer.on('error', () => {
      console.log('peer errors');
    });
  };
  
  
  const startCall = (id) => {
    
    const data = {
      receiver: selectedUser.name,
      sender: currentuser,
      peer_id: id,
    };

    const csrftoken = getCookie('csrftoken');
    console.log("csrf token at start, ", csrftoken)

    console.log("methana sender",selectedUser.name, ",etana receiver", currentuser , "mehtan peer id",id);

    axios
      .post('start-call/', data, {
        headers: {
            'X-CSRFToken': csrftoken,
        },
         withCredentials: true
      })
      .then((response) => {
        console.log(response);
      })
      .catch((error) => {
        console.log(error.response);
      });
  };

  const streamCall = (newCall,stream) => {
    console.log("stream call ",newCall,stream);
    setCallingStatus('connected');
    newCall.answer(stream);
    setLocalStream(stream);
    localVideoRef.current.srcObject = stream;
    newCall.on('stream', streamRemoteCall);
  };

  const streamRemoteCall = (remoteStream) => {
    remoteVideoRef.current.srcObject = remoteStream;
  };

  const toggleLocalVideo = () => {
    localStream.getTracks().forEach((track) => {
      if (track.readyState === 'live' && track.kind === 'video') {
        track.enabled = !track.enabled;
      }
    });
  };

  const toggleLocalAudio = () => {
    localStream.getTracks().forEach((track) => {
      if (track.readyState === 'live' && track.kind === 'audio') {
        track.enabled = !track.enabled;
      }
    });
  };

  const cancelCall = () => {
    const data = {
      receiver: selectedUser.username,
      sender: currentuser,
      peer_id: peerId,
    };

    const csrftoken = getCookie('csrftoken');

    console.log("csrf token at end call", csrftoken)
    axios
        .post('end-call/', data, {
            headers: {
                'X-CSRFToken': csrftoken,
            },
            withCredentials: true
        })
        .then((response) => {
            console.log(response);
        })
        .catch((error) => {
            console.log(error.response);
        }); 
  };

  const initializeWebSocket = (peer_id) => {
    const newSocket = new WebSocket(`ws/message/${peer_id}/`);
    setSocket(newSocket);

    newSocket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.status === 'end_call') {
        endCall();
      }
      console.log(message);
    };
  };

  const endCall = () => {
    setCallingStatus('rejected');
    setTimeout(() => {
      window.close();
    }, 2000);
  };

  return (
    <div style={{ height: '100vh' }} className="d-flex justify-content-center align-items-center">
      {callingStatus === 'calling' && (
        <div className="text-center align-self-center">
          <center>
            <div className="pulse">
              <img
                height="250"
                src={displayUser.photo}
                className="rounded-circle"
                alt=""
              />
            </div>
          </center>
          <h2 className="mt-5 text-black-50 mb-5">
            Calling <strong>{displayUser.name}</strong> .....
          </h2>
          <button
            type="button"
            onClick={cancelCall}
            className="btn btn-lg btn-danger rounded-pill px-5"
          >
            <i className="fa-solid fa-phone" style={{ transform: 'rotate(133deg)' }}></i> Cancel
            Call
          </button>
        </div>
      )}

      {callingStatus === 'connected' && (
        <div>
          <video ref={localVideoRef} id="localVideo" autoPlay></video>
          <video ref={remoteVideoRef} id="remoteVideo" autoPlay></video>

          <div className="call-controls text-center align-self-center p-3 bg-primary bg-opacity-10">
            <button clickCallback={toggleLocalAudio} > Audio </button>
            <button clickCallback={toggleLocalVideo} > Video </button>
            <button onClick={cancelCall} className="btn btn-lg btn-danger rounded-circle mx-1">
              <i className="fa-solid fa-phone" style={{ transform: 'rotate(133deg)' }}></i>
            </button>
          </div>
        </div>
      )}

      {callingStatus === 'rejected' && <h1>Call Rejected, closing the window</h1>}
    </div>
  );
};