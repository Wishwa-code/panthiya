function ToggleButton() {
  const [isVisible, setIsVisible] = React.useState(true);

  const toggle = () => {
    const navbar = document.getElementById('side-navigation-bar');

    if (isVisible) {
      navbar.classList.add('hide');

      setTimeout(() => {
        navbar.style.display = 'none';
      }, 1); 
    } else {
      navbar.style.display = 'flex';

      void navbar.offsetWidth;

      navbar.classList.remove('hide');
    }

    setIsVisible(!isVisible);
  };

  return (
    <button className={`toggle-button ${isVisible ? 'hide' : ''}`} onClick={toggle}>
      <span className={`chevron ${isVisible ? 'rotate' : ''}`}>&#8250;</span>
    </button>
  );
}

ReactDOM.render(<ToggleButton />, document.querySelector("#toggle-menu-button"));