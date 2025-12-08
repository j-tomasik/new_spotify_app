import React, {useState} from 'react';
import {Link} from 'react-router-dom';

const pages = {
    JOIN: 'pages.join',
    CREATE: 'pages.create',
}

export default function Info(props){
    const [page, setPage] = useState(pages.CREATE);

    function joinInfo(){
        return (
            <div className="container spacing-4" style={{padding: '24px'}}>
                <div className="container-item align-center">
                    <h2 className="m-8">Join a Room Info!</h2>
                    <p className="m-8">
                        Once someone else has created a room and shared they key code they generated with you...
                    </p>
                    <p className="m-8">
                        Hit join a room from our home page, enter the room key code then enjoy their music and exercise your ability to play, pause and skip the song!
                    </p>
                </div>
            </div>
        );
    }

    function createInfo(){
        return (
            <div className="container spacing-8" style={{padding: '24px', maxWidth: '600px', margin: '0 auto'}}>
                <div className="container-item align-center">
                    <p className="m-8">
                        Allow for shared control of a what song your Spotify is playing.
                    </p>
                    <h2 className="m-8">Create a Room Info!</h2>
                    <div style={{textAlign: 'left', width: '100%'}}>
                        <p className="m-8">1. Play a song or playlist on your Spotify.</p>
                        <p className="m-8">2. Create a Room and pick your room's settings.</p>
                        <p className="m-8">3. Set up how many votes by room members are needed to skip a song.</p>
                        <p className="m-8">4. Decide if room members are allowed to pause and play the current song.</p>
                        <p className="m-8">5. Your room code can now be shared with others who can join and have the music play for them remotely.</p>
                        <p className="m-8">6. As the host you can edit the room settings to enable or disable previous settings and change the votes needed to skip.</p>
                        <p className="m-8">7. If you created the room you are the host. If the host leaves the room, the room will be deleted automatically.</p>
                        <p className="m-8">8. Enjoy!</p>
                    </div>
                </div>
            </div>
        );
    }

    return(
        <div className="container spacing-12" style={{padding: '24px'}}>
            <div className="container-item align-center">
                <h2>What is House Party?</h2>
                <div className="container-item align-center">
                    <div className="text-body">
                        {page === pages.JOIN ? joinInfo() : createInfo()}
                    </div>
                </div>
                <div className="container-item align-center">
                    <button 
                        className="icon-btn"
                        onClick={() => {
                            page === pages.CREATE ? setPage(pages.JOIN) : setPage(pages.CREATE);
                        }}
                        aria-label={page === pages.CREATE ? "Next" : "Previous"}
                        style={{fontSize: '24px'}}
                    >
                        {page === pages.CREATE ? '→' : '←'}
                    </button>
                </div>
                <div className="container-item align-center">
                    <Link to="/" className="btn btn-secondary">Back</Link>
                </div>
            </div>
        </div>
    )
}
