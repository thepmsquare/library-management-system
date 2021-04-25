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
} from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
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
      });
    this.unSubDontShow = db
      .collection("Requests")
      .where("userID", "==", this.props.user.uid)
      .where("status", "in", ["pending", "approved", "collected"])
      .onSnapshot((querySnapshot2) => {
        let dontShow = [];
        querySnapshot2.forEach((doc) => dontShow.push(doc.data().bookID));
        this.setState(() => {
          return {
            dontShow,
          };
        });
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
      .where("bookID", "==", this.state.requestId)
      .get()
      .then((querySnapshot) => {
        const docs = [];
        querySnapshot.forEach((doc) => docs.push(doc.data()));
        if (docs.length > 0) {
          this.props.handleSnackbarOpen("Book Already Requested");
        } else {
          db.collection("Requests")
            .where("userID", "==", this.props.user.uid)
            .get()
            .then((querySnapshot2) => {
              const docs2 = [];
              querySnapshot2.forEach((doc) => docs2.push(doc.data()));
              if (docs2.length >= numOfAllowedBooks) {
                this.props.handleSnackbarOpen("Request Limit Exceeded.");
              } else {
                db.collection("Requests")
                  .add({
                    userID: this.props.user.uid,
                    bookID: this.state.requestId,
                    status: "pending",
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
        }
      })
      .catch((error) => {
        this.handleDialogClose();
        this.props.handleSnackbarOpen(error.message);
      });
  };

  render = () => {
    return (
      <div className="Library">
        <Typography variant="h3">Library</Typography>
        {this.state.library.length > 0 && (
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
                {this.state.library.map((book) => {
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
                          {book.volumeInfo.title ? book.volumeInfo.title : ""}
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
                              this.state.dontShow.length >= numOfAllowedBooks
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
