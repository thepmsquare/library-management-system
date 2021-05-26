# Library Management System

To check out the project...

> Clone / Download zip

> run "npm install" (will require node and npm)

> add firebase config object for your project in src/Firebase.js

```js script
import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import "firebase/analytics";
const firebaseConfig = {
  //...
};
firebase.initializeApp(firebaseConfig);
firebase.analytics();

export default firebase;
```

> add Google Books API Key in src/BooksAPIKey.js

```js script
const BooksAPIKey = "...";
export default BooksAPIKey;
```

> run "npm start"

Feedback is appreciated. Thank you!
