function Joinclass () {
    const [view, setView] = React.useState('main');

    const displayjoin = () => {
        setView('join');
    };

    const displaycreate = () => {
        setView('create');
    }
    if (view === 'main') {
        return(
            <div className="joinclass">
                <button
                className=""
                onClick={() => displayjoin()}
                > 
                Join class 
                </button>
                <button
                className=""
                onClick={() => displaycreate()}
                >
                Create class
                </button>
            </div>
            
        )
    }
    if (view === 'create') {
        return(
            <>
            <CreateClass/>
            <button
                onClick={() => setView('main')}
                >go back</button>
            </>    
        )
    }
    if (view === 'join') {
        return(
            <>
                <Conference/>
                <button
                onClick={() => setView('main')}
                >go back</button>
                <p>this is create class</p>
            </>
            
        )
    }
     
}