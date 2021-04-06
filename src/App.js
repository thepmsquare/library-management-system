import React, { Component } from "react";
import { Switch, Route, Redirect } from "react-router-dom";
import firebase from "./Firebase";
import LoginRegister from "./LoginRegister";
import Homepage from "./Homepage";
const db = firebase.firestore();

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: false,
      userIsAdmin: false,
    };
  }

  componentDidMount = () => {
    this.checkLogin();
  };

  checkLogin = () => {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        db.collection("Users")
          .doc(user.uid)
          .get()
          .then((doc) => {
            let userIsAdmin = doc.data().isAdmin;
            this.setState(() => {
              return { user, userIsAdmin };
            });
          })
          .catch((error) => {
            // idk how to handle this error.
            alert(error.message);
            firebase.auth().signOut();
          });
      } else {
        this.setState(() => {
          return { user: false };
        });
      }
    });
  };

  render = () => {
    return (
      <div className="App">
        <Switch>
          <Route exact path="/library-management-system/login">
            {this.state.user ? (
              <Redirect
                to={{
                  pathname: "/library-management-system",
                }}
              />
            ) : (
              <LoginRegister />
            )}
          </Route>
          <Route exact path="/library-management-system">
            {this.state.user ? (
              <Homepage
                user={this.state.user}
                userIsAdmin={this.state.userIsAdmin}
              />
            ) : (
              <Redirect
                to={{
                  pathname: "/library-management-system/login",
                }}
              />
            )}
          </Route>
        </Switch>
      </div>
    );
  };
}

export default App;
