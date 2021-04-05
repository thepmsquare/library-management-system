import React, { Component } from "react";
import { Switch, Route, Redirect } from "react-router-dom";
import firebase from "./Firebase";
import LoginRegister from "./LoginRegister";
import Homepage from "./Homepage";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoggedIn: false,
    };
  }

  componentDidMount = () => {
    this.checkLogin();
  };

  checkLogin = () => {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this.setState(() => {
          return { isLoggedIn: true };
        });
      } else {
        this.setState(() => {
          return { isLoggedIn: false };
        });
      }
    });
  };

  render = () => {
    return (
      <div className="App">
        <Switch>
          <Route exact path="/library-management-system/login">
            {this.state.isLoggedIn ? (
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
            {this.state.isLoggedIn ? (
              <Homepage />
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
