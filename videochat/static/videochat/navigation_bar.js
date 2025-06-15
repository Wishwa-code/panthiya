function NavigationBar ({ setActivetab, activetab, user, profileImage, logoutLink, loginLink}){
    
    const csrftoken = getCookie('csrftoken');
    const [isVisible, setIsVisible] = React.useState(false);
      const tabs = [
        { name: 'Classes', icon: 'fa-chalkboard-user' },
        { name: 'Freinds', icon: 'fa-comments' }
        ];

    const toggleVisibility = () => {
        setIsVisible((prevState) => !prevState);
    };

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

  console.log(tabs)
  console.log('profile image',profileImage)
  return(
    

        <>
            <button className={`toggle-button ${isVisible ? 'visible' : ''}`} onClick={toggleVisibility}>
                <span className={`chevron ${isVisible ? 'rotate' : ''}`}>&#8250;</span>
            </button>
        </>


      
  )};
