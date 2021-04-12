import React, { Component } from "react";
import firebase from "./Firebase";
import { Snackbar, IconButton } from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import Header from "./Header";
import Profile from "./Profile";
import Library from "./Library";
import Drawer from "./Drawer";
import Inventory from "./Inventory";
import "./stylesheets/Homepage.css";

class Homepage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isSnackbarOpen: false,
      snackbarMessage: "",
      componentInFocus: "Library",
      isDrawerOpen: false,
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

  handleDrawerClose = () => {
    this.setState(() => {
      return {
        isDrawerOpen: false,
      };
    });
  };

  handleDrawerOpen = () => {
    this.setState(() => {
      return {
        isDrawerOpen: true,
      };
    });
  };

  render = () => {
    return (
      <div className="Homepage">
        <Header
          user={this.props.user}
          isUserAdmin={this.props.isUserAdmin}
          handleSnackbarOpen={this.handleSnackbarOpen}
          handleLogout={this.handleLogout}
          handleChangeFocus={this.handleChangeFocus}
          handleDrawerOpen={this.handleDrawerOpen}
        />
        {this.state.componentInFocus === "Library" && <Library />}
        {this.state.componentInFocus === "Profile" && (
          <Profile
            handleChangeFocus={this.handleChangeFocus}
            user={this.props.user}
            isUserAdmin={this.props.isUserAdmin}
            handleSnackbarOpen={this.handleSnackbarOpen}
          />
        )}
        {this.state.componentInFocus === "Inventory" && (
          <Inventory handleSnackbarOpen={this.handleSnackbarOpen} />
        )}
        <Drawer
          isDrawerOpen={this.state.isDrawerOpen}
          handleDrawerClose={this.handleDrawerClose}
          isUserAdmin={this.props.isUserAdmin}
          handleChangeFocus={this.handleChangeFocus}
        />
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
