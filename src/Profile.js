import React, { Component } from "react";
import {
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Typography,
} from "@material-ui/core";
import EditIcon from "@material-ui/icons/Edit";
import CloseIcon from "@material-ui/icons/Close";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import firebase from "./Firebase";
import "./stylesheets/Profile.css";
const db = firebase.firestore();

class Profile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isChangeDisplayNameExpanded: false,
      newUsername: "",
      isChangeEmailExpanded: false,
      newEmail: "",
      newEmailPassword: "",
      isChangePasswordExpanded: false,
      oldPassword: "",
      newPassword: "",
      newPasswordConfirm: "",
      isChangeAdminKeysExpanded: false,
      newAdminKey: "",
      isDeleteAccountExpanded: false,
      deletePassword: "",
      adminKey: "",
    };
  }

  componentDidMount = () => {
    this.unSubAdminKeys = db
      .collection("AdminKeys")
      .where("Keys", "!=", [])
      .onSnapshot((querySnapshot) => {
        const docs = [];
        querySnapshot.forEach((doc) => docs.push(doc.data()));
        if (docs[0]) {
          this.setState(() => {
            return { adminKey: docs[0].Keys };
          });
        }
      });
  };

  componentWillUnmount = () => {
    this.unSubAdminKeys();
  };

  handleChangeFocus = () => {
    this.props.handleChangeFocus(
      this.props.isUserAdmin ? "Inventory" : "Library"
    );
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

  handleChangeDisplayNameExpandedToggle = (e, isExpanded) => {
    this.setState(() => {
      return { isChangeDisplayNameExpanded: isExpanded };
    });
  };

  handleChangeDisplayNameSubmit = (e) => {
    e.preventDefault();
    this.props.user
      .updateProfile({
        displayName: this.state.newUsername,
      })
      .then(() => {
        this.setState(
          () => {
            return { newUsername: "", isChangeDisplayNameExpanded: false };
          },
          () => {
            this.props.handleSnackbarOpen("Username Updated.");
          }
        );
      })
      .catch((error) => {
        this.props.handleSnackbarOpen(error.message);
      });
  };

  handleChangeEmailExpandedToggle = (e, isExpanded) => {
    this.setState(() => {
      return { isChangeEmailExpanded: isExpanded };
    });
  };

  handleChangeEmailSubmit = (e) => {
    e.preventDefault();
    const credential = firebase.auth.EmailAuthProvider.credential(
      this.props.user.email,
      this.state.newEmailPassword
    );
    this.props.user
      .reauthenticateWithCredential(credential)

      .then(() => {
        this.props.user
          .updateEmail(this.state.newEmail)
          .then(() => {
            this.props.user
              .sendEmailVerification()
              .then(() => {
                this.setState(
                  () => {
                    return {
                      newEmail: "",
                      newPassword: "",
                      isChangeEmailExpanded: false,
                    };
                  },
                  () => {
                    this.props.handleSnackbarOpen(
                      "Email Updated. Verify New Email Address."
                    );
                    window.location.reload();
                  }
                );
              })
              .catch((error) => {
                this.props.handleSnackbarOpen(error.message);
              });
          })
          .catch((error) => {
            this.props.handleSnackbarOpen(error.message);
          });
      })
      .catch((error) => {
        this.props.handleSnackbarOpen(error.message);
      });
  };

  handleChangePasswordExpandedToggle = (e, isExpanded) => {
    this.setState(() => {
      return { isChangePasswordExpanded: isExpanded };
    });
  };

  handleChangePasswordSubmit = (e) => {
    e.preventDefault();
    if (this.state.newPassword === this.state.newPasswordConfirm) {
      const credential = firebase.auth.EmailAuthProvider.credential(
        this.props.user.email,
        this.state.oldPassword
      );
      this.props.user
        .reauthenticateWithCredential(credential)
        .then(() => {
          this.props.user
            .updatePassword(this.state.newPassword)
            .then(() => {
              this.setState(
                () => {
                  return {
                    oldPassword: "",
                    newPassword: "",
                    newPasswordConfirm: "",
                    isChangePasswordExpanded: false,
                  };
                },
                () => {
                  this.props.handleSnackbarOpen("Password Updated.");
                }
              );
            })
            .catch((error) => {
              this.props.handleSnackbarOpen(error.message);
            });
        })
        .catch((error) => {
          this.props.handleSnackbarOpen(error.message);
        });
    } else {
      this.props.handleSnackbarOpen("New Passwords do not match.");
    }
  };

  handleChangeAdminKeysExpandedToggle = (e, isExpanded) => {
    this.setState(() => {
      return { isChangeAdminKeysExpanded: isExpanded };
    });
  };

  handleChangeAdminKeysSubmit = (e) => {
    e.preventDefault();

    db.collection("AdminKeys")
      .where("Keys", "!=", [])
      .get()
      .then((querySnapshot) => {
        const docs = [];
        querySnapshot.forEach((doc) => docs.push(doc.ref));
        if (docs[0]) {
          docs[0]
            .update({ Keys: this.state.newAdminKey })
            .then(() => {
              this.setState(
                () => {
                  return {
                    newAdminKey: "",
                    isChangeAdminKeysExpanded: false,
                  };
                },
                () => {
                  this.props.handleSnackbarOpen("Updated AdminKey.");
                }
              );
            })
            .catch((error) => {
              this.props.handleSnackbarOpen(error.message);
            });
        } else {
          this.props.handleSnackbarOpen("Error while fetching AdminKey.");
        }
      })
      .catch((error) => {
        this.props.handleSnackbarOpen(error.message);
      });
  };

  handleDeleteAccountExpandedToggle = (e, isExpanded) => {
    this.setState(() => {
      return { isDeleteAccountExpanded: isExpanded };
    });
  };

  handleDeleteAccountSubmit = (e) => {
    e.preventDefault();
    const credential = firebase.auth.EmailAuthProvider.credential(
      this.props.user.email,
      this.state.deletePassword
    );
    this.props.user
      .reauthenticateWithCredential(credential)
      .then(() => {
        db.collection("Users")
          .doc(this.props.user.uid)
          .delete()
          .then(() => {
            this.props.user.delete().catch((error) => {
              this.props.handleSnackbarOpen(error.message);
            });
          })
          .catch((error) => {
            this.props.handleSnackbarOpen(error.message);
          });
      })
      .catch((error) => {
        this.props.handleSnackbarOpen(error.message);
      });
  };

  render = () => {
    return (
      <div className="Profile">
        <div className="Profile-BackButtonContainer">
          <Button onClick={this.handleChangeFocus}>
            Back to {this.props.isUserAdmin ? "Inventory" : "Library"}
          </Button>
        </div>

        <div className="Profile-AccordionContainer">
          <Accordion
            expanded={this.state.isChangeDisplayNameExpanded}
            onChange={this.handleChangeDisplayNameExpandedToggle}
          >
            <AccordionSummary
              expandIcon={
                !this.state.isChangeDisplayNameExpanded ? (
                  <EditIcon />
                ) : (
                  <CloseIcon />
                )
              }
            >
              <Typography>Username</Typography>
              <Typography>{this.props.user.displayName}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <form
                className="Profile-AccordionForm"
                onSubmit={this.handleChangeDisplayNameSubmit}
              >
                <TextField
                  label="New Username"
                  name="newUsername"
                  value={this.state.newUsername}
                  onChange={this.handleInputChange}
                  required
                ></TextField>
                <Button type="submit">Submit</Button>
              </form>
            </AccordionDetails>
          </Accordion>

          <Accordion
            expanded={this.state.isChangeEmailExpanded}
            onChange={this.handleChangeEmailExpandedToggle}
          >
            <AccordionSummary
              expandIcon={
                !this.state.isChangeEmailExpanded ? <EditIcon /> : <CloseIcon />
              }
            >
              <Typography>Email</Typography>
              <Typography>{this.props.user.email}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <form
                className="Profile-AccordionForm"
                onSubmit={this.handleChangeEmailSubmit}
              >
                <TextField
                  label="New Email"
                  name="newEmail"
                  value={this.state.newEmail}
                  onChange={this.handleInputChange}
                  required
                ></TextField>
                <TextField
                  label="Password"
                  name="newEmailPassword"
                  value={this.state.newEmailPassword}
                  onChange={this.handleInputChange}
                  type="password"
                  required
                ></TextField>
                <Button type="submit">Submit</Button>
              </form>
            </AccordionDetails>
          </Accordion>

          <Accordion
            expanded={this.state.isChangePasswordExpanded}
            onChange={this.handleChangePasswordExpandedToggle}
          >
            <AccordionSummary
              expandIcon={
                !this.state.isChangePasswordExpanded ? (
                  <EditIcon />
                ) : (
                  <CloseIcon />
                )
              }
            >
              <Typography>Password</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <form
                className="Profile-AccordionForm"
                onSubmit={this.handleChangePasswordSubmit}
              >
                <TextField
                  label="Current Password"
                  name="oldPassword"
                  value={this.state.oldPassword}
                  onChange={this.handleInputChange}
                  type="password"
                  required
                ></TextField>
                <TextField
                  label="New Password"
                  name="newPassword"
                  value={this.state.newPassword}
                  onChange={this.handleInputChange}
                  type="password"
                  required
                ></TextField>
                <TextField
                  label="Confirm New Password"
                  name="newPasswordConfirm"
                  value={this.state.newPasswordConfirm}
                  onChange={this.handleInputChange}
                  type="password"
                  required
                ></TextField>
                <Button type="submit">Submit</Button>
              </form>
            </AccordionDetails>
          </Accordion>

          {this.props.isUserAdmin ? (
            <Accordion
              expanded={this.state.isChangeAdminKeysExpanded}
              onChange={this.handleChangeAdminKeysExpandedToggle}
            >
              <AccordionSummary
                expandIcon={
                  !this.state.isChangeAdminKeysExpanded ? (
                    <EditIcon />
                  ) : (
                    <CloseIcon />
                  )
                }
              >
                <Typography>Admin Key</Typography>
                <Typography>{this.state.adminKey}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <form
                  className="Profile-AccordionForm"
                  onSubmit={this.handleChangeAdminKeysSubmit}
                >
                  <TextField
                    label="New Admin Key"
                    name="newAdminKey"
                    value={this.state.newAdminKey}
                    onChange={this.handleInputChange}
                    type="password"
                    required
                  ></TextField>
                  <Button type="submit">Submit</Button>
                </form>
              </AccordionDetails>
            </Accordion>
          ) : null}

          <Accordion
            expanded={this.state.isDeleteAccountExpanded}
            onChange={this.handleDeleteAccountExpandedToggle}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Delete Account</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <form
                className="Profile-AccordionForm"
                onSubmit={this.handleDeleteAccountSubmit}
              >
                <TextField
                  label="Password"
                  name="deletePassword"
                  value={this.state.deletePassword}
                  onChange={this.handleInputChange}
                  type="password"
                  required
                ></TextField>
                <Button type="submit" color="secondary">
                  Delete Account
                </Button>
              </form>
            </AccordionDetails>
          </Accordion>
        </div>
      </div>
    );
  };
}
export default Profile;
