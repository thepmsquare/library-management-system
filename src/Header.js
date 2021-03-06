import React, { Component } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
} from "@material-ui/core";
import AccountBoxIcon from "@material-ui/icons/AccountBox";
import VerifiedUserIcon from "@material-ui/icons/VerifiedUser";
import MenuIcon from "@material-ui/icons/Menu";
import "./stylesheets/Header.css";

class Header extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isAccountMenuOpen: false,
    };
  }

  handleAccountMenuOpen = () => {
    this.setState(() => {
      return { isAccountMenuOpen: true };
    });
  };

  handleAccountMenuClose = () => {
    this.setState(() => {
      return { isAccountMenuOpen: false };
    });
  };

  handleChangeFocus = () => {
    this.props.handleChangeFocus("Profile");
    this.handleAccountMenuClose();
  };

  render = () => {
    return (
      <AppBar position="sticky" className="Header">
        <Toolbar className="Header-Toolbar">
          <div className="Header-ToolbarLeft">
            <IconButton color="inherit" onClick={this.props.handleDrawerOpen}>
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap>
              Library Management System
            </Typography>
          </div>

          <IconButton
            color="inherit"
            onClick={this.handleAccountMenuOpen}
            className="Header-AccountButton"
          >
            <AccountBoxIcon />
          </IconButton>
        </Toolbar>

        <Menu
          anchorEl={document.querySelector(".Header-AccountButton")}
          keepMounted
          open={this.state.isAccountMenuOpen}
          onClose={this.handleAccountMenuClose}
        >
          <MenuItem>
            {this.props.isUserAdmin ? (
              <VerifiedUserIcon className="Header-AdminIcon" />
            ) : (
              ""
            )}
            {this.props.user.displayName}
          </MenuItem>
          <MenuItem onClick={this.handleChangeFocus}>Profile</MenuItem>
          <MenuItem onClick={this.props.handleLogout}>Logout</MenuItem>
        </Menu>
      </AppBar>
    );
  };
}
export default Header;
