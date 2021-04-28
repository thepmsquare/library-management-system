import React, { Component } from "react";
import {
  TableContainer,
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from "@material-ui/core";
import CheckIcon from "@material-ui/icons/Check";
import CloseIcon from "@material-ui/icons/Close";
import firebase from "./Firebase";
import "./stylesheets/Requests.css";
const db = firebase.firestore();

class Requests extends Component {
  constructor(props) {
    super(props);
    this.state = {
      requests: [],
      isApproveRejectDialogOpen: false,
      toApproveReject: {},
      approveRejectReason: "",
      isCollectCancelDialogOpen: false,
      toCollectCancel: {},
      collectCancelReason: "",
    };
  }

  componentDidMount = () => {
    this.unSubRequests = db
      .collection("Requests")
      .onSnapshot((querySnapshot) => {
        const requests = [];
        querySnapshot.forEach(async (doc) => {
          const status = doc.data().history[doc.data().history.length - 1]
            .status;
          if (
            status === "pending" ||
            status === "approved" ||
            status === "collected"
          ) {
            try {
              const url =
                "https://www.googleapis.com/books/v1/volumes/" +
                doc.data().bookID;
              const result = await fetch(url);
              const apiData = await result.json();
              requests.push({
                title: apiData.volumeInfo.title,
                ...doc.data(),
                status,
              });
              this.setState(() => {
                return { requests };
              });
            } catch (error) {
              this.props.handleSnackbarOpen(error.message);
            }
          }
        });
      });
  };

  componentWillUnmount = () => {
    this.unSubRequests();
  };

  toTitleCase = (str) => {
    return str.replace(/\w\S*/g, (txt) => {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  };

  handleDialogClose = () => {
    this.setState(() => {
      return {
        isApproveRejectDialogOpen: false,
        toApproveReject: {},
        approveRejectReason: "",
        isCollectCancelDialogOpen: false,
        toCollectCancel: {},
        collectCancelReason: "",
      };
    });
  };

  handleApproveAccept = (bookID, userID, title) => {
    db.collection("Requests")
      .where("bookID", "==", bookID)
      .where("userID", "==", userID)
      .get()
      .then((querySnapshot) => {
        const docs = [];
        querySnapshot.forEach((doc) => {
          const status = doc.data().history[doc.data().history.length - 1]
            .status;
          if (
            status === "pending" ||
            status === "approved" ||
            status === "collected"
          ) {
            docs.push(doc.ref);
          }
        });
        docs[0]
          .update({
            history: firebase.firestore.FieldValue.arrayUnion({
              status: "approved",
              time: firebase.firestore.Timestamp.fromDate(new Date(Date.now())),
            }),
          })
          .then(() => {
            db.collection("Inventory")
              .where("id", "==", bookID)
              .get()
              .then((querySnapshot2) => {
                const docs2 = [];
                querySnapshot2.forEach((doc) => docs2.push(doc.ref));
                docs2[0]
                  .update({
                    quantity: firebase.firestore.FieldValue.increment(-1),
                  })
                  .then(() => {
                    db.collection("Notifications")
                      .add({
                        userID,
                        message: `${title} has been approved by Admin for you to borrow and is now ready for collection.`,
                        time: firebase.firestore.Timestamp.fromDate(
                          new Date(Date.now())
                        ),
                      })
                      .then(() => {
                        this.props.handleSnackbarOpen(
                          `${title} approved for ${userID}.`
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
          })
          .catch((error) => {
            this.props.handleSnackbarOpen(error.message);
          });
      })
      .catch((error) => {
        this.props.handleSnackbarOpen(error.message);
      });
  };

  handleApproveRejectDialogOpen = (bookID, userID, title) => {
    this.setState(() => {
      return {
        isApproveRejectDialogOpen: true,
        toApproveReject: { bookID, userID, title },
      };
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

  handleApproveReject = (e) => {
    e.preventDefault();
    db.collection("Requests")
      .where("userID", "==", this.state.toApproveReject.userID)
      .where("bookID", "==", this.state.toApproveReject.bookID)
      .get()
      .then((querySnapshot) => {
        const docs = [];
        querySnapshot.forEach((doc) => {
          const status = doc.data().history[doc.data().history.length - 1]
            .status;
          if (
            status === "pending" ||
            status === "approved" ||
            status === "collected"
          ) {
            docs.push(doc.ref);
          }
        });
        docs[0]
          .update({
            history: firebase.firestore.FieldValue.arrayUnion({
              status: "rejected",
              time: firebase.firestore.Timestamp.fromDate(new Date(Date.now())),
            }),
          })
          .then(
            db
              .collection("Notifications")
              .add({
                userID: this.state.toApproveReject.userID,
                message: `${this.state.toApproveReject.title} has been Rejected by Admin for you to borrow for the following reason: ${this.state.approveRejectReason}`,
                time: firebase.firestore.Timestamp.fromDate(
                  new Date(Date.now())
                ),
              })
              .then(() => {
                this.props.handleSnackbarOpen(
                  `${this.state.toApproveReject.title} rejected for ${this.state.toApproveReject.userID}.`
                );
                this.handleDialogClose();
              })
              .catch((error) => {
                this.handleDialogClose();
                this.props.handleSnackbarOpen(error.message);
              })
          )
          .catch((error) => {
            this.handleDialogClose();
            this.props.handleSnackbarOpen(error.message);
          });
      })
      .catch((error) => {
        this.handleDialogClose();
        this.props.handleSnackbarOpen(error.message);
      });
  };

  handleCollectAccept = (bookID, userID, title) => {
    db.collection("Requests")
      .where("bookID", "==", bookID)
      .where("userID", "==", userID)
      .get()
      .then((querySnapshot) => {
        const docs = [];
        querySnapshot.forEach((doc) => {
          const status = doc.data().history[doc.data().history.length - 1]
            .status;
          if (
            status === "pending" ||
            status === "approved" ||
            status === "collected"
          ) {
            docs.push(doc.ref);
          }
        });
        docs[0]
          .update({
            history: firebase.firestore.FieldValue.arrayUnion({
              status: "collected",
              time: firebase.firestore.Timestamp.fromDate(new Date(Date.now())),
            }),
          })
          .then(() => {
            this.props.handleSnackbarOpen(`${title} collected by ${userID}.`);
          })
          .catch((error) => {
            this.props.handleSnackbarOpen(error.message);
          });
      })
      .catch((error) => {
        this.props.handleSnackbarOpen(error.message);
      });
  };

  getDays = (date1, date2) => {
    const diffTime = Math.abs(date2 - date1);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  handleCollectCancelDialogOpen = (bookID, userID, title) => {
    this.setState(() => {
      return {
        isCollectCancelDialogOpen: true,
        toCollectCancel: { bookID, userID, title },
      };
    });
  };

  handleCollectCancel = (e) => {
    e.preventDefault();
    db.collection("Requests")
      .where("userID", "==", this.state.toCollectCancel.userID)
      .where("bookID", "==", this.state.toCollectCancel.bookID)
      .get()
      .then((querySnapshot) => {
        const docs = [];
        querySnapshot.forEach((doc) => {
          const status = doc.data().history[doc.data().history.length - 1]
            .status;
          if (
            status === "pending" ||
            status === "approved" ||
            status === "collected"
          ) {
            docs.push(doc.ref);
          }
        });
        docs[0]
          .update({
            history: firebase.firestore.FieldValue.arrayUnion({
              status: "canceled",
              time: firebase.firestore.Timestamp.fromDate(new Date(Date.now())),
            }),
          })
          .then(
            db
              .collection("Notifications")
              .add({
                userID: this.state.toCollectCancel.userID,
                message: `${this.state.toCollectCancel.title} has been canceled by Admin for you to borrow for the following reason: ${this.state.collectCancelReason}`,
                time: firebase.firestore.Timestamp.fromDate(
                  new Date(Date.now())
                ),
              })
              .then(() => {
                db.collection("Inventory")
                  .where("id", "==", this.state.toCollectCancel.bookID)
                  .get()
                  .then((querySnapshot2) => {
                    const docs2 = [];
                    querySnapshot2.forEach((doc) => docs2.push(doc.ref));
                    docs2[0]
                      .update({
                        quantity: firebase.firestore.FieldValue.increment(1),
                      })
                      .then(() => {
                        this.props.handleSnackbarOpen(
                          `${this.state.toCollectCancel.title} canceled for ${this.state.toCollectCancel.userID}.`
                        );
                        this.handleDialogClose();
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
                this.handleDialogClose();
                this.props.handleSnackbarOpen(error.message);
              })
          )
          .catch((error) => {
            this.handleDialogClose();
            this.props.handleSnackbarOpen(error.message);
          });
      })
      .catch((error) => {
        this.handleDialogClose();
        this.props.handleSnackbarOpen(error.message);
      });
  };

  render = () => {
    return (
      <div className="Requests">
        <Typography variant="h3">Requests</Typography>
        {this.state.requests.filter((ele) => ele.status === "pending").length >
          0 && (
          <div>
            <Typography variant="h5">Not yet Approved</Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Book Title</TableCell>
                    <TableCell>User ID</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {this.state.requests
                    .filter((ele) => ele.status === "pending")
                    .map((request) => {
                      return (
                        <TableRow key={request.bookID + request.userID}>
                          <TableCell>{request.title}</TableCell>
                          <TableCell>{request.userID}</TableCell>
                          <TableCell>
                            {this.toTitleCase(request.status)}
                          </TableCell>
                          <TableCell>
                            <IconButton
                              color="primary"
                              onClick={() => {
                                this.handleApproveAccept(
                                  request.bookID,
                                  request.userID,
                                  request.title
                                );
                              }}
                            >
                              <CheckIcon />
                            </IconButton>
                          </TableCell>
                          <TableCell>
                            <IconButton
                              onClick={() => {
                                this.handleApproveRejectDialogOpen(
                                  request.bookID,
                                  request.userID,
                                  request.title
                                );
                              }}
                              color="secondary"
                            >
                              <CloseIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        )}
        {this.state.requests.filter((ele) => ele.status === "approved").length >
          0 && (
          <div>
            <Typography variant="h5">Not yet Collected</Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Book Title</TableCell>
                    <TableCell>User ID</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Approved on</TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {this.state.requests
                    .filter((ele) => ele.status === "approved")
                    .map((request) => {
                      return (
                        <TableRow key={request.title + request.userID}>
                          <TableCell>{request.title}</TableCell>
                          <TableCell>{request.userID}</TableCell>
                          <TableCell>
                            {this.toTitleCase(request.status)}
                          </TableCell>
                          <TableCell>
                            {"(" +
                              this.getDays(
                                request.history[
                                  request.history.length - 1
                                ].time.toDate(),
                                new Date(Date.now())
                              ) +
                              " Days ago) "}
                            {request.history[request.history.length - 1].time
                              .toDate()
                              .toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <IconButton
                              color="primary"
                              onClick={() => {
                                this.handleCollectAccept(
                                  request.bookID,
                                  request.userID,
                                  request.title
                                );
                              }}
                            >
                              <CheckIcon />
                            </IconButton>
                          </TableCell>
                          <TableCell>
                            <IconButton
                              color="secondary"
                              onClick={() => {
                                this.handleCollectCancelDialogOpen(
                                  request.bookID,
                                  request.userID,
                                  request.title
                                );
                              }}
                            >
                              <CloseIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        )}
        {this.state.requests.filter((ele) => ele.status === "collected")
          .length > 0 && (
          <div>
            <Typography variant="h5">Not yet Returned</Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Book Title</TableCell>
                    <TableCell>User ID</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {this.state.requests
                    .filter((ele) => ele.status === "collected")
                    .map((request) => {
                      return (
                        <TableRow key={request.title + request.userID}>
                          <TableCell>{request.title}</TableCell>
                          <TableCell>{request.userID}</TableCell>
                          <TableCell>
                            {this.toTitleCase(request.status)}
                          </TableCell>
                          <TableCell>
                            <IconButton color="primary">
                              <CheckIcon />
                            </IconButton>
                          </TableCell>
                          <TableCell>
                            <IconButton color="secondary">
                              <CloseIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        )}
        <Dialog
          open={this.state.isApproveRejectDialogOpen}
          onClose={this.handleDialogClose}
        >
          <form onSubmit={this.handleApproveReject}>
            <DialogTitle>Confirm Rejection</DialogTitle>
            <DialogContent>
              <Typography variant="h6">
                Title: {this.state.toApproveReject.title}{" "}
              </Typography>
              <Typography>
                User ID: {this.state.toApproveReject.userID}{" "}
              </Typography>

              <TextField
                value={this.state.approveRejectReason}
                name="approveRejectReason"
                onChange={this.handleInputChange}
                label="Reason"
                multiline
                required
              ></TextField>
            </DialogContent>
            <DialogActions>
              <Button onClick={this.handleDialogClose} color="primary">
                Cancel
              </Button>
              <Button type="submit" color="secondary">
                Reject
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        <Dialog
          open={this.state.isCollectCancelDialogOpen}
          onClose={this.handleDialogClose}
        >
          <form onSubmit={this.handleCollectCancel}>
            <DialogTitle>Confirm Cancelation.</DialogTitle>
            <DialogContent>
              <Typography variant="h6">
                Title: {this.state.toCollectCancel.title}{" "}
              </Typography>
              <Typography>
                User ID: {this.state.toCollectCancel.userID}{" "}
              </Typography>

              <TextField
                value={this.state.collectCancelReason}
                name="collectCancelReason"
                onChange={this.handleInputChange}
                label="Reason"
                multiline
                required
              ></TextField>
            </DialogContent>
            <DialogActions>
              <Button onClick={this.handleDialogClose} color="primary">
                Back
              </Button>
              <Button type="submit" color="secondary">
                Cancel
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </div>
    );
  };
}

export default Requests;
