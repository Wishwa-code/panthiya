function ToggleButton() {
  const [isVisible, setIsVisible] = React.useState(true);

  const toggle = () => {
    const navbar = document.getElementById('side-navigation-bar');

    if (isVisible) {
      // Start transition
      navbar.classList.add('hide');

      // Wait for CSS transition to finish, then hide completely
      setTimeout(() => {
        navbar.style.display = 'none';
      }, 1); // Match the transition duration
    } else {
      // Make visible again before removing class
      navbar.style.display = 'flex';

      // Force reflow to apply transition cleanly
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