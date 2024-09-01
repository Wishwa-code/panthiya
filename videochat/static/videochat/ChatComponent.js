

function ChatComponent ({currentuser}) {
  const [users, setUsers] = React.useState([]);
  const [selectedUser, setSelectedUser] = React.useState(null);
  const [view, setView] = React.useState('list');
  const [newMessage, setNewMessage] = React.useState();
  const chatBodyRef = React.useRef(null);
  const [remotedata, setRemotedata ] = React.useState();

  const messageConnectionRef = React.useRef(null);
  const messageWindowRef = React.useRef(null);

  const csrftoken = getCookie('csrftoken');

  const usersRef = React.useRef(users);

  React.useEffect(() => {
    usersRef.current = users;
  }, [users]);

  React.useEffect(() => {
        console.log(currentuser)
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
        
        window.REACT_APP_WS_ENDPOINT = 'ws://13.233.106.189:8000/';
        messageConnectionRef.current = new WebSocket(`${window.REACT_APP_WS_ENDPOINT}ws/message/${currentuser}/`);

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


  const addMessage = () => {

     // Push a new message to the selected user's message list
    const sendingmessage = {
      text: newMessage,
      read: true,
      date_time: moment().format(),
      sender: currentuser,
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

    if (view === 'list') {
    return (
      <div>
        <h1>User List</h1>
        <ul>
          {users.map(user => (
            <li key={user.id} onClick={() => handleUserClick(user)}>
              {user.username}
            </li>
          ))}
        </ul>
      </div>
    );
  }

    if (view === 'detail' && selectedUser) {

        const selectedUserData = users.find(user => user.username === selectedUser.username);

        
    return (
      <div>
        <ActiveChatTop setView={setView}/>
        <h1>User Metadata</h1>
        <p><strong>Username:</strong> {selectedUserData.username}</p>
        <p><strong>Email:</strong> {selectedUserData.email}</p>
        
        <div ref={chatBodyRef} className="chat-body">
          <ul>
          {selectedUserData.messages.map(message => (
            <li>
              <p>{message.text}</p>
              <p>{message.sender}</p>
              <p>{message.date_time}</p>
            </li>
          ))}
          </ul>
        </div>
        <div>
            <input
                type="text"
                value={newMessage}
                onChange={handleMessageChange}
                placeholder="Enter your message"
            />
            <button onClick={handleMessageInput}>Send</button>

        </div>
        <button onClick={handleBackClick}>Back to User List</button>
      </div>
    );

    }
    if ( view === 'call') {
      return (
        <p>view</p>
      )
    }
    if ( view === 'sender'){
      return (
        <Sender selectedUser={selectedUser} currentuser={currentuser} />
      )
    }

    if (view === 'receiver' && remotedata ){
      return (
        <Receiver remotedata={remotedata}/>
      )
    }


  return null;

};

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

