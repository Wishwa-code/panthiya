function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

function NavigationBar ({tabs, setActivetab, activetab, user}){

    

  console.log(tabs)
  return(
      <div id="side-navigation-bar">
          <p>{user}</p>
          {console.log(user)}
          <ul class="top_bar_nav">
              {tabs.map((tab) => (
                <li 
                class="nav-item" 
                key={tab}
                /*className={activetab === tab ? 'active' : ''}*/
                onClick={()=> setActivetab(tab)}
                >
                  <p class="nav-link" href="">
                    {tab}  
                  </p>
                </li>
              ))}
          </ul>
      </div>
      
  )};


function Mainapp ({activetab,currentuser, users, setUsers, logoutLink, loginLink}){

  const csrftoken = getCookie('csrftoken');
  console.log("inside main app",loginLink, logoutLink) 

  const handleLogout = () => {
        
        fetch(logoutLink, {
            method: 'POST',
            credentials: 'include', 
            headers: {
                'X-CSRFToken': csrftoken
            }// Include cookies in the request
        }).then(response => {
            console.log(response);
            // Handle the response, e.g., redirect to the login page
            window.location.href = loginLink;
        }).catch(error => {
            console.error('Logout failed:', error);
        });
        console.log(loginLink,logoutLink) 
        } 

  React.useEffect(() => {
    if (activetab === 'Logout') {
      handleLogout();
    }
  }, [activetab]); 

  const renderContent = () => {
    switch (activetab) {
      case'Classes':
        return <div> content for classes tab</div>
      case 'Join Class':
        return <Joinclass/>
      case'Community':
        return <ChatComponent currentuser={currentuser}/>
      case'Submissions':
        return <div> Content for Tab 4</div>;
      case 'Logout':
        return <div> Logging out...</div>
      default:
        return <div> <p>Only online class and peer to peer to peer text messages, audio or video calls are supported at the moment</p></br>
            <p> to create online classroom go to the join class tab and create class then share the details with other users </p> </br>
            <p> to message, audio or video calls go to community tab then select your freinds name then you will be able to text and call, if anything gooes wrong plz reload your browser.</div>;
    }
  };
  return (
        <div  id="main-inner-window">
          {renderContent()}
        </div>
  )
  };


ReactDOM.render(<Maincomponent />, document.querySelector("#main-component"));

function Maincomponent (){

  const [initialData, setinitialData ] = React.useState();
  const [ logoutlink , setlogoutlink] = React.useState();

  //user who is logged in right now
  const [currentUser, setcurrentUser] = React.useState();
  //list of freinds of current user
  const [users, setUsers] = React.useState();
  
  React.useEffect(() => {
     setinitialData(window.__INITIAL_DATA__); 
     console.log("initlal data",initialData);
        
  }, []);


  const connectionRef = React.useRef(null);

  React.useEffect(() => {
    /*React.store.dispatch('generatePeerId');*/
    window.REACT_APP_WS_ENDPOINT = 'wss://panthiya.onrender.com/';

    connectionRef.current = new WebSocket(`${window.REACT_APP_WS_ENDPOINT}ws/notification/`);

    console.log(connectionRef, currentUser)

    connectionRef.current.onmessage = (event) => {
      const message = JSON.parse(event.data).message;
      console.log("onmessage", message);

  };


    connectionRef.current.onopen = (event) => {
      console.log('Created', event);
    };

    return () => {
      connectionRef.current.close();
    };
  }, []);

  //const csrftoken = getCookie('csrftoken');
    

  const [activetab, setActivetab] = React.useState('home')
  const tabs = ['Home','Classes','Join Class', 'Community' , 'Submissions', 'Logout'];

  if (!initialData){
    return<div>loading</div>;
  }

  return (
    <>
      <NavigationBar tabs={tabs} activetab={activetab} setActivetab={setActivetab} loggedin={initialData.logged_in}  user={initialData.username} />
      <hr id="my-hairline"></hr>
      {console.log("initial data loaded inside html",initialData)}
      <Mainapp activetab={activetab} currentuser={initialData.username} logoutLink={initialData.logout_link} loginLink={initialData.login_link} />
    </>
  )
}
