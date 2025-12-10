import React, { Component} from 'react';
import CreateRoomPage from './CreateRoomPage';
import MusicPlayer from './MusicPlayer';

export default class Room extends Component {
    constructor(props){
        super(props);
        this.state = {
            votesToSkip: 2,
            guestCanPause: false,
            isHost: false,
            showSettings: false,
            spotifyAuthenticated: false,
            song: {}
        }
        this.roomCode = this.props.match.params.roomCode;
        this.leaveButtonPressed = this.leaveButtonPressed.bind(this);
        this.updateShowSettings = this.updateShowSettings.bind(this);
        this.renderSettings = this.renderSettings.bind(this);
        this.renderSetttingsButton = this.renderSetttingsButton.bind(this);
        this.getRoomDetails = this.getRoomDetails.bind(this);
        this.authenticateSpotify = this.authenticateSpotify.bind(this);
        this.getCurrentSong = this.getCurrentSong.bind(this);
        this.getRoomDetails();
        this.getCurrentSong()
    }

    componentDidMount(){
        this.interval = setInterval(this.getCurrentSong, 2000)
    }
    componentWillUnmount(){
        clearInterval(this.interval);
    }

    getRoomDetails() {
        fetch("/api/get-room" + "?code=" + this.roomCode)
        .then((response) => {
            if(!response.ok) {
                this.props.leaveRoomCallback();
                this.props.history.push("/");
            }
            return response.json();
        })
        .then((data) => {
            this.setState({
                votesToSkip: data.votes_to_skip,
                guestCanPause: data.guest_can_pause,
                isHost: data.is_host,
            });
            if(data.is_host) {
                this.authenticateSpotify()
            }
        });
    }

    authenticateSpotify() {
        fetch("/spotify/is-authenticated")
            .then((response) => response.json())
            .then((data) => {
                this.setState({ spotifyAuthenticated: data.status });
                
                if (!data.status) {
                    fetch("/spotify/get-auth-url")
                        .then((response) => response.json())
                        .then((data) => {
                            window.location.replace(data.url);
                        });
                }
            });
    }
    
    getCurrentSong(){
        fetch('/spotify/current-song').then((response) => {
            if (response.status === 204 || !response.ok) {
                this.setState({song: {}});
                return;
            }
            return response.json();
        }).then((data) => {
            if (data) {
                this.setState({song: data});
            }
        }).catch((error) => {
            console.error('Error fetching current song:', error);
            this.setState({song: {}});
        });
    }

    leaveButtonPressed(){
        const requestOptions = {
            method: "POST",
            headers: {'Content-Type': 'application/json'},
        }
        fetch('/api/leave-room', requestOptions).then(_response => {
            this.props.leaveRoomCallback();
            this.props.history.push("/");
        })
    }

    updateShowSettings(value) {
        this.setState({
            showSettings: value,
        })
    }

    renderSettings(){
        return(
            <div className="container spacing-1" style={{padding: '24px'}}>
                <div className="container-item align-center">
                    <CreateRoomPage 
                        update={true} 
                        votesToSkip={this.state.votesToSkip} 
                        guestCanPause={this.state.guestCanPause} 
                        roomCode={this.roomCode}
                        updateCallback={this.getRoomDetails}
                    />
                </div>
                <div className="container-item align-center">
                    <button 
                        className="btn btn-secondary" 
                        onClick={() => this.updateShowSettings(false)}
                    >
                        Close
                    </button>
                </div>
            </div>
        )
    }

    renderSetttingsButton() {
        return(
            <div className="container-item align-center">
                <button 
                    className="btn btn-primary" 
                    onClick={() => this.updateShowSettings(true)}
                >
                    Settings
                </button>
            </div>
        )
    }

    render(){
        if(this.state.showSettings) {
            return this.renderSettings();
        } 
        return(
            <div className="container spacing-1" style={{padding: '24px'}}>
                <div className="container-item align-center">
                    <h4>Code: {this.roomCode}</h4>
                </div>
                <div className="container-item align-center" style={{width: '100%'}}>
                    <MusicPlayer {...this.state.song}/>
                </div>
                {this.state.isHost ? this.renderSetttingsButton() : null}
                <div className="container-item align-center">
                    <button 
                        className="btn btn-secondary" 
                        onClick={this.leaveButtonPressed}
                    >
                        Leave Room
                    </button>
                    <button onClick={()=> this.previousSong()}>
                        Previous Song
                    </button>
                </div>
            </div>
        ) 
    }
}
