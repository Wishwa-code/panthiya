function NavigationBar ({tabs, setActivetab, activetab, user}){
    const [isVisible, setIsVisible] = React.useState(false);

    const toggleVisibility = () => {
        setIsVisible((prevState) => !prevState);
    };

  console.log(tabs)
  return(
    

        <>
            <div id="side-navigation-bar" className={`navbar ${isVisible ? '' : 'visible'}`}>
                <p>{user}</p>
                {console.log(user)}
                <ul class="top_bar_nav">
                    {tabs.map((tab) => (
                        <li 
                        class="nav-item" 
                        key={tab}
                        onClick={()=> setActivetab(tab)}
                        >
                        <p class="nav-link" href="">
                            {tab}  
                        </p>
                        </li>
                    ))}
                </ul>
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