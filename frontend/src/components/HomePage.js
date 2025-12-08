import React, { Component } from "react";
import RoomJoinPage from "./RoomJoinPage";
import CreateRoomPage from "./CreateRoomPage";
import Room from "./Room";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  Redirect,
} from "react-router-dom";
import Info from './Info';

export default class HomePage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      roomCode: null,
    };
    this.clearRoomCode = this.clearRoomCode.bind(this);
  }

  async componentDidMount(){
    fetch('/api/user-in-room').then((response) => response.json())
    .then((data) =>{
      this.setState({
        roomCode: data.code
      })
    });
  }

  clearRoomCode() {
    this.setState({
      roomCode: null
    });
  }

  renderHomePage() {
    return(
      <div className="container spacing-3" style={{padding: '24px'}}>
          <div className="container-item align-center">
            <h3>House Party</h3>
          </div>
          <div className="container-item align-center">
            <div className="btn-group">
              <Link to="/join" className="btn btn-primary">Join a Room</Link>
              <Link to="/info" className="btn btn-default">Info</Link>
              <Link to="/create" className="btn btn-secondary">Create a Room</Link>
            </div>
          </div>
      </div>
    );
  }

  render() {
    return (
      <Router>
        <Switch>
          <Route exact path="/" render={() => {
            return this.state.roomCode ? (<Redirect to={`/room/${this.state.roomCode}`} />) : this.renderHomePage()
          }} />
        
          <Route path="/join" component={RoomJoinPage} />
          <Route path='/info' component={Info}/>
          <Route path="/create" component={CreateRoomPage} />
          <Route path='/room/:roomCode' render={(props) => {
            return <Room {...props} leaveRoomCallback={this.clearRoomCode}/>
          }} />
        </Switch>
      </Router>
    );
  }
}
