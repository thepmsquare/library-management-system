import React, { Component } from "react";
import {
  Typography,
  TableContainer,
  Paper,
  TableHead,
  TableRow,
  Table,
  TableCell,
  TableBody,
  IconButton,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  DialogContentText,
  Button,
  InputAdornment,
  TextField,
} from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import SearchIcon from "@material-ui/icons/Search";
import firebase from "./Firebase";
import defaultBook from "./images/defaultBook.png";
import "./stylesheets/Library.css";
const db = firebase.firestore();
const numOfAllowedBooks = 3;

class Library extends Component {
  constructor(props) {
    super(props);
    this.state = {
      library: [],
      dontShow: [],
      isRequestDialogOpen: false,
      requestId: "",
      fineRemaining: false,
      searchValue: "",
    };
  }

  componentDidMount = () => {
    this.unSubInventory = db
      .collection("Inventory")
      .where("quantity", ">", 0)
      .onSnapshot((querySnapshot) => {
        let library = [];
        querySnapshot.forEach(async (doc) => {
          const url =
            "https://www.googleapis.com/books/v1/volumes/" + doc.data().id;
          try {
            const result = await fetch(url);
            const apiData = await result.json();
            if (apiData) {
              library.push({
                ...apiData,
                quantity: doc.data().quantity,
                price: doc.data().price,
              });
              this.setState(() => {
                return { library };
              });
            } else {
              // this error will not occur unless googleapi deletes a book id.
              this.props.handleSnackbarOpen("Book Id not found.");
            }
          } catch (error) {
            this.props.handleSnackbarOpen(error.message);
          }
        });
        this.setState(() => {
          return { library };
        });
      });

    this.unSubDontShow = db
      .collection("Requests")
      .where("userID", "==", this.props.user.uid)
      .onSnapshot((querySnapshot) => {
        let dontShow = [];
        let docs = [];
        querySnapshot.forEach((doc) => docs.push(doc.data()));
        if (
          docs.some((ele) => {
            return (
              ele.history[ele.history.length - 1].status === "lost" ||
              (ele.history[ele.history.length - 1].status === "collected" &&
                this.getDays(
                  ele.history[ele.history.length - 1].time.toDate(),
                  new Date(Date.now())
                ) > 7)
            );
          })
        ) {
          this.setState(() => {
            return {
              fineRemaining: true,
            };
          });
        } else {
          docs.forEach((doc) => {
            if (
              doc.history[doc.history.length - 1].status === "pending" ||
              doc.history[doc.history.length - 1].status === "approved" ||
              doc.history[doc.history.length - 1].status === "collected"
            ) {
              dontShow.push(doc.bookID);
            }
          });
          this.setState(() => {
            return {
              dontShow,
              fineRemaining: false,
            };
          });
        }
      });
  };

  componentWillUnmount = () => {
    this.unSubInventory();
    this.unSubDontShow();
  };

  handleDialogClose = () => {
    this.setState(() => {
      return { isRequestDialogOpen: false, requestId: "" };
    });
  };

  handleRequestDialogOpen = (id) => {
    this.setState(() => {
      return {
        isRequestDialogOpen: true,
        requestId: id,
      };
    });
  };

  handleRequest = () => {
    db.collection("Requests")
      .where("userID", "==", this.props.user.uid)
      .get()
      .then((querySnapshot) => {
        const docs = [];
        querySnapshot.forEach((doc) => docs.push(doc.data()));
        if (
          docs.some((ele) => {
            return (
              ele.history[ele.history.length - 1].status === "lost" ||
              (ele.history[ele.history.length - 1].status === "collected" &&
                this.getDays(
                  ele.history[ele.history.length - 1].time.toDate(),
                  new Date(Date.now())
                ) > 7)
            );
          })
        ) {
          this.handleDialogClose();
          this.props.handleSnackbarOpen("Please Pay the Fine.");
        } else if (
          docs.filter(
            (ele) =>
              ele.history[ele.history.length - 1].status === "pending" ||
              ele.history[ele.history.length - 1].status === "approved" ||
              ele.history[ele.history.length - 1].status === "collected"
          ).length >= numOfAllowedBooks
        ) {
          this.handleDialogClose();
          this.props.handleSnackbarOpen("Request Limit Exceeded.");
        } else if (
          docs.filter((ele) => ele.bookID === this.state.requestId).length > 0
        ) {
          let sameBookUserRequest = docs.filter(
            (ele) => ele.bookID === this.state.requestId
          );
          if (
            sameBookUserRequest.some(
              (ele) => ele.history[ele.history.length - 1].status === "pending"
            )
          ) {
            this.handleDialogClose();
            this.props.handleSnackbarOpen("Book Already Requested");
          } else if (
            sameBookUserRequest.some(
              (ele) => ele.history[ele.history.length - 1].status === "approved"
            )
          ) {
            this.handleDialogClose();
            this.props.handleSnackbarOpen("Book is Ready to collect.");
          } else if (
            sameBookUserRequest.some(
              (ele) =>
                ele.history[ele.history.length - 1].status === "collected"
            )
          ) {
            this.handleDialogClose();
            this.props.handleSnackbarOpen("Please Return this Book first.");
          } else {
            db.collection("Requests")
              .add({
                userID: this.props.user.uid,
                bookID: this.state.requestId,
                history: [
                  {
                    status: "pending",
                    time: firebase.firestore.Timestamp.fromDate(
                      new Date(Date.now())
                    ),
                  },
                ],
              })
              .then(() => {
                this.handleDialogClose();
                this.props.handleSnackbarOpen("Request Sent to Admin.");
              })
              .catch((error) => {
                this.handleDialogClose();
                this.props.handleSnackbarOpen(error.message);
              });
          }
        } else {
          db.collection("Requests")
            .add({
              userID: this.props.user.uid,
              bookID: this.state.requestId,
              history: [
                {
                  status: "pending",
                  time: firebase.firestore.Timestamp.fromDate(
                    new Date(Date.now())
                  ),
                },
              ],
            })
            .then(() => {
              this.handleDialogClose();
              this.props.handleSnackbarOpen("Request Sent to Admin.");
            })
            .catch((error) => {
              this.handleDialogClose();
              this.props.handleSnackbarOpen(error.message);
            });
        }
      })
      .catch((error) => {
        this.handleDialogClose();
        this.props.handleSnackbarOpen(error.message);
      });
  };

