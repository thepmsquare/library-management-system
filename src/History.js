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
      isReportLostDialogOpen: false,
      toReportLost: {},
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
            const status = doc.data().history[doc.data().history.length - 1]
              .status;
            const url =
              "https://www.googleapis.com/books/v1/volumes/" +
              doc.data().bookID;
            const result = await fetch(url);
            const apiData = await result.json();
            db.collection("Inventory")
              .where("id", "==", doc.data().bookID)
              .get()
              .then((querySnapshot2) => {
                const docs2 = [];
                querySnapshot2.forEach((doc) => docs2.push(doc.data()));
                requests.push({
                  price: docs2[0].price,
                  title: apiData.volumeInfo.title,
                  ...doc.data(),
                  status,
                });
                this.setState(() => {
                  return { requests };
                });
              })
              .catch((error) => {
                this.props.handleSnackbarOpen(error.message);
              });
          } catch (error) {
            this.props.handleSnackbarOpen(error.message);
          }
        });
        this.setState(() => {
          return { requests };
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

  getDays = (date1, date2) => {
    const diffTime = Math.abs(date2 - date1);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  getFine = (date1, date2, price, status) => {
    if (status === "lost") {
      return 30 + parseFloat(price);
    } else {
      const diffDays = this.getDays(date1, date2);
      if (diffDays <= 7) {
        return 0;
      } else if (diffDays <= 14) {
        return 10;
      } else if (diffDays <= 21) {
        return 20;
      } else if (diffDays <= 28) {
        return 30;
      } else {
        return 30 + parseFloat(price);
      }
    }
  };

  handleDialogClose = () => {
    this.setState(() => {
      return {
        isApproveCancelDialogOpen: false,
        toApproveCancel: {},
        isCollectCancelDialogOpen: false,
        toCollectCancel: {},
        isReportLostDialogOpen: false,
        toReportLost: {},
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
        querySnapshot.forEach((doc) => {
          const status = doc.data().history[doc.data().history.length - 1]
            .status;
          if (status === "pending") {
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
          .then(() => {
            this.props.handleSnackbarOpen(
              `Request to borrow ${this.state.toApproveCancel.title} canceled.`
            );
            this.handleDialogClose();
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
        querySnapshot.forEach((doc) => {
          const status = doc.data().history[doc.data().history.length - 1]
            .status;
          if (status === "approved") {
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
                      `Request to borrow ${this.state.toApproveCancel.title} canceled.`
                    );
                    this.handleDialogClose();
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

  handleReportLostDialogOpen = (
    bookID,
    userID,
    title,
    history,
    status,
    price
  ) => {
    this.setState(() => {
      return {
        toReportLost: {
          bookID,
          userID,
          title,
          history,
          status,
          price,
        },
        isReportLostDialogOpen: true,
      };
    });
  };

  handleReportLost = (e) => {
    e.preventDefault();
    db.collection("Requests")
      .where("bookID", "==", this.state.toReportLost.bookID)
      .where("userID", "==", this.state.toReportLost.userID)
      .get()
      .then((querySnapshot) => {
        const docs = [];
        querySnapshot.forEach((doc) => {
          const status = doc.data().history[doc.data().history.length - 1]
            .status;
          if (status === "collected") {
            docs.push(doc.ref);
          }
        });
        docs[0]
          .update({
            history: firebase.firestore.FieldValue.arrayUnion({
              status: "lost",
              time: firebase.firestore.Timestamp.fromDate(new Date(Date.now())),
            }),
            isRestocked: false,
          })
          .then(() => {
            this.props.handleSnackbarOpen(
              `${this.state.toReportLost.title} reported as lost.`
            );
            this.handleDialogClose();
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
    let activity = [];
    if (this.state.requests.length > 0) {
      this.state.requests.forEach((ele) => {
        ele.history.forEach((historyEle) => {
          activity.push({ ...historyEle, title: ele.title });
        });
      });
    }

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

        {this.state.requests.filter(
          (ele) => ele.status === "collected" || ele.status === "lost"
        ).length > 0 && (
          <div>
            <Typography variant="h5">Not yet Returned</Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Book Title</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Due Date</TableCell>
                    <TableCell>Fine (???)</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {this.state.requests
                    .filter(
                      (ele) =>
                        ele.status === "collected" || ele.status === "lost"
                    )
                    .map((request) => {
                      return (
                        <TableRow key={request.title + request.userID}>
                          <TableCell>{request.title}</TableCell>
                          <TableCell>
                            {this.toTitleCase(request.status)}
                          </TableCell>
                          <TableCell>
                            {new Date(
                              request.history
                                .find((ele) => {
                                  return ele.status === "collected";
                                })
                                .time.toDate()
                                .getTime() +
                                7 * 24 * 60 * 60 * 1000
                            ).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {this.getFine(
                              request.history
                                .find((ele) => {
                                  return ele.status === "collected";
                                })
                                .time.toDate(),
                              new Date(Date.now()),
                              request.price,
                              request.status
                            )}
                          </TableCell>
                          <TableCell>
                            {request.status === "collected" ? (
                              <Button
                                color="secondary"
                                onClick={() => {
                                  this.handleReportLostDialogOpen(
                                    request.bookID,
                                    request.userID,
                                    request.title,
                                    request.history,
                                    request.status,
                                    request.price
                                  );
                                }}
                              >
                                Report Lost
                              </Button>
                            ) : null}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        )}
        {activity.length > 0 && (
          <div>
            <Typography variant="h5">Activity</Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Book</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {activity
                    .sort((a, b) => b.time.seconds - a.time.seconds)
                    .map((ele) => {
                      return (
                        <TableRow key={ele.time.seconds}>
                          <TableCell>{ele.title}</TableCell>
                          <TableCell>{this.toTitleCase(ele.status)}</TableCell>
                          <TableCell>
                            {ele.time.toDate().toLocaleDateString()}
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
            <DialogTitle>Confirm Cancelation.</DialogTitle>
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
            <DialogTitle>Confirm Cancelation.</DialogTitle>
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

        <Dialog
          open={this.state.isReportLostDialogOpen}
          onClose={this.handleDialogClose}
        >
          <form onSubmit={this.handleReportLost}>
            <DialogTitle>Report Book as Lost.</DialogTitle>
            <DialogContent>
              <Typography>
                Title:{" "}
                {this.state.isReportLostDialogOpen &&
                  this.state.toReportLost.title}
              </Typography>
              <Typography>
                A Fine of ???30 added with the book MSRP of ???
                {this.state.toReportLost.price} = ???
                {this.state.isReportLostDialogOpen &&
                  this.getFine(
                    this.state.toReportLost.history
                      .find((ele) => {
                        return ele.status === "collected";
                      })
                      .time.toDate(),
                    new Date(Date.now()),
                    this.state.toReportLost.price,
                    "lost"
                  )}{" "}
                will be charged. All of your current requests will be canceled
                and you will not be able to request more books until the fine is
                paid.
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={this.handleDialogClose} color="primary">
                Cancel
              </Button>
              <Button type="submit" color="secondary">
                Report Lost
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </div>
    );
  };
}

export default History;
