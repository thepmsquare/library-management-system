import React, { Component } from "react";
import {
  Drawer as MUIDrawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@material-ui/core";
import StorageIcon from "@material-ui/icons/Storage";
import StoreIcon from "@material-ui/icons/Store";

class Drawer extends Component {
  handleInventoryClick = () => {
    this.props.handleChangeFocus("Inventory");
    this.props.handleDrawerClose();
  };

  handleLibraryClick = () => {
    this.props.handleChangeFocus("Library");
    this.props.handleDrawerClose();
  };

  render = () => {
    return (
      <MUIDrawer
        anchor="left"
        open={this.props.isDrawerOpen}
        onClose={this.props.handleDrawerClose}
        className="Drawer"
      >
        <List>
          {this.props.isUserAdmin && (
            <ListItem
              button
              key="Inventory"
              onClick={this.handleInventoryClick}
            >
              <ListItemIcon>
                <StorageIcon />
              </ListItemIcon>
              <ListItemText primary="Inventory" />
            </ListItem>
          )}

          <ListItem button key="Library" onClick={this.handleLibraryClick}>
            <ListItemIcon>
              <StoreIcon />
            </ListItemIcon>
            <ListItemText primary="Library" />
          </ListItem>
        </List>
      </MUIDrawer>
    );
  };
}

export default Drawer;
