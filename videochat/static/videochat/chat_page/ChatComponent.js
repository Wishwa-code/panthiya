function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

ReactDOM.render(<ChatComponent/>, document.querySelector("#main-component"));

function ChatComponent ({}) {
    const [users, setUsers] = React.useState([
        // Pre-populating with dummy data for immediate visual feedback.
        // Your existing axios call will append the actual users.
        {id: 1, username: 'Kanon Ahamed', messages: [{text: 'wait a second', sender: 'Kanon Ahamed'}]},
        {id: 2, username: 'Shakil Khan', messages: [{text: "Hi I'm using dj chat", sender: 'Shakil Khan'}]},
        {id: 3, username: 'Mamun Sharif', messages: [{text: "Hi I'm using dj chat", sender: 'Mamun Sharif'}]},
        {id: 4, username: 'Jahid Hassan', messages: [{text: "Hi I'm using dj chat", sender: 'Jahid Hassan'}]},
    ]);
    const [selectedUser, setSelectedUser] = React.useState(users[0]); // Initially select the first user
    const [view, setView] = React.useState('detail');
    const [newMessage, setNewMessage] = React.useState();
    const [remotedata, setRemotedata ] = React.useState();
    const messageConnectionRef = React.useRef(null);
    const messageWindowRef = React.useRef(null);
    const chatBodyRef = React.useRef(null);
    const csrftoken = getCookie('csrftoken');
    const usersRef = React.useRef(users);

    React.useEffect(() => {
        usersRef.current = users;
    }, [users]);

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
                setView('receiver');
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

                const updatedUsers = usersRef.current.map(user => {
                    if (user.username === senderUsername) {
                        return {
                            ...user, messages: user.messages ? [...user.messages, newermessage] : [newermessage]
                        };
                    }
                    return user;
                });

                setUsers(updatedUsers);
            }
        };

        return () => {
            messageConnectionRef.current.close();
        };

    }, []);


const handleUserClick = (user) => {
    console.log(user);
    setSelectedUser(user);
    setView('detail');
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

// Push a new message to the selected user's message list
const addMessage = () => {
    const sendingmessage = {
        text: newMessage,
        read: true,
        date_time: moment().format(),
        sender: window.__INITIAL_DATA__.username,
    };

    const updatedUsers = usersRef.current.map(user => {
        if (user.username === selectedUser.username) {
            return {
                    ...user, messages: user.messages ? [...user.messages, sendingmessage] : [sendingmessage]
                };
        }
        return user;
    });
    
    setUsers(updatedUsers);

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
 const currentUserData = users.find(user => user.name === selectedUser.name);

return (
        <div className="chat-container">
            {/* Sidebar with User List */}
            <div className="sidebar">
                <div className="sidebar-header">
                    <div className="user-profile">
                        <img src="https://via.placeholder.com/40" alt="Rifat ul alom" className="avatar" />
                        <span className="username">Rifat ul alom</span>
                    </div>
                </div>
                <div className="search-bar">
                    <input type="text" placeholder="Search" />
                </div>
                <div className="user-list">
                    {users.map(user => (
                        <div key={user.id} className={`user-list-item ${selectedUser && selectedUser.id === user.id ? 'active' : ''}`} onClick={() => handleUserClick(user)}>
                            <img src="https://via.placeholder.com/40" alt={user.username} className="avatar" />
                            <div className="user-info">
                                <span className="username">{user.username}</span>
                                <span className="last-message">{user.messages.length > 0 ? user.messages[user.messages.length - 1].text : 'No messages'}</span>
                            </div>
                            <span className="timestamp">{user.messages.length > 0 ? 'a few seconds ago' : ''}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Chat Window */}
            {selectedUser ? (
                <div className="chat-window">
                    <div className="chat-header">
                        <img src="https://via.placeholder.com/40" alt={selectedUser.username} className="avatar" />
                        <div className="user-info">
                            <span className="username">{selectedUser.username}</span>
                            <span className="status">Offline</span>
                        </div>
                        <div className="chat-actions">
                            <button onClick={() => setView('sender')} className="call-button">
                                Call
                            </button>
                        </div>
                    </div>
                    <div className="chat-body" ref={chatBodyRef}>
                        {/* Dummy messages to show the layout */}
                        {
                            // Check the 'view' state to decide what to render inside the chat body
                            view === 'sender' ? (
                                // If we are initiating a call, show the SenderView
                                <Sender selectedUser={selectedUser} setView={setView} />
                                // <p>hi</p>
                            ) : view === 'receiver' ? (
                                // If we are receiving a call, show the ReceiverView
                                <Receiver remotedata={remotedata} setView={setView} />
                                // <p></p>
                            ) : (
                                // Otherwise (if view is 'detail'), show the messages list
                               currentUserData.messages.map((message, index) => (
                                        <div
                                            key={index}
                                            className={`message-container ${message.sender === window.__INITIAL_DATA__?.username ? 'sent' : 'received'}`}
                                        >
                                            <div className="message">{message.text}</div>
                                            <div className="timestamp">{dateHumanize(message.date_time)}</div>
                                        </div>
                                    ))
                            )
                        }
                    </div>
                    <div className="chat-input">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={handleMessageChange}
                            placeholder="Type a message..."
                        />
                         {/* A send button can be added here */}
                    </div>
                </div>
            ) : (
                <div className="chat-window placeholder">Select a chat to start messaging</div>
            )}
        </div>
    );
}

function ActiveChatTop ({setView}) {
    const handleCall = () => {
        setView('sender');
    }
    return(
        <div>
            <button onClick={handleCall}>call</button>
        </div>
    )
}

