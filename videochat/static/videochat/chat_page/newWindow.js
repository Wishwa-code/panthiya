
function NewWindow(props) {
    const [container, setContainer] = React.useState(null);
    const newWindow = React.useRef(null);

    React.useEffect(() => {
        newWindow.current = window.open('', 'callWindow', 'width=700,height=600');

        const div = newWindow.current.document.createElement('div');
        newWindow.current.document.body.appendChild(div);
        setContainer(div);
        
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

        newWindow.current.document.title = "Video Call";

        const handleUnload = () => {
            if (props.onUnload) {
                props.onUnload();
            }
        };
        newWindow.current.addEventListener('beforeunload', handleUnload);

        return () => {
            handleUnload();
            newWindow.current.close();
        };
    }, []);

    return container ? ReactDOM.createPortal(props.children, container) : null;
}