  getDays = (date1, date2) => {
    const diffTime = Math.abs(date2 - date1);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
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

  render = () => {
    return (
      <div className="Library">
        <Typography variant="h3">Library</Typography>
        {this.state.library.length > 0 && !this.state.fineRemaining && (
          <div className="Library-Container">
            <TextField
              variant="outlined"
              value={this.state.searchValue}
              name="searchValue"
              onChange={this.handleInputChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell></TableCell>
                    <TableCell>Title</TableCell>
                    <TableCell>Authors</TableCell>
                    <TableCell>Publisher</TableCell>
                    <TableCell>Published Date</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {this.state.library
                    .filter((ele) => {
                      return this.state.searchValue
                        ? ele.volumeInfo.title
                            .toLowerCase()
                            .indexOf(this.state.searchValue.toLowerCase()) !==
                            -1 ||
                          (ele.volumeInfo.publisher &&
                            ele.volumeInfo.publisher
                              .toLowerCase()
                              .indexOf(this.state.searchValue.toLowerCase()) !==
                              -1) ||
                          ele.volumeInfo.authors
                            .join(" ")
                            .toLowerCase()
                            .indexOf(this.state.searchValue.toLowerCase()) !==
                            -1
                          ? true
                          : false
                        : true;
                    })
                    .map((book) => {
                      return (
                        this.state.dontShow.indexOf(book.id) === -1 && (
                          <TableRow key={book.id}>
                            <TableCell>
                              <img
                                src={
                                  book.volumeInfo.imageLinks
                                    ? book.volumeInfo.imageLinks.thumbnail
                                    : defaultBook
                                }
                                alt={book.title}
                              ></img>
                            </TableCell>
                            <TableCell>
                              {book.volumeInfo.title
                                ? book.volumeInfo.title
                                : ""}
                            </TableCell>
                            <TableCell>
                              {book.volumeInfo.authors
                                ? book.volumeInfo.authors.join(", ")
                                : ""}
                            </TableCell>
                            <TableCell>
                              {book.volumeInfo.publisher
                                ? book.volumeInfo.publisher
                                : ""}
                            </TableCell>
                            <TableCell>
                              {book.volumeInfo.publishedDate
                                ? book.volumeInfo.publishedDate
                                : ""}
                            </TableCell>

                            <TableCell>
                              <IconButton
                                onClick={() => {
                                  this.handleRequestDialogOpen(book.id);
                                }}
                                disabled={
                                  this.state.dontShow.length >=
                                  numOfAllowedBooks
                                }
                              >
                                <AddIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        )
                      );
                    })}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        )}
        {this.state.fineRemaining && (
          <Typography color="secondary" variant="h4">
            Please Pay the fine.
          </Typography>
        )}
        <Dialog
          open={this.state.isRequestDialogOpen}
          onClose={this.handleDialogClose}
        >
          <DialogTitle>Confirm Request to Borrow.</DialogTitle>
          <DialogContent>
            <DialogContentText>
              The price of this book is ₹
              {this.state.isRequestDialogOpen
                ? this.state.library.find(
                    (book) => book.id === this.state.requestId
                  ).price
                : ""}
              . If unable to return the book within 7 days a fine of ₹10/week
              will be charged.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleDialogClose} color="primary">
              Cancel
            </Button>
            <Button onClick={this.handleRequest} color="primary">
              Confirm
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  };
}

export default Library;
