import React, { Component } from "react";
import {
  Typography,
  List,
  ListItem,
  ListItemText,
  Paper,
  Divider,
} from "@material-ui/core";
import firebase from "./Firebase";
import "./stylesheets/UserNotifications.css";
const db = firebase.firestore();

class UserNotifications extends Component {
  constructor(props) {
    super(props);
    this.state = { notifications: [] };
  }

  componentDidMount = () => {
    this.unSubNotifications = db
      .collection("Notifications")
      .where("userID", "==", this.props.user.uid)
      .orderBy("time", "desc")
      .onSnapshot((querySnapshot) => {
        const notifications = [];
        querySnapshot.forEach((doc) => notifications.push(doc.data()));
        this.setState(() => {
          return { notifications };
        });
      });
  };

  componentWillUnmount = () => {
    this.unSubNotifications();
  };

  render = () => {
    return (
      <div className="UserNotifications">
        <Typography variant="h3">Notifications</Typography>
        {this.state.notifications.length > 0 && (
          <Paper className="UserNotifications-Container">
            <List>
              {this.state.notifications.length > 0 &&
                this.state.notifications.map((notification) => {
                  return (
                    <div key={notification.time.seconds}>
                      <ListItem>
                        <ListItemText
                          primary={notification.message}
                          secondary={notification.time
                            .toDate()
                            .toLocaleDateString()}
                        />
                      </ListItem>
                      <Divider />
                    </div>
                  );
                })}
            </List>
          </Paper>
        )}
      </div>
    );
  };
}

export default UserNotifications;
