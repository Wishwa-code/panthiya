function MainContainer ({activetab,currentuser, users, setUsers, logoutLink, loginLink}){

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

  const renderMainContainer = () => {
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
        return (
            <div>
                <p>Only online class and peer to peer text messages, audio or video calls are supported at the moment</p>
                <br />
                <p>To create an online classroom, go to the join class tab and create a class, then share the details with other users.</p>
                <br />
                <p>To message, audio, or video calls, go to the community tab, select your friend's name, then you will be able to text and call. If anything goes wrong, please reload your browser.</p>
            </div>
        );
    }
  };

  return (
        <div  id="main-inner-window">
          {renderMainContainer()}
        </div>
  )
  };