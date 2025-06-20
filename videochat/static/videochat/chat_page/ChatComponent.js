function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

// NewWindow.js - Create this new file

function NewWindow(props) {
    const [container, setContainer] = React.useState(null);
    const newWindow = React.useRef(null);

    React.useEffect(() => {
        // Open a new window and store a reference to it
        newWindow.current = window.open('', 'callWindow', 'width=700,height=600');

        // Create a container div in the new window to render into
        const div = newWindow.current.document.createElement('div');
        newWindow.current.document.body.appendChild(div);
        setContainer(div);
        
        // Copy all stylesheets from the main page to the new window
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

        // Set a title for the new window
        newWindow.current.document.title = "Video Call";

        // Call the onUnload prop when the popup is closed
        const handleUnload = () => {
            if (props.onUnload) {
                props.onUnload();
            }
        };
        newWindow.current.addEventListener('beforeunload', handleUnload);

        // Cleanup: close the window when the main component unmounts
        return () => {
            handleUnload();
            newWindow.current.close();
        };
    }, []);

    // Render the children (Sender or Receiver component) into the new window
    return container ? ReactDOM.createPortal(props.children, container) : null;
}

function IncomingCallNotification({ caller, onAnswer, onDecline }) {
    // Basic inline styles for visibility. You can make this look better with CSS.
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

    // React.useEffect(() => {  
    //     if (users != undefined && selectedUser != null) {
    //         usersRef.current = users;
    //     }
        
    // }, [users]);

    const dataForReceiverUser = selectedUser ? users.find(user => user.username === selectedUser.username) : null;

    React.useEffect(() => {

        console.log(window.__INITIAL_DATA__.username)

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

        window.REACT_APP_WS_ENDPOINT = 'ws://127.0.0.1:8000/';
        // window.REACT_APP_WS_ENDPOINT = 'wss://panthiya.onrender.com/';

        messageConnectionRef.current = new WebSocket(`${window.REACT_APP_WS_ENDPOINT}ws/message/${window.__INITIAL_DATA__.username}/`);
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

                // const updatedUsers = usersRef.current.map(user => {
                //     if (user.username === senderUsername) {
                //         return {
                //             ...user, messages: user.messages ? [...user.messages, newermessage] : [newermessage]
                //         };
                //     }
                //     return user;
                // });

                // setUsers(updatedUsers);
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


const handleUserClick = (user) => {
    console.log(user);
    setSelectedUser(user);
    // setView('detail');
};

const handleBackClick = (user) =>{
    setSelectedUser(null);
    setView('list');
};

const handleCall = () => {
    setView('call')
}
  
const handleMessageChange = (e) => {
    setNewMessage(e.target.value);
};

const dateHumanize = (date) => {
    return moment(date).fromNow();  // Format date to human-readable form
};

const scrollDown = () => {
    if (chatBodyRef.current) {
        chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;  // Scroll to the bottom
    }
};

 const handleInitiateCall = () => {
        if (selectedUser) {
            setIsCalling(true);
        } else {
            alert("Please select a user to call.");
        }
    };

const handleAnswerCall = () => {
    // This will hide the notification bar and trigger the popup to open
    setShowReceiverPopup(true);
};

const handleDeclineCall = () => {
    // This just hides the notification bar
    setReceivingCallData(null);
};

// Push a new message to the selected user's message list
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
                // Ensure the messages array exists before spreading
                messages: [...(user.messages || []), sendingmessage]
            };
        }
        return user;
    }));

    // const updatedUsers = usersRef.current.map(user => {
    //     if (user.username === selectedUser.username) {
    //         return {
    //                 ...user, messages: user.messages ? [...user.messages, sendingmessage] : [sendingmessage]
    //             };
    //     }
    //     return user;
    // });
    
    // setUsers(updatedUsers);

    // Post the message to the server
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
        setNewMessage('');  // Clear the message input
    });
}

const handleMessageInput = ()=> {
    console.log(selectedUser, "this is message", newMessage);
    addMessage(); 
};


return (
        <div className="chat-container">

            {isCalling && selectedUser && (
                <NewWindow onUnload={() => setIsCalling(false)}>
                    <Sender selectedUser={selectedUser} currentuser={window.__INITIAL_DATA__.username} />
                </NewWindow>
            )}
            {showReceiverPopup && receivingCallData && (
                <NewWindow onUnload={() => {
                    setShowReceiverPopup(false);
                    setReceivingCallData(null);
                }}>
                    <Receiver remotedata={receivingCallData} />
                </NewWindow>
            )}
            {receivingCallData && !showReceiverPopup && (
                <IncomingCallNotification
                    caller={receivingCallData.sender}
                    onAnswer={handleAnswerCall}
                    onDecline={handleDeclineCall}
                />
            )}
            {/* Sidebar with User List */}
            <div className="sidebar">
                {/* <div className="sidebar-header">
                    <div className="user-profile">
                        <img src={window.__INITIAL_DATA__.profile_image} alt="Rifat ul alom" className="avatar" />
                        <span className="username">{window.__INITIAL_DATA__.username}</span>
                    </div>
                </div>
                <div className="search-bar">
                    <input type="text" placeholder="Search" />
                </div> */}
                <div className="user-list">
                    {users.map(user => (
                        <div key={user.id} className={`user-list-item ${selectedUser && selectedUser.id === user.id ? 'active' : ''}`} onClick={() => handleUserClick(user)}>
                            <img src={user.photo} alt={user.username} className="avatar" />
                            <div className="user-info">
                                <span className="username">{user.username}</span>
                                <span className="last-message">{user.messages?.length > 0 ? user.messages[user.messages.length - 1].text : 'No messages'}</span>
                            </div>
                            <span className="timestamp">{user.messages?.length > 0 ? 'a few seconds ago' : ''}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Chat Window */}
            {selectedUser ? (
                <div className="chat-window">
                    <div className="chat-header">
                        <img src={selectedUser.photo} alt={selectedUser.username} className="avatar" />
                        <div className="user-info">
                            <span className="username">{selectedUser.username}</span>
                            <span className="status">Offline</span>
                        </div>
                        <div className="chat-actions">
                            {/* <button onClick={() => setView('sender')} className="call-button"> */}
                            <button onClick={handleInitiateCall} className="call-button">
                                Call
                            </button>
                        </div>
                    </div>
                    <div className="chat-body" ref={chatBodyRef}>
                        {/* Dummy messages to show the layout */}
                        {
                            // Check the 'view' state to decide what to render inside the chat body
                           
                                // console.log("dataForReceiverUser", dataForReceiverUser),
                                // Otherwise (if view is 'detail'), show the messages list
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
                                    handleMessageInput();
                                }
                            }}
                            placeholder="Type a message..."
                        />
                        <button onClick={handleMessageInput}>Send</button>
                    </div>
                </div>
            ) : (
                <div className="chat-window placeholder">Select a chat to start messaging</div>
            )}
        </div>
    );
}

// function ActiveChatTop ({setView}) {
//     const handleCall = () => {
//         setView('sender');
//     }
//     return(
//         <div>
//             <button onClick={handleCall}>call</button>
//         </div>
//     )
// }

