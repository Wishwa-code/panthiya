function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

function NewWindow(props) {
    const [container, setContainer] = React.useState(null);
    const newWindow = React.useRef(null);

    React.useEffect(() => {
        newWindow.current = window.open('', 'callWindow', 'width=700,height=600');

        const div = newWindow.current.document.createElement('div');
        newWindow.current.document.body.appendChild(div);
        setContainer(div);
        
        Array.from(document.styleSheets).forEach(styleSheet => {
            if (styleSheet.href) {
                const newLinkEl = newWindow.current.document.createElement('link');
                newLinkEl.rel = 'stylesheet';
                newLinkEl.href = styleSheet.href;
                newWindow.current.document.head.appendChild(newLinkEl);
            } else if (styleSheet.cssRules) {
                const newStyleEl = newWindow.current.document.createElement('style');
                Array.from(styleSheet.cssRules).forEach(rule => {
                    newStyleEl.appendChild(newWindow.current.document.createTextNode(rule.cssText));
                });
                newWindow.current.document.head.appendChild(newStyleEl);
            }
        });

        newWindow.current.document.title = "Video Call";

        const handleUnload = () => {
            if (props.onUnload) {
                props.onUnload();
            }
        };
        newWindow.current.addEventListener('beforeunload', handleUnload);

        return () => {
            handleUnload();
            newWindow.current.close();
        };
    }, []);

    return container ? ReactDOM.createPortal(props.children, container) : null;
}

function IncomingCallNotification({ caller, onAnswer, onDecline }) {
    const notificationStyle = {
        position: 'absolute',
        top: '10px',
        left: '50%',
        transform: 'translateX(-50%)',
        padding: '15px 25px',
        backgroundColor: '#28a745',
        color: 'white',
        borderRadius: '8px',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
    };

    const buttonStyle = {
        padding: '8px 15px',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer'
    };
    
    return (
        <div style={notificationStyle}>
            <span>Incoming call from <strong>{caller}...</strong></span>
            <button style={buttonStyle} onClick={onAnswer}>Answer</button>
            <button style={{...buttonStyle, backgroundColor: '#dc3545', color: 'white'}} onClick={onDecline}>Decline</button>
        </div>
    );
}

ReactDOM.render(<ChatComponent/>, document.querySelector("#main-component"));

