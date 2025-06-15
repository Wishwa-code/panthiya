function MainContainer ({activetab,currentuser, users, setUsers}){




  // React.useEffect(() => {
  //   if (activetab === 'Logout') {
  //     handleLogout();
  //   }
  // }, [activetab]); 

  const renderMainContainer = () => {
    switch (activetab) {
      case'Classes':
        return <Joinclass/>
      case 'Freinds':
        return <ChatComponent currentuser={currentuser}/>
      default:
        return <Joinclass/>
    }
  };

  return (
        <div  id="main-inner-window">
          {renderMainContainer()}
        </div>
  )
  };