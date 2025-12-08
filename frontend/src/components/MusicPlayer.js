import React, { Component} from 'react';

export default class MusicPlayer extends Component {
    constructor(props){
        super(props);
    }

    pauseSong(){
        const requestOptions = {
            method: 'PUT',
            headers: {"Content-Type": "application/json"},
        };
        fetch("/spotify/pause", requestOptions)
    }

    playSong(){
        const requestOptions = {
            method: 'PUT',
            headers: {"Content-Type": "application/json"},
        };
        fetch("/spotify/play", requestOptions)
    }

    skipSong(){
        const requestOptions = {
            method: 'POST',
            headers: {"Content-Type": "application/json"},
        };
        
        fetch("/spotify/skip", requestOptions);
    }

    render(){
        const songProgress = this.props.duration ? (this.props.time / this.props.duration) * 100 : 0;
        const hasSong = this.props.title && this.props.title.trim() !== '';

        if (!hasSong) {
            return (
                <div className="card" style={{textAlign: 'center', padding: '32px'}}>
                    <p>No song currently playing</p>
                </div>
            );
        }

        return(
            <div className="card">
                <div className="music-player">
                    <img 
                        src={this.props.image_url || ''} 
                        alt={this.props.title}
                        className="music-player-image"
                    />
                    <div className="music-player-content">
                        <h5>{this.props.title || 'No title'}</h5>
                        <p className="text-secondary">{this.props.artist || 'Unknown artist'}</p>
                        <div className="music-player-controls">
                            <button 
                                className="icon-btn"
                                onClick={() => {this.props.is_playing ? this.pauseSong() : this.playSong()}}
                                aria-label={this.props.is_playing ? "Pause" : "Play"}
                            >
                                {this.props.is_playing ? '⏸' : '▶'}
                            </button>
                            <button 
                                className="icon-btn"
                                onClick={() => this.skipSong()}
                                aria-label="Skip"
                            >
                                ⏭
                            </button>
                            <span style={{marginLeft: '8px', fontSize: '14px'}}>
                                {this.props.votes || 0} / {this.props.votes_required || 1}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="progress-container">
                    <div className="progress-bar" style={{width: `${songProgress}%`}}></div>
                </div>
            </div>
        )
    }
}
