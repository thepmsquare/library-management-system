import React, { Component } from "react";
import {
  Typography,
  Paper,
  Button,
  TextField,
  TableContainer,
  TableHead,
  TableRow,
  Table,
  TableCell,
  TableBody,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import EditIcon from "@material-ui/icons/Edit";
import DeleteIcon from "@material-ui/icons/Delete";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import CancelIcon from "@material-ui/icons/Cancel";
import BooksAPIKey from "./BooksAPIKey";
import defaultBook from "./images/defaultBook.png";
import firebase from "./Firebase";
import "./stylesheets/Inventory.css";
const db = firebase.firestore();

class Inventory extends Component {
  constructor(props) {
    super(props);
    this.state = {
      addItem: false,
      searchTitle: "",
      searchAuthor: "",
      searchPublisher: "",
      searchISBN: "",
      searchResult: [],
      isAddDialogOpen: false,
      addId: "",
      addQuantity: "",
      addPrice: "",
      inventory: [],
      isEditDialogOpen: false,
      editId: "",
      editQuantity: "",
      editPrice: "",
      isDeleteDialogOpen: false,
      idToBeDeleted: "",
      lostBooks: {},
    };
  }

  componentDidMount = () => {
    this.unsubInventoryListener = db
      .collection("Inventory")
      .onSnapshot((querySnapshot) => {
        let inventory = [];
        querySnapshot.forEach(async (doc) => {
          const url =
            "https://www.googleapis.com/books/v1/volumes/" + doc.data().id;
          try {
            const result = await fetch(url);
            const apiData = await result.json();
            if (apiData) {
              inventory.push({
                ...apiData,
                quantity: doc.data().quantity,
                price: doc.data().price,
              });
              this.setState(() => {
                return { inventory };
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
    this.unSubRequestListener = db
      .collection("Requests")
      .onSnapshot((querySnapshot) => {
        const lostBooks = [];
        querySnapshot.forEach((doc) => {
          let allStatus = doc.data().history.map((ele) => ele.status);
          if (allStatus.indexOf("lost") !== -1 && !doc.data().isRestocked) {
            lostBooks.push({ ...doc.data() });
          }
        });
        this.setState(() => {
          return { lostBooks };
        });
      });
  };

  componentWillUnmount = () => {
    this.unsubInventoryListener();
    this.unSubRequestListener();
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

  toggleAddItem = () => {
    this.setState((curState) => {
      return { addItem: !curState.addItem };
    });
  };

  handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (
      !this.state.searchTitle &&
      !this.state.searchAuthor &&
      !this.state.searchPublisher &&
      !this.state.searchISBN
    ) {
      this.props.handleSnackbarOpen("Please Enter at least 1 field.");
    } else {
      let url = "https://www.googleapis.com/books/v1/volumes?q=";
      if (this.state.searchTitle) {
        url += `intitle:${this.state.searchTitle}`;
      }
      if (this.state.searchAuthor) {
        if (this.state.searchTitle) {
          url += `+inauthor:${this.state.searchAuthor}`;
        } else {
          url += `inauthor:${this.state.searchAuthor}`;
        }
      }
      if (this.state.searchPublisher) {
        if (this.state.searchTitle || this.state.searchAuthor) {
          url += `+inpublisher:${this.state.searchPublisher}`;
        } else {
          url += `inpublisher:${this.state.searchPublisher}`;
        }
      }
      if (this.state.searchISBN) {
        if (
          this.state.searchTitle ||
          this.state.searchAuthor ||
          this.state.searchPublisher
        ) {
          url += `+isbn:${this.state.searchISBN}`;
        } else {
          url += `isbn:${this.state.searchISBN}`;
        }
      }
      url += `&key=${BooksAPIKey}`;
      try {
        const result = await fetch(url);
        const data = await result.json();
        if (data.items) {
          this.setState(() => {
            return { searchResult: data.items };
          });
        } else {
          this.props.handleSnackbarOpen("No results found.");
        }
      } catch (error) {
        this.props.handleSnackbarOpen(error.message);
      }
    }
  };

  handleDialogClose = () => {
    this.setState(() => {
      return {
        isAddDialogOpen: false,
        isEditDialogOpen: false,
        isDeleteDialogOpen: false,
        addId: "",
        editId: "",
        idToBeDeleted: "",
      };
    });
  };

  handleAddItemDialogOpen = (id) => {
    this.setState(() => {
      return { addId: id, isAddDialogOpen: true };
    });
  };

  handleAddSubmit = (e) => {
    e.preventDefault();
    db.collection("Inventory")
      .where("id", "==", this.state.addId)
      .get()
      .then((querySnapshot) => {
        const docs = [];
        querySnapshot.forEach((doc) => docs.push(doc));
        if (docs.length > 0) {
          this.handleDialogClose();
          this.props.handleSnackbarOpen("Duplicate Item.");
        } else {
          db.collection("Inventory")
            .add({
              id: this.state.addId,
              quantity: parseInt(this.state.addQuantity),
              price: parseFloat(this.state.addPrice),
            })
            .then(() => {
              this.setState(
                () => {
                  return {
                    isAddDialogOpen: false,
                    addQuantity: "",
                    addPrice: "",
                    addId: "",
                    addItem: false,
                    searchTitle: "",
                    searchAuthor: "",
                    searchPublisher: "",
                    searchISBN: "",
                    searchResult: [],
                  };
                },
                () => {
                  this.props.handleSnackbarOpen("Added to Inventory");
                }
              );
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

  handleEditItemDialogOpen = (id) => {
    this.setState((curState) => {
      const editQuantity = curState.inventory.find((ele) => ele.id === id)
        .quantity;
      const editPrice = curState.inventory.find((ele) => ele.id === id).price;
      return { editId: id, isEditDialogOpen: true, editQuantity, editPrice };
    });
  };

  handleEditSubmit = (e) => {
    e.preventDefault();
    db.collection("Inventory")
      .where("id", "==", this.state.editId)
      .get()
      .then((querySnapshot) => {
        const docs = [];
        querySnapshot.forEach((doc) => docs.push(doc.ref));
        if (docs.length > 0) {
          docs[0]
            .update({
              quantity: parseInt(this.state.editQuantity),
              price: parseFloat(this.state.editPrice),
            })
            .then(() => {
              this.setState(
                () => {
                  return {
                    isEditDialogOpen: false,
                    editQuantity: "",
                    editPrice: "",
                    editId: "",
                  };
                },
                () => {
                  this.props.handleSnackbarOpen("Updated Inventory");
                }
              );
            })
            .catch((error) => {
              this.handleDialogClose();
              this.props.handleSnackbarOpen(error.message);
            });
        } else {
          this.handleDialogClose();
          // will not occur.
          this.props.handleSnackbarOpen("Unexpected Error.");
        }
      })
      .catch((error) => {
        this.handleDialogClose();
        this.props.handleSnackbarOpen(error.message);
      });
  };

  handleDeleteDialogOpen = (id) => {
    this.setState(() => {
      return {
        isDeleteDialogOpen: true,
        idToBeDeleted: id,
      };
    });
  };

  handleDeleteItem = () => {
    db.collection("Inventory")
      .where("id", "==", this.state.idToBeDeleted)
      .get()
      .then((querySnapshot) => {
        const docs = [];
        querySnapshot.forEach((doc) => docs.push(doc.ref));
        db.collection("Requests")
          .where("bookID", "==", this.state.idToBeDeleted)
          .get()
          .then((querySnapshot2) => {
            const docs2 = [];
            querySnapshot2.forEach((doc) => docs2.push(doc.ref));
            if (docs2.length === 0) {
              docs[0]
                .delete()
                .then(() => {
                  this.setState(
                    () => {
                      return {
                        isDeleteDialogOpen: false,
                        idToBeDeleted: "",
                      };
                    },
                    () => {
                      this.props.handleSnackbarOpen(
                        "Item successfully deleted!"
                      );
                    }
                  );
                })
                .catch((error) => {
                  this.handleDialogClose();
                  this.props.handleSnackbarOpen(error.message);
                });
            } else {
              this.handleDialogClose();
              this.props.handleSnackbarOpen(
                "Cannot delete item to preserve records."
              );
            }
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

  getDays = (date1, date2) => {
    const diffTime = Math.abs(date2 - date1);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  handleRestock = (seconds, bookID, userID) => {
    db.collection("Inventory")
      .where("id", "==", bookID)
      .get()
      .then((querySnapshot) => {
        const docs = [];
        querySnapshot.forEach((doc) => docs.push(doc.ref));
        docs[0]
          .update({
            quantity: firebase.firestore.FieldValue.increment(1),
          })
          .then(() => {
            db.collection("Requests")
              .where("bookID", "==", bookID)
              .where("userID", "==", userID)
              .get()
              .then((querySnapshot2) => {
                const docs2 = [];
                querySnapshot2.forEach((doc) => {
                  if (
                    doc.data().history.find((ele) => ele.status === "lost").time
                      .seconds === seconds
                  ) {
                    docs2.push(doc.ref);
                  }
                });
                docs2[0]
                  .update({
                    isRestocked: true,
                  })
                  .then(() => {
                    this.props.handleSnackbarOpen(
                      `${
                        this.state.inventory.find((ele) => ele.id === bookID)
                          .volumeInfo.title
                      } restocked.`
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
          })
          .catch((error) => {
            this.handleDialogClose();
            this.props.handleSnackbarOpen(error.message);
          });
      })
      .catch((error) => {
        this.props.handleSnackbarOpen(error.message);
      });
  };

  render = () => {
    return (
      <div className="Inventory">
        <Typography variant="h3">Inventory</Typography>
        <Paper className="Inventory-AddItem">
          <Button onClick={this.toggleAddItem}>Add Book</Button>
          {this.state.addItem && (
            <div>
              <form
                onSubmit={this.handleSearchSubmit}
                className="Inventory-AddItemForm"
              >
                <Typography variant="h4">Search for a book</Typography>
                <TextField
                  label="Title"
                  name="searchTitle"
                  value={this.state.searchTitle}
                  onChange={this.handleInputChange}
                ></TextField>
                <TextField
                  label="Author"
                  name="searchAuthor"
                  value={this.state.searchAuthor}
                  onChange={this.handleInputChange}
                ></TextField>
                <TextField
                  label="Publisher"
                  name="searchPublisher"
                  value={this.state.searchPublisher}
                  onChange={this.handleInputChange}
                ></TextField>
                <TextField
                  label="ISBN"
                  InputProps={{
                    inputProps: { pattern: "[0-9]{10}|[0-9]{13}" },
                  }}
                  name="searchISBN"
                  value={this.state.searchISBN}
                  onChange={this.handleInputChange}
                ></TextField>

                <Button type="submit">Search</Button>
              </form>
              {this.state.searchResult.length > 0 && (
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell></TableCell>
                        <TableCell>Title</TableCell>
                        <TableCell>Authors</TableCell>
                        <TableCell>Publisher</TableCell>
                        <TableCell>Category</TableCell>
                        <TableCell>Published Date</TableCell>
                        <TableCell>Number of Pages</TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {this.state.searchResult.map((result) => {
                        return (
                          <TableRow key={result.id}>
                            <TableCell>
                              <img
                                src={
                                  result.volumeInfo.imageLinks
                                    ? result.volumeInfo.imageLinks.thumbnail
                                    : defaultBook
                                }
                                alt={result.title}
                              ></img>
                            </TableCell>
                            <TableCell>
                              {result.volumeInfo.title
                                ? result.volumeInfo.title
                                : ""}
                            </TableCell>
                            <TableCell>
                              {result.volumeInfo.authors
                                ? result.volumeInfo.authors.join(", ")
                                : ""}
                            </TableCell>
                            <TableCell>
                              {result.volumeInfo.publisher
                                ? result.volumeInfo.publisher
                                : ""}
                            </TableCell>
                            <TableCell>
                              {result.volumeInfo.categories
                                ? result.volumeInfo.categories.join(", ")
                                : ""}
                            </TableCell>
                            <TableCell>
                              {result.volumeInfo.publishedDate
                                ? result.volumeInfo.publishedDate
                                : ""}
                            </TableCell>
                            <TableCell>
                              {result.volumeInfo.pageCount
                                ? result.volumeInfo.pageCount
                                : ""}
                            </TableCell>
                            <TableCell>
                              <IconButton
                                onClick={() => {
                                  this.handleAddItemDialogOpen(result.id);
                                }}
                              >
                                <AddIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                  <Typography>
                    Please search for specific terms if unable to find required
                    book.
                  </Typography>
                </TableContainer>
              )}
            </div>
          )}
        </Paper>
        {this.state.inventory.length > 0 && (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell></TableCell>
                  <TableCell>Title</TableCell>
                  <TableCell>Authors</TableCell>
                  <TableCell>Publisher</TableCell>
                  <TableCell>Published Date</TableCell>
                  <TableCell>Price (₹)</TableCell>
                  <TableCell>Quantity</TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {this.state.inventory.map((book) => {
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
                      <TableCell>{book.price ? book.price : ""}</TableCell>
                      <TableCell>
                        {book.quantity > -1 ? book.quantity : ""}
                      </TableCell>
                      <TableCell>
                        <IconButton
                          onClick={() => {
                            this.handleEditItemDialogOpen(book.id);
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                      </TableCell>
                      <TableCell>
                        <IconButton
                          onClick={() => {
                            this.handleDeleteDialogOpen(book.id);
                          }}
                          color="secondary"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        {this.state.lostBooks.length > 0 && (
          <TableContainer component={Paper}>
            <Typography variant="h4">Restock lost books</Typography>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Price (₹)</TableCell>
                  <TableCell>User ID</TableCell>
                  <TableCell>Reimbursed</TableCell>
                  <TableCell>Lost Date</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {this.state.lostBooks.map((lostBook) => {
                  return (
                    <TableRow
                      key={
                        lostBook.history.find((ele) => ele.status === "lost")
                          .time.seconds
                      }
                    >
                      <TableCell>
                        {this.state.inventory.find(
                          (ele) => ele.id === lostBook.bookID
                        ) &&
                          this.state.inventory.find(
                            (ele) => ele.id === lostBook.bookID
                          ).volumeInfo.title}
                      </TableCell>
                      <TableCell>
                        {this.state.inventory.find(
                          (ele) => ele.id === lostBook.bookID
                        ) &&
                          this.state.inventory.find(
                            (ele) => ele.id === lostBook.bookID
                          ).price}
                      </TableCell>
                      <TableCell>{lostBook.userID}</TableCell>
                      <TableCell>
                        {lostBook.history[lostBook.history.length - 1]
                          .status === "returned" ? (
                          <CheckCircleIcon color="primary" />
                        ) : (
                          <CancelIcon color="secondary" />
                        )}
                      </TableCell>
                      <TableCell>
                        {"(" +
                          this.getDays(
                            lostBook.history
                              .find((ele) => ele.status === "lost")
                              .time.toDate(),
                            new Date(Date.now())
                          ) +
                          " Days ago) " +
                          lostBook.history
                            .find((ele) => ele.status === "lost")
                            .time.toDate()
                            .toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          onClick={() =>
                            this.handleRestock(
                              lostBook.history.find(
                                (ele) => ele.status === "lost"
                              ).time.seconds,
                              lostBook.bookID,
                              lostBook.userID
                            )
                          }
                        >
                          Restock
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        <Dialog
          open={this.state.isAddDialogOpen}
          onClose={this.handleDialogClose}
        >
          <form onSubmit={this.handleAddSubmit}>
            <DialogTitle>Add to inventory</DialogTitle>
            <DialogContent>
              <DialogContentText>
                {this.state.isAddDialogOpen
                  ? this.state.searchResult.find(
                      (ele) => ele.id === this.state.addId
                    ).volumeInfo.title
                  : ""}
              </DialogContentText>
              <TextField
                required
                type="number"
                value={this.state.addQuantity}
                onChange={this.handleInputChange}
                name="addQuantity"
                label="Quantity"
                InputProps={{ inputProps: { min: 0 } }}
                fullWidth
              />
              <TextField
                required
                type="number"
                value={this.state.addPrice}
                onChange={this.handleInputChange}
                name="addPrice"
                label="Price (₹)"
                InputProps={{ inputProps: { min: 0, step: "any" } }}
                fullWidth
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={this.handleDialogClose} color="primary">
                Cancel
              </Button>
              <Button color="primary" type="submit">
                Add
              </Button>
            </DialogActions>
          </form>
        </Dialog>
        <Dialog
          open={this.state.isEditDialogOpen}
          onClose={this.handleDialogClose}
        >
          <form onSubmit={this.handleEditSubmit}>
            <DialogTitle>Edit inventory</DialogTitle>
            <DialogContent>
              <DialogContentText>
                {this.state.isEditDialogOpen
                  ? this.state.inventory.find(
                      (ele) => ele.id === this.state.editId
                    ).volumeInfo.title
                  : ""}
              </DialogContentText>
              <TextField
                required
                type="number"
                value={this.state.editQuantity}
                onChange={this.handleInputChange}
                name="editQuantity"
                label="Quantity"
                InputProps={{ inputProps: { min: 0 } }}
                fullWidth
              />
              <TextField
                required
                type="number"
                value={this.state.editPrice}
                onChange={this.handleInputChange}
                name="editPrice"
                label="Price (₹)"
                InputProps={{ inputProps: { min: 0, step: "any" } }}
                fullWidth
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={this.handleDialogClose} color="primary">
                Cancel
              </Button>
              <Button color="primary" type="submit">
                Save
              </Button>
            </DialogActions>
          </form>
        </Dialog>
        <Dialog
          open={this.state.isDeleteDialogOpen}
          onClose={this.handleDialogClose}
        >
          <DialogTitle>Confirm Deletion.</DialogTitle>
          <DialogActions>
            <Button onClick={this.handleDialogClose} color="primary">
              Cancel
            </Button>
            <Button onClick={this.handleDeleteItem} color="secondary">
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  };
}

export default Inventory;
