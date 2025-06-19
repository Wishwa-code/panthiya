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

                <h2 style={{textAlign: 'start'}}>Choose an Option</h2>
                <div className="card-container">
                <div className="card-button" onClick={displayjoin}>
                    <h3>Join Class</h3>
                </div>
                <div className="card-button" onClick={displaycreate}>
                    <h3>Create Class</h3>
                </div>
            </div>
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