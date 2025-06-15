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
            <div id="side-navigation-bar" className={`navbar ${isVisible ? '' : 'visible'}`}>
                <div className="profile-section">
                    <img className="profile-pic" src={profileImage} alt="User" />
                    <p className="user-name">{user}</p>
                </div>
                {console.log(user)}
                <ul class="top_bar_nav">
                    {tabs.map((tab,index) => (
                        <li 
                        className={`nav-item ${activetab === tab.name ? 'active' : ''}`}
                        key={index}
                        onClick={()=> setActivetab(tab.name)}
                        >
                            <i class={`fa-duotone fa-solid ${tab.icon} nav-bar-icons`}></i>
                            <p className="nav-link">{tab.name}</p>
                        </li>
                    ))}
                </ul>

                {/* CTA Button */}
                <button className="create-button">Create a Classroom</button>

                {/* Bottom Settings */}
                <div className="bottom-options">
                    <div className="option-item"><span className="icon">⚙️</span> Settings</div>
                    <div className="option-item" onClick={handleLogout}><span className="icon">🪵➡️</span> Logout</div>
                </div>
            </div>

            <button className={`toggle-button ${isVisible ? 'visible' : ''}`} onClick={toggleVisibility}>
                <span className={`chevron ${isVisible ? 'rotate' : ''}`}>&#8250;</span>
            </button>
        </>


      
  )};