function ChatComponent ({}) {
    const [users, setUsers] = React.useState([]);
    const [selectedUser, setSelectedUser] = React.useState(); // Initially select the first user
    const [isCalling, setIsCalling] = React.useState(false);
    const [receivingCallData, setReceivingCallData] = React.useState(null);
    const [newMessage, setNewMessage] = React.useState();
    const [remotedata, setRemotedata ] = React.useState();
    const [showReceiverPopup, setShowReceiverPopup] = React.useState(false);
    const messageConnectionRef = React.useRef(null);
    const messageWindowRef = React.useRef(null);
    const chatBodyRef = React.useRef(null);
    const csrftoken = getCookie('csrftoken');
    const usersRef = React.useRef(users);


    const dataForReceiverUser = selectedUser ? users.find(user => user.username === selectedUser.username) : null;

    const host = window.location.host;

    let protocol;
    if (host != "localhost:8000"){
        protocol = 'wss'
    }else{
        protocol = 'ws'
    }
    let current_host = `${protocol}://${host}`;

    React.useEffect(() => {

        axios.get('users/')
        .then(response => {
            setUsers((prevUsers) => {
                const updatedUsers = [...prevUsers, ...response.data];
                console.log("Updated User List:", updatedUsers);
                return updatedUsers;
            });
        })
        .catch(error => {
            console.log(error);
        });

        let message_channel = `${current_host}/ws/message/${window.__INITIAL_DATA__.username}/`;

        messageConnectionRef.current = new WebSocket(message_channel);
        console.log(messageConnectionRef);

        messageConnectionRef.current.onmessage = (event) => {
            const eventJSON = JSON.parse(event.data);
            console.log("onmessage main", eventJSON);

            if (eventJSON.status === 'new_call') {
                console.log('new call');
                const message = eventJSON.message;
                setRemotedata(message);
                // setView('receiver');
                setReceivingCallData(message);
            } else {
                const message = eventJSON.message;
                console.log("onmessage message socket came", usersRef.current);

                const senderUsername = message.sender;

                const newermessage = {
                    text: message.text,
                    read: message.read,
                    date_time: message.date_time,
                    sender: message.sender,
                };

                setUsers(prevUsers => prevUsers.map(user => {
                    if (user.username === senderUsername) {
                        return {
                            ...user,
                            messages: [...(user.messages || []), newermessage]
                        };
                    }
                    return user;
                }));
            }
        };

        return () => {
            messageConnectionRef.current.close();
        };

    }, []);

    const notificationconnectionRef = React.useRef(null);

    React.useEffect(() => {
        let notification_channel = `${current_host}/ws/notification/`;

        notificationconnectionRef.current = new WebSocket(notification_channel);

        notificationconnectionRef.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
        
            console.log("📣 Notification Received:", data);
            if (data.status === 'status_change') {
                const user_data = data.message;
                console.log(`Status Change for ${user_data.username}: Online = ${user_data.online}`);
        
                setUsers(prevUsers => 
                    prevUsers.map(user => 
                        { 
                            return user.username === user_data.username 
                                ? { ...user, online: user_data.online } 
                                : user;

                        })
                    
                );
            } else if (data.status === 'new_user') {
                const user_data = data.message;
                console.log(`A new user has registered: ${user_data.username}`);

                setUsers(prevUsers => [user_data, ...prevUsers]);
            }
        };

        notificationconnectionRef.current.onopen = (event) => {
            console.log('Created', event);
        };

        return () => {
            notificationconnectionRef.current.close();
        };
    }, []);


    const handleUserClick = (user) => {
        console.log(user);
        setSelectedUser(user);
    };

    
    const handleMessageChange = (e) => {
        setNewMessage(e.target.value);
    };

    const dateHumanize = (date) => {
        return moment(date).fromNow();  
    };

    const handleInitiateCall = () => {
            if (selectedUser) {
                setIsCalling(true);
            } else {
                alert("Please select a user to call.");
            }
        };

    const handleAnswerCall = () => {
        setShowReceiverPopup(true);
    };

    const handleDeclineCall = () => {
        setReceivingCallData(null);
    };

    const addMessage = () => {
        const sendingmessage = {
            text: newMessage,
            read: true,
            date_time: moment().format(),
            sender: window.__INITIAL_DATA__.username,
        };

        setUsers(prevUsers => prevUsers.map(user => {
            if (user.username === selectedUser.username) {
                return {
                    ...user,
                    messages: [...(user.messages || []), sendingmessage]
                };
            }
            return user;
        }));

        axios.post('message/', {
            text: newMessage,
            receiver: selectedUser.username,
        }, {
            headers: {
                'X-CSRFToken': csrftoken,  
            },
            withCredentials: true  
        })
        .then((response) => {
            console.log("response after sending message", response);
            console.log(selectedUser.username);
        })
        .catch((error) => {
            console.log(error);
        })
        .finally(() => {
            setNewMessage('');  
        });
    }


    return (
        <div className="chat-container">

            {isCalling && selectedUser && (
                <NewWindow onUnload={() => setIsCalling(false)}>
                    <Sender selectedUser={selectedUser} currentuser={window.__INITIAL_DATA__.username} current_host={current_host} />
                </NewWindow>
            )}

            {showReceiverPopup && receivingCallData && (
                <NewWindow onUnload={() => {
                    setShowReceiverPopup(false);
                    setReceivingCallData(null);
                }}>
                    <Receiver remotedata={receivingCallData} current_host={current_host}/>
                </NewWindow>
            )}

            {receivingCallData && !showReceiverPopup && (
                <IncomingCallNotification
                    caller={receivingCallData.sender}
                    onAnswer={handleAnswerCall}
                    onDecline={handleDeclineCall}
                />
            )}

            <div className="sidebar">
                <div className="sidebar-header">
                    <div className="user-profile">
                        <img src={window.__INITIAL_DATA__.profile_image} alt="Rifat ul alom" className="avatar" />
                        <span className="username">{window.__INITIAL_DATA__.username}</span>
                    </div>
                </div>
                <div className="user-list">
                    {users.map(user => (
                        <div key={user.id} className={`user-list-item ${selectedUser && selectedUser.username === user.username ? 'active' : ''}`} onClick={() => handleUserClick(user)}>
                            <div className="avatar-container">
                                {/* <img src={user.photo} alt={user.username} className="avatar" /> */}
                                <span className={`online-indicator ${user.online ? 'online' : 'offline'}`}></span>
                            </div>
                            <div className="user-info">
                                <span className="username">{user.username}</span>
                                <span className="last-message">{user.messages?.length > 0 ? user.messages[user.messages.length - 1].text : 'No messages'}</span>
                            </div>
                            <span className="timestamp">{user.messages?.length > 0 ? 'a few seconds ago' : ''}</span>
                        </div>
                    ))}
                </div>
            </div>

            {selectedUser ? (
                <div className="chat-window">
                    <div className="chat-header">
                        <div className="chat-receiver-data">
                            <img src={selectedUser.photo} alt={selectedUser.username} className="avatar" />
                            <div className="user-info">
                                <span className="username">{selectedUser.username}</span>
                                <span className="status">{selectedUser.online ? "Online" : "Offline" }</span>
                            </div>
                        </div>
                        <div className="chat-actions">
                            <button onClick={handleInitiateCall} className="call-button">
                                <i class='fa-duotone fa-solid fa-phone-volume nav-bar-icons'></i>Video call
                            </button>
                        </div>
                    </div>
                    <div className="chat-body" ref={chatBodyRef}>
                        {
                            dataForReceiverUser.messages.map((message, index) => (
                                    <div
                                        key={index}
                                        className={`message-container ${message.sender === window.__INITIAL_DATA__?.username ? 'sent' : 'received'}`}
                                    >
                                        <div className="message">{message.text}</div>
                                        <div className="timestamp">{dateHumanize(message.date_time)}</div>
                                    </div>
                            ))
                        }
                    </div>
                    <div className="chat-input" style={{ display: 'flex', flexDirection: 'row' }}>
                        <input
                            type="text"
                            value={newMessage}
                            onChange={handleMessageChange}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && newMessage.trim() !== '') {
                                    addMessage();
                                }
                            }}
                            placeholder="Type a message..."
                        />
                        <button  className="call-button"  onClick={addMessage}>Send</button>
                    </div>
                </div>
            ) : (
                <div className="chat-window placeholder" style={{ textAlign: "center" }}>Send and Receive messages from your freinds.<br /> Clicks on freind name to start chattting.</div>
            )}
        </div>
    );
}