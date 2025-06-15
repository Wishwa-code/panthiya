function ToggleButton ({}){
    
    const csrftoken = getCookie('csrftoken');
    const [isVisible, setIsVisible] = React.useState(false);
    const toggle = () => setIsVisible(v => !v);


    React.useEffect(() => {
      document
        .getElementById('side-navigation-bar')
        .classList.toggle('visible', isVisible);
    }, [isVisible]);


  return(
    

        <>
            <button className={`toggle-button ${!isVisible ? 'visible' : ''}`} onClick={toggle}>
                <span className={`chevron ${!isVisible ? 'rotate' : ''}`}>&#8250;</span>
            </button>
        </>


      
  )};
