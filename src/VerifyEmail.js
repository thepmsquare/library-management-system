import React, { Component } from "react";
import {
  Button,
  Typography,
  Snackbar,
  IconButton,
  Paper,
  TextField,
} from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import firebase from "./Firebase";
import "./stylesheets/VerifyEmail.css";

class VerifyEmail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isSnackbarOpen: false,
      snackbarMessage: "",
      isUserChangingEmail: false,
      newEmailInput: "",
      passwordInput: "",
    };
  }
  componentDidMount = () => {
    this.checkForVerification = setInterval(this.handleReload, 3000);
  };
  componentWillUnmount = () => {
    clearInterval(this.checkForVerification);
  };
  handleSnackbarClose = () => {
    this.setState(() => {
      return { isSnackbarOpen: false, snackbarMessage: "" };
    });
  };

  handleLogout = () => {
    firebase.auth().signOut();
  };

  handleReload = () => {
    this.props.user.reload();
    this.props.updateUser(this.props.user);
  };

  handleResend = () => {
    this.props.user
      .sendEmailVerification()
      .then(() => {
        this.setState(() => {
          return {
            isSnackbarOpen: true,
            snackbarMessage: `Email Resent to ${this.props.user.email}.`,
          };
        });
      })
      .catch((error) => {
        this.setState(() => {
          return {
            isSnackbarOpen: true,
            snackbarMessage: error.message,
          };
        });
      });
  };

  handleEmailChangeToggle = () => {
    this.setState((curState) => {
      return { isUserChangingEmail: !curState.isUserChangingEmail };
    });
  };

  handleInputChange = (e) => {
    const name = e.target.getAttribute("name");
    const value = e.target.value;
    this.setState(() => {
      return {
        [name]: value,
      };
    });
  };

  handleEmailChangeSubmit = (e) => {
    e.preventDefault();
    const credential = firebase.auth.EmailAuthProvider.credential(
      this.props.user.email,
      this.state.passwordInput
    );
    this.props.user
      .reauthenticateWithCredential(credential)
      .then(() => {
        this.props.user
          .updateEmail(this.state.newEmailInput)
          .then(() => {
            this.props.user
              .sendEmailVerification()
              .then(() => {
                this.setState(
                  () => {
                    return {
                      isSnackbarOpen: true,
                      snackbarMessage: `Email changed to ${this.state.newEmailInput}`,
                      isUserChangingEmail: false,
                      newEmailInput: "",
                      passwordInput: "",
                    };
                  },
                  () => {
                    this.props.user.reload();
                  }
                );
              })
              .catch((error) => {
                this.setState(() => {
                  return {
                    isSnackbarOpen: true,
                    snackbarMessage: error.message,
                  };
                });
              });
          })
          .catch((error) => {
            this.setState(() => {
              return {
                isSnackbarOpen: true,
                snackbarMessage: error.message,
              };
            });
          });
      })
      .catch((error) => {
        this.setState(() => {
          return {
            isSnackbarOpen: true,
            snackbarMessage: error.message,
          };
        });
      });
  };

  render = () => {
    return (
      <div className="VerifyEmail">
        <Typography>
          {this.props.user.displayName}, please Verify Email at{" "}
          {this.props.user.email}.
        </Typography>
        <Button onClick={this.handleResend}>Resend Email</Button>
        <Button onClick={this.handleReload}>Already Verified?</Button>
        <Button onClick={this.handleEmailChangeToggle}>
          Change Email Address
        </Button>
        {this.state.isUserChangingEmail ? (
          <Paper className="VerifyEmail-FormContainer">
            <form
              onSubmit={this.handleEmailChangeSubmit}
              className="VerifyEmail-Form"
            >
              <TextField
                label="New Email Address"
                type="email"
                required
                name="newEmailInput"
                value={this.state.newEmailInput}
                onChange={this.handleInputChange}
              ></TextField>
              <TextField
                label="Password"
                type="password"
                required
                name="passwordInput"
                value={this.state.passwordInput}
                onChange={this.handleInputChange}
              ></TextField>
              <Button type="submit">Submit</Button>
            </form>
          </Paper>
        ) : null}
        <Button color="secondary" onClick={this.handleLogout}>
          Logout
        </Button>
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

export default VerifyEmail;
