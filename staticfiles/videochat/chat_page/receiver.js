function Receiver ({remotedata,current_host}) {
	const [callingStatus, setCallingStatus] = React.useState('connected');
	const peerRef = React.useRef(null);
	const [conn, setConn] = React.useState(null);
	const [call, setCall] = React.useState(null);
	const [socket, setSocket] = React.useState(null);
	const [localStream, setLocalStream] = React.useState(null);
	const [remotePeerId, setRemotePeerId] = React.useState(null);
	const [displayUser, setDisplayUser] = React.useState({
		username: '',
		name: '',
		photo: 'https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_960_720.png',
	});
	const localVideoRef = React.useRef(null);
	const remoteVideoRef = React.useRef(null);

	React.useEffect(() => {
		const parsedDisplay = "wishwa";
		setDisplayUser(parsedDisplay);
		console.log(remotedata.data.peer_id);
		setRemotePeerId(remotedata.data.peer_id);
		initializePeer(remotedata.data.peer_id);
		window.addEventListener('beforeunload', handleBeforeUnload);

		

		return () => {
			window.removeEventListener('beforeunload', handleBeforeUnload);
		};
	}, []);

	const handleBeforeUnload = (ev) => {
		endCall();
	};

	const initializePeer = (remotepeerid_in) => {
		const newPeer = new Peer();
		peerRef.current = newPeer;

		newPeer.on('open', (id) => {
			console.log('My peer id', id);
			answerCall();
		});

		newPeer.on('connection', (newConn) => {
			setConn(newConn);
			newConn.on('data', (data) => {
				console.log('Received', data);
			});
		});

		initializeWebSocket(remotepeerid_in);
	};

	const answerCall = () => {
		if (navigator && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
			navigator.mediaDevices
			.getUserMedia({ video: true, audio: true })
			.then((stream) => {
			streamCall(stream);
			})
		} else {
			console.error('getUserMedia is not supported in this environment.');
		}
	};

	const streamCall = (stream) => {
		
		setCallingStatus('connected');
		setLocalStream(stream); 
		console.log("peer id", remotedata.data.peer_id, stream);
		
		const newCall = peerRef.current.call(remotedata.data.peer_id, stream);
		setCall(newCall);
		console.log(newCall);
		newCall.on('stream', streamRemoteCall);
		localVideoRef.current.srcObject = stream;
		localVideoRef.current.play();
	};

	const streamRemoteCall = (remoteStream) => {
		remoteVideoRef.current.srcObject = remoteStream;
		remoteVideoRef.current.play();
		console.log("Remote stream");
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

	const rejectCall = () => {
		const data = {
		receiver: displayUser.username,
		sender: route.params.username,
		peer_id: remotePeerId,
		};

		axios.post('end-call/', data).then(response => {
		console.log(response);
		}).catch(err => {
		console.log(err);
		});
	};

	const initializeWebSocket = (peer_id) => {
		const newSocket = new WebSocket(`${current_host}/ws/message/${peer_id}/`);
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


		{callingStatus === 'connected' && (
			<div>
			<video ref={localVideoRef} id="localVideo" autoPlay></video>
			<video ref={remoteVideoRef} id="remoteVideo" autoPlay></video>

			<div className="call-controls text-center align-self-center p-3 bg-primary bg-opacity-10">
				<button clickCallback={toggleLocalAudio} > audio </button>
				<button clickCallback={toggleLocalVideo} > video </button> 
				<button onClick={rejectCall} className="btn btn-lg btn-danger rounded-circle mx-1">
				<i className="fa-solid fa-phone" style={{ transform: 'rotate(133deg)' }}></i>
				</button>
			</div>
			</div>
		)}

		{callingStatus === 'rejected' && <h1>Call Rejected, closing the window</h1>}
		</div>
	);
};
