import React, { Component } from "react";
import firebase from "./Firebase";
import { Button } from "@material-ui/core";

class Homepage extends Component {
  handleLogout = () => {
    firebase.auth().signOut();
  };

  render = () => {
    return (
      <div className="Homepage">
        <h1>Homepage</h1>
        <Button color="secondary" onClick={this.handleLogout}>
          Logout
        </Button>
      </div>
    );
  };
}

export default Homepage;
