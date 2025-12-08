import React, { Component } from "react";
import {Link} from 'react-router-dom';

export default class RoomJoinPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      roomCode: "",
      error: "",
    }
    this.handleTextFieldChange = this.handleTextFieldChange.bind(this)
    this.roomButtonPressed = this.roomButtonPressed.bind(this)
  }

  render() {
    return (
      <div className="container spacing-1" style={{padding: '24px', maxWidth: '500px', margin: '0 auto'}}>
          <div className="container-item align-center">
            <h4>Join a Room</h4>
          </div>
          <div className="container-item align-center">
            <input 
              className={`text-field ${this.state.error ? 'error' : ''}`}
              type="text"
              placeholder="Enter a Room Code"
              value={this.state.roomCode}
              onChange={this.handleTextFieldChange}
            />
            {this.state.error && (
              <div className="text-field-error text-field-helper">{this.state.error}</div>
            )}
          </div>
          <div className="container-item align-center">
            <button className="btn btn-primary" onClick={this.roomButtonPressed}>Enter Room</button>
          </div>
          <div className="container-item align-center">
            <Link to="/" className="btn btn-secondary">Back</Link>
          </div>
      </div>
    )
  }

  handleTextFieldChange(e) {
    this.setState({
      roomCode: e.target.value,
      error: "" // Clear error on change
    })
  }

  roomButtonPressed(){
    const requestOptions = {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        code: this.state.roomCode
      })
    };
    fetch('/api/join-room', requestOptions).then((response) =>{
      if(response.ok) {
        this.props.history.push(`/room/${this.state.roomCode}`)
      } else {
        this.setState({error: "Room not found"})
      }
    }).catch((error) => console.log(error))

  }
}
