function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}


ReactDOM.render(<App />, document.querySelector("#create-class-button"));

function App (){

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


  if (!initialData){
    return<div>loading</div>;
  }

  return (
    
    <>
      <ToggleButton />
      {/* <hr id="my-hairline"></hr> */}
      {console.log("initial data loaded inside html",initialData)}
      <Joinclass/>
    </>
  )
}
