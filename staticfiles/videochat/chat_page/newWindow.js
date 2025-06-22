// NewWindow.js - Create this new file

function NewWindow(props) {
    const [container, setContainer] = React.useState(null);
    const newWindow = React.useRef(null);

    React.useEffect(() => {
        // Open a new window and store a reference to it
        newWindow.current = window.open('', 'callWindow', 'width=700,height=600');

        // Create a container div in the new window to render into
        const div = newWindow.current.document.createElement('div');
        newWindow.current.document.body.appendChild(div);
        setContainer(div);
        
        // Copy all stylesheets from the main page to the new window
        Array.from(document.styleSheets).forEach(styleSheet => {
            if (styleSheet.href) {
                const newLinkEl = newWindow.current.document.createElement('link');
                newLinkEl.rel = 'stylesheet';
                newLinkEl.href = styleSheet.href;
                newWindow.current.document.head.appendChild(newLinkEl);
            } else if (styleSheet.cssRules) {
                const newStyleEl = newWindow.current.document.createElement('style');
                Array.from(styleSheet.cssRules).forEach(rule => {
                    newStyleEl.appendChild(newWindow.current.document.createTextNode(rule.cssText));
                });
                newWindow.current.document.head.appendChild(newStyleEl);
            }
        });

        // Set a title for the new window
        newWindow.current.document.title = "Video Call";

        // Call the onUnload prop when the popup is closed
        const handleUnload = () => {
            if (props.onUnload) {
                props.onUnload();
            }
        };
        newWindow.current.addEventListener('beforeunload', handleUnload);

        // Cleanup: close the window when the main component unmounts
        return () => {
            handleUnload();
            newWindow.current.close();
        };
    }, []);

    // Render the children (Sender or Receiver component) into the new window
    return container ? ReactDOM.createPortal(props.children, container) : null;
}