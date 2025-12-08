import React, { Component } from "react";
import { Link } from "react-router-dom";

export default class CreateRoomPage extends Component {
  static defaultProps = {
    votesToSkip: 2,
    guestCanPause: true,
    update: false,
    roomCode: null,
    updateCallback: () => {},
  }

  constructor(props) {
    super(props);
    this.state = {
      guestCanPause: this.props.guestCanPause,
      votesToSkip: this.props.votesToSkip,
      errorMsg: '',
      successMsg: '',
    };

    this.handleRoomButtonPressed = this.handleRoomButtonPressed.bind(this);
    this.handleVotesChange = this.handleVotesChange.bind(this);
    this.handleGuestCanPauseChange = this.handleGuestCanPauseChange.bind(this);
    this.handleUpdateButtonPressed = this.handleUpdateButtonPressed.bind(this);
  }

  handleVotesChange(e) {
    this.setState({
      votesToSkip: e.target.value,
    });
  }

  handleGuestCanPauseChange(e) {
    this.setState({
      guestCanPause: e.target.value === "true" ? true : false,
    });
  }

  handleRoomButtonPressed() {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        votes_to_skip: this.state.votesToSkip,
        guest_can_pause: this.state.guestCanPause,
      }),
    };
    
    fetch("/api/create-room", requestOptions)
      .then((response) => response.json())
      .then((data) => this.props.history.push("/room/" + data.code));
  }

  renderCreateButtons() {
    return (
    <div className="container spacing-1">
        <div className="container-item align-center">
            <button
              className="btn btn-primary"
              onClick={this.handleRoomButtonPressed}
            >
              Create A Room
            </button>
          </div>
          <div className="container-item align-center">
            <Link to="/" className="btn btn-secondary">Back</Link>
          </div>
    </div>
    )
  }

  renderUpdateButtons() {
    return(
      <div className="container-item align-center">
            <button
              className="btn btn-primary"
              onClick={this.handleUpdateButtonPressed}
            >
              Update Room
            </button>
          </div>
    )
  }

  handleUpdateButtonPressed() {
    const requestOptions = {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        votes_to_skip: this.state.votesToSkip,
        guest_can_pause: this.state.guestCanPause,
        code: this.props.roomCode,
      }),
    };
    
    fetch("/api/update-room", requestOptions)
      .then((response) => {
        if (response.ok){
          this.setState({
            successMsg: 'Room updated successfully!'
          })
        } else {
          this.setState({
            errorMsg: 'Error updating room...'
          })
        }
        this.props.updateCallback();
      });
  }

  render() {
    const title = this.props.update ? 'Update Room' : 'Create a Room'
    const showAlert = this.state.errorMsg !== '' || this.state.successMsg !== '';

    return (
      <div className="container spacing-1" style={{padding: '24px', maxWidth: '500px', margin: '0 auto'}}>
        <div className="container-item align-center">
          {showAlert && (
            <div className={this.state.successMsg ? "alert alert-success" : "alert alert-error"}>
              <span>{this.state.successMsg || this.state.errorMsg}</span>
              <button 
                className="alert-close"
                onClick={() => {
                  if (this.state.successMsg) {
                    this.setState({successMsg: ''})
                  } else {
                    this.setState({errorMsg: ''})
                  }
                }}
              >
                ×
              </button>
            </div>
          )}
        </div>
        <div className="container-item align-center">
          <h4>{title}</h4>
        </div>
        <div className="container-item align-center">
          <div className="form-control">
            <div className="form-helper-text">
              <div>Guest Control of Playback State</div>
            </div>
            <div className="radio-group radio-group-row">
              <label className="radio-label">
                <input
                  type="radio"
                  value="true"
                  checked={this.state.guestCanPause === true}
                  onChange={this.handleGuestCanPauseChange}
                />
                <span className="radio-label-text">Play/Pause</span>
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  value="false"
                  checked={this.state.guestCanPause === false}
                  onChange={this.handleGuestCanPauseChange}
                />
                <span className="radio-label-text">No Control</span>
              </label>
            </div>
          </div>
        </div>
        <div className="container-item align-center">
          <div className="form-control">
            <input
              className="text-field"
              required={true}
              type="number"
              onChange={this.handleVotesChange}
              defaultValue={this.state.votesToSkip}
              min={1}
              style={{ textAlign: "center" }}
            />
            <div className="form-helper-text">
              <div>Votes Required To Skip Song</div>
            </div>
          </div>
        </div>
        {this.props.update ? this.renderUpdateButtons() : this.renderCreateButtons()}
      </div>
    );
  }
}
