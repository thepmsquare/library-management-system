import React, { Component } from "react";
import {
  Paper,
  Tabs,
  Tab,
  TextField,
  Button,
  Snackbar,
  IconButton,
} from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import firebase from "./Firebase";
import "./stylesheets/LoginRegister.css";
const db = firebase.firestore();

class LoginRegister extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tabValue: 0,
      loginEmail: "",
      loginPassword: "",
      registerUsername: "",
      registerEmail: "",
      registerPassword: "",
      registerPasswordConfirm: "",
      registerAdminKey: "",
      isSnackbarOpen: false,
      snackbarMessage: "",
    };
  }

  handleTabValueChange = (e, newValue) => {
    this.setState(() => {
      return { tabValue: newValue };
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

  handleSnackbarClose = () => {
    this.setState(() => {
      return { isSnackbarOpen: false, snackbarMessage: "" };
    });
  };

  handleLoginSubmit = (e) => {
    e.preventDefault();
    firebase
      .auth()
      .signInWithEmailAndPassword(
        this.state.loginEmail,
        this.state.loginPassword
      )
      .catch((error) => {
        this.setState(() => {
          return {
            isSnackbarOpen: true,
            snackbarMessage: error.message,
          };
        });
      });
  };

  handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (this.state.registerPassword === this.state.registerPasswordConfirm) {
      if (this.state.registerAdminKey !== "") {
        db.collection("AdminKeys")
          .where("Keys", "!=", [])
          .get()
          .then((querySnapshot) => {
            const docs = [];
            querySnapshot.forEach((doc) => docs.push(doc.data()));
            if (
              docs.length !== 0 &&
              docs[0].Keys.indexOf(this.state.registerAdminKey) !== -1
            ) {
              this.registerUser(true);
            } else {
              this.setState(() => {
                return {
                  isSnackbarOpen: true,
                  snackbarMessage: "Invalid Admin Keys",
                };
              });
            }
          })
          .catch((error) => {
            this.setState(() => {
              return {
                isSnackbarOpen: true,
                snackbarMessage: error.message,
              };
            });
          });
      } else {
        this.registerUser(false);
      }
    } else {
      this.setState(() => {
        return {
          isSnackbarOpen: true,
          snackbarMessage: "Passwords do not match.",
        };
      });
    }
  };

  registerUser = (isAdmin) => {
    firebase
      .auth()
      .createUserWithEmailAndPassword(
        this.state.registerEmail,
        this.state.registerPassword
      )
      .then((userCredential) => {
        userCredential.user
          .updateProfile({
            displayName: this.state.registerUsername,
          })
          .then(() => {
            db.collection("Users")
              .doc(userCredential.user.uid)
              .set({ isAdmin })
              .then(() => {
                userCredential.user.sendEmailVerification().catch((error) => {
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
      <div className="LoginRegister">
        <Paper elevation={3} className="LoginRegister-FormContainer">
          <Tabs
            value={this.state.tabValue}
            onChange={this.handleTabValueChange}
          >
            <Tab label="Login" />
            <Tab label="Register" />
          </Tabs>
          {this.state.tabValue === 0 ? (
            <form
              onSubmit={this.handleLoginSubmit}
              className="LoginRegister-Form"
            >
              <TextField
                label="Email"
                type="email"
                required
                name="loginEmail"
                value={this.state.loginEmail}
                onChange={this.handleInputChange}
              ></TextField>
              <TextField
                label="Password"
                type="password"
                required
                name="loginPassword"
                value={this.state.loginPassword}
                onChange={this.handleInputChange}
              ></TextField>
              <Button type="submit">Log In</Button>
            </form>
          ) : (
            <form
              onSubmit={this.handleRegisterSubmit}
              className="LoginRegister-Form"
            >
              <TextField
                label="Username"
                required
                name="registerUsername"
                value={this.state.registerUsername}
                onChange={this.handleInputChange}
              ></TextField>
              <TextField
                label="Email"
                type="email"
                required
                name="registerEmail"
                value={this.state.registerEmail}
                onChange={this.handleInputChange}
              ></TextField>
              <TextField
                label="Password"
                type="password"
                required
                name="registerPassword"
                value={this.state.registerPassword}
                onChange={this.handleInputChange}
              ></TextField>
              <TextField
                label="Confirm Password"
                type="password"
                required
                name="registerPasswordConfirm"
                value={this.state.registerPasswordConfirm}
                onChange={this.handleInputChange}
              ></TextField>
              <TextField
                type="password"
                label="Admin Key"
                name="registerAdminKey"
                value={this.state.registerAdminKey}
                onChange={this.handleInputChange}
              ></TextField>
              <Button type="submit">Register</Button>
            </form>
          )}
        </Paper>
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

export default LoginRegister;
