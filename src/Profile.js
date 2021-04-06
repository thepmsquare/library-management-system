import React, { Component } from "react";
import { Button } from "@material-ui/core";
class Profile extends Component {
  handleChangeFocus = () => {
    this.props.handleChangeFocus("Library");
  };

  render = () => {
    return (
      <div className="Profile">
        <Button onClick={this.handleChangeFocus}>Back to Library</Button>
      </div>
    );
  };
}
export default Profile;
