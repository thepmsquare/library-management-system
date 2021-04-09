import React, { Component } from "react";
import firebase from "./Firebase";
import { Snackbar, IconButton } from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import Header from "./Header";
import Profile from "./Profile";
import Library from "./Library";

class Homepage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isSnackbarOpen: false,
      snackbarMessage: "",
      componentInFocus: "Library",
    };
  }

  handleLogout = () => {
    firebase.auth().signOut();
  };

  handleSnackbarOpen = (snackbarMessage) => {
    this.setState(() => {
      return { isSnackbarOpen: true, snackbarMessage };
    });
  };

  handleSnackbarClose = () => {
    this.setState(() => {
      return { isSnackbarOpen: false, snackbarMessage: "" };
    });
  };

  handleChangeFocus = (componentInFocus) => {
    this.setState(() => {
      return { componentInFocus };
    });
  };

  render = () => {
    return (
      <div className="Homepage">
        <Header
          user={this.props.user}
          userIsAdmin={this.props.userIsAdmin}
          handleSnackbarOpen={this.handleSnackbarOpen}
          handleLogout={this.handleLogout}
          handleChangeFocus={this.handleChangeFocus}
        />
        {this.state.componentInFocus === "Library" && <Library />}
        {this.state.componentInFocus === "Profile" && (
          <Profile handleChangeFocus={this.handleChangeFocus} />
        )}
        <Snackbar
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
          open={this.state.isSnackbarOpen}
          autoHideDuration={6000}
          onClose={this.handleSnackbarClose}
          message={this.state.snackbarMessage}
          action={
            <React.Fragment>
              <IconButton
                size="small"
                aria-label="close"
                color="inherit"
                onClick={this.handleSnackbarClose}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </React.Fragment>
          }
        />
      </div>
    );
  };
}

export default Homepage;
