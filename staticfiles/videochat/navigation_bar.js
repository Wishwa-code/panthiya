function NavigationBar ({tabs, setActivetab, activetab, user, profileImage}){
    const [isVisible, setIsVisible] = React.useState(false);

    const toggleVisibility = () => {
        setIsVisible((prevState) => !prevState);
    };

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
                    {tabs.map((tab) => (
                        <li 
                        className={`nav-item ${activetab === tab ? 'active' : ''}`}
                        key={tab}
                        onClick={()=> setActivetab(tab)}
                        >
                            <span className="icon">🏠</span>
                            <p className="nav-link">{tab}</p>
                        </li>
                    ))}
                </ul>

                {/* CTA Button */}
                <button className="create-button">Create a Classroom</button>

                {/* Bottom Settings */}
                <div className="bottom-options">
                    <div className="option-item"><span className="icon">❓</span> Help and Support</div>
                    <div className="option-item"><span className="icon">⚙️</span> Settings</div>
                </div>
            </div>

            <button className={`toggle-button ${isVisible ? 'visible' : ''}`} onClick={toggleVisibility}>
                <span className={`chevron ${isVisible ? 'rotate' : ''}`}>&#8250;</span>
            </button>
        </>


      
  )};

// CSS classes for chevron rotation
// .chevron {
//   display: inline-block;
//   transition: transform 0.3s ease;
// }
// .rotate {
//   transform: rotate(180deg);
// }