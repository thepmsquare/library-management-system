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
} from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import BooksAPIKey from "./BooksAPIKey";
import defaultBook from "./images/defaultBook.png";
import "./stylesheets/Inventory.css";

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
    };
  }

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

  handleAddItemSubmit = async (e) => {
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

  render = () => {
    return (
      <div className="Inventory">
        <Typography variant="h3">Inventory</Typography>
        <Paper className="Inventory-AddItem">
          <Button onClick={this.toggleAddItem}>Add Book</Button>
          {this.state.addItem && (
            <div>
              <form
                onSubmit={this.handleAddItemSubmit}
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
                              <IconButton>
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
      </div>
    );
  };
}

export default Inventory;
