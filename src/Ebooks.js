import React, { Component } from "react";
import {
  TableContainer,
  Typography,
  Paper,
  TableCell,
  TableHead,
  TableBody,
  TableRow,
  IconButton,
  Table,
} from "@material-ui/core";
import LinkIcon from "@material-ui/icons/Link";
import firebase from "./Firebase";
import defaultBook from "./images/defaultBook.png";
import "./stylesheets/Ebooks.css";
const db = firebase.firestore();

class Ebooks extends Component {
  constructor(props) {
    super(props);
    this.state = { library: [], fineRemaining: false };
  }

  componentDidMount = () => {
    this.unSubInventory = db
      .collection("Inventory")
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
          this.setState(() => {
            return {
              fineRemaining: false,
            };
          });
        }
      });
  };
  render = () => {
    return (
      <div className="Ebooks">
        <Typography variant="h3">Ebooks</Typography>
        {this.state.library.length > 0 && !this.state.fineRemaining && (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableCell></TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Authors</TableCell>
                <TableCell>Publisher</TableCell>
                <TableCell>Published Date</TableCell>
                <TableCell></TableCell>
              </TableHead>

              <TableBody>
                {this.state.library
                  .filter((ele) => ele.accessInfo.accessViewStatus !== "NONE")
                  .map((book) => {
                    return (
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
                            href={book.accessInfo.webReaderLink}
                            target="_blank"
                          >
                            <LinkIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        {this.state.fineRemaining && (
          <Typography color="secondary" variant="h4">
            Please Pay the fine.
          </Typography>
        )}
      </div>
    );
  };
}

export default Ebooks;
