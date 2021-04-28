import React, { Component } from "react";
import {
  Typography,
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
} from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import firebase from "./Firebase";
import "./stylesheets/History.css";
const db = firebase.firestore();

class History extends Component {
  constructor(props) {
    super(props);
    this.state = {
      requests: [],
      isApproveCancelDialogOpen: false,
      toApproveCancel: {},
      isCollectCancelDialogOpen: false,
      toCollectCancel: {},
    };
  }

  componentDidMount = () => {
    this.unSubRequests = db
      .collection("Requests")
      .where("userID", "==", this.props.user.uid)
      .onSnapshot((querySnapshot) => {
        const requests = [];
        querySnapshot.forEach(async (doc) => {
          try {
            const url =
              "https://www.googleapis.com/books/v1/volumes/" +
              doc.data().bookID;
            const result = await fetch(url);
            const apiData = await result.json();
            requests.push({
              title: apiData.volumeInfo.title,
              ...doc.data(),
              status: doc.data().history[doc.data().history.length - 1].status,
            });
            this.setState(() => {
              return { requests };
            });
          } catch (error) {
            this.props.handleSnackbarOpen(error.message);
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

  getFine = (date1, date2) => {
    const diffTime = Math.abs(date2 - date1);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 7) {
      return 0;
    } else if (diffDays <= 14) {
      return 10;
    } else if (diffDays <= 21) {
      return 20;
    } else if (diffDays <= 28) {
      return 30;
    } else {
      return 30;
    }
  };

  handleDialogClose = () => {
    this.setState(() => {
      return {
        isApproveCancelDialogOpen: false,
        toApproveCancel: {},
        isCollectCancelDialogOpen: false,
        toCollectCancel: {},
      };
    });
  };

  handleApproveCancelDialogOpen = (bookID, userID, title) => {
    this.setState(() => {
      return {
        toApproveCancel: {
          bookID,
          userID,
          title,
        },
        isApproveCancelDialogOpen: true,
      };
    });
  };

  handleApproveCancel = (e) => {
    e.preventDefault();
    db.collection("Requests")
      .where("bookID", "==", this.state.toApproveCancel.bookID)
      .where("userID", "==", this.state.toApproveCancel.userID)
      .get()
      .then((querySnapshot) => {
        const docs = [];
        querySnapshot.forEach((doc) => docs.push(doc.ref));
        docs[0]
          .update({
            history: firebase.firestore.FieldValue.arrayUnion({
              status: "canceled",
              time: firebase.firestore.Timestamp.fromDate(new Date(Date.now())),
            }),
          })
          .then(() => {
            this.handleDialogClose();
            this.props.handleSnackbarOpen(
              `Request to borrow ${this.state.toApproveCancel.title} canceled.`
            );
          })
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

  handleCollectCancelDialogOpen = (bookID, userID, title) => {
    this.setState(() => {
      return {
        toCollectCancel: {
          bookID,
          userID,
          title,
        },
        isCollectCancelDialogOpen: true,
      };
    });
  };

  handleCollectCancel = (e) => {
    e.preventDefault();
    db.collection("Requests")
      .where("bookID", "==", this.state.toCollectCancel.bookID)
      .where("userID", "==", this.state.toCollectCancel.userID)
      .get()
      .then((querySnapshot) => {
        const docs = [];
        querySnapshot.forEach((doc) => docs.push(doc.ref));
        docs[0]
          .update({
            history: firebase.firestore.FieldValue.arrayUnion({
              status: "canceled",
              time: firebase.firestore.Timestamp.fromDate(new Date(Date.now())),
            }),
          })
          .then(() => {
            this.handleDialogClose();
            this.props.handleSnackbarOpen(
              `Request to borrow ${this.state.toApproveCancel.title} canceled.`
            );
          })
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
      <div className="History">
        <Typography variant="h3">History</Typography>

        {this.state.requests.filter((ele) => ele.status === "pending").length >
          0 && (
          <div>
            <Typography variant="h5">Not yet Approved</Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Book Title</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {this.state.requests
                    .filter((ele) => ele.status === "pending")
                    .map((request) => {
                      return (
                        <TableRow key={request.bookID}>
                          <TableCell>{request.title}</TableCell>
                          <TableCell>
                            {this.toTitleCase(request.status)}
                          </TableCell>

                          <TableCell>
                            <IconButton
                              onClick={() => {
                                this.handleApproveCancelDialogOpen(
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
                    <TableCell>Status</TableCell>
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
                          <TableCell>
                            {this.toTitleCase(request.status)}
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
                    <TableCell>Status</TableCell>
                    <TableCell>Due Date</TableCell>
                    <TableCell>Late Fees</TableCell>
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
                          <TableCell>
                            {this.toTitleCase(request.status)}
                          </TableCell>
                          <TableCell>
                            {new Date(
                              request.history[request.history.length - 1].time
                                .toDate()
                                .getTime() +
                                7 * 24 * 60 * 60 * 1000
                            ).toDateString()}
                          </TableCell>
                          <TableCell>
                            {this.getFine(
                              request.history[
                                request.history.length - 1
                              ].time.toDate(),
                              new Date(Date.now())
                            )}
                          </TableCell>
                          <TableCell>
                            <Button color="secondary">Report Lost</Button>
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
          open={this.state.isApproveCancelDialogOpen}
          onClose={this.handleDialogClose}
        >
          <form onSubmit={this.handleApproveCancel}>
            <DialogTitle>Confirm Cancellation.</DialogTitle>
            <DialogContent>
              <Typography>
                Title:{" "}
                {this.state.isApproveCancelDialogOpen &&
                  this.state.toApproveCancel.title}
              </Typography>
              <Typography>Status: "Pending"</Typography>
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

        <Dialog
          open={this.state.isCollectCancelDialogOpen}
          onClose={this.handleDialogClose}
        >
          <form onSubmit={this.handleCollectCancel}>
            <DialogTitle>Confirm Cancellation.</DialogTitle>
            <DialogContent>
              <Typography>
                Title:{" "}
                {this.state.isCollectCancelDialogOpen &&
                  this.state.toCollectCancel.title}
              </Typography>
              <Typography>Status: "Approved"</Typography>
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

export default History;
