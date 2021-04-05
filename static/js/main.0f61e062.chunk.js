(this["webpackJsonplibrary-management-system"]=this["webpackJsonplibrary-management-system"]||[]).push([[0],{87:function(e,n,t){},97:function(e,n,t){"use strict";t.r(n);var a=t(0),s=t.n(a),r=t(14),i=t.n(r),o=t(37),c=t(40),l=t(39),u=t(16),g=t(59);t(84),t(99);g.a.initializeApp({apiKey:"AIzaSyBBYCDggpHEho-sMOj_HxvgSC2wetbSUB8",authDomain:"library-management-syste-57f9f.firebaseapp.com",projectId:"library-management-syste-57f9f",storageBucket:"library-management-syste-57f9f.appspot.com",messagingSenderId:"659487115186",appId:"1:659487115186:web:4eed8326ab5cd4c63f86ab",measurementId:"G-LT3BJB781F"});var d=g.a,h=t(66),b=t(127),m=t(135),f=t(131),j=t(134),p=t(132),O=t(137),v=t(133),w=t(71),S=t.n(w),y=(t(87),t(9)),k=d.firestore(),C=function(e){Object(c.a)(t,e);var n=Object(l.a)(t);function t(e){var a;return Object(o.a)(this,t),(a=n.call(this,e)).handleTabValueChange=function(e,n){a.setState((function(){return{tabValue:n}}))},a.handleInputChange=function(e){var n=e.target.getAttribute("name"),t=e.target.value;a.setState((function(){return Object(h.a)({},n,t)}))},a.handleSnackbarClose=function(){a.setState((function(){return{isSnackbarOpen:!1,snackbarMessage:""}}))},a.handleLoginSubmit=function(e){e.preventDefault(),d.auth().signInWithEmailAndPassword(a.state.loginEmail,a.state.loginPassword).catch((function(e){a.setState((function(){return{isSnackbarOpen:!0,snackbarMessage:e.message}}))}))},a.handleRegisterSubmit=function(e){e.preventDefault(),a.state.registerPassword===a.state.registerPasswordConfirm?""!==a.state.registerAdminKey?k.collection("AdminKeys").where("Keys","!=",[]).get().then((function(e){var n=[];e.forEach((function(e){return n.push(e.data())})),0!==n.length&&-1!==n[0].Keys.indexOf(a.state.registerAdminKey)?a.registerUser(!0):a.setState((function(){return{isSnackbarOpen:!0,snackbarMessage:"Invalid Admin Keys"}}))})).catch((function(e){a.setState((function(){return{isSnackbarOpen:!0,snackbarMessage:e.message}}))})):a.registerUser(!1):a.setState((function(){return{isSnackbarOpen:!0,snackbarMessage:"Passwords do not match."}}))},a.registerUser=function(e){d.auth().createUserWithEmailAndPassword(a.state.registerEmail,a.state.registerPassword).then((function(n){n.user.updateProfile({displayName:a.state.registerUsername}).then((function(){e&&k.collection("Users").doc(n.user.uid).set({isAdmin:!0}).catch((function(e){a.setState((function(){return{isSnackbarOpen:!0,snackbarMessage:e.message}}))}))})).catch((function(e){a.setState((function(){return{isSnackbarOpen:!0,snackbarMessage:e.message}}))}))})).catch((function(e){a.setState((function(){return{isSnackbarOpen:!0,snackbarMessage:e.message}}))}))},a.render=function(){return Object(y.jsxs)("div",{className:"LoginRegister",children:[Object(y.jsxs)(b.a,{elevation:3,className:"LoginRegister-FormContainer",children:[Object(y.jsxs)(m.a,{value:a.state.tabValue,onChange:a.handleTabValueChange,children:[Object(y.jsx)(f.a,{label:"Login"}),Object(y.jsx)(f.a,{label:"Register"})]}),0===a.state.tabValue?Object(y.jsxs)("form",{onSubmit:a.handleLoginSubmit,className:"LoginRegister-Form",children:[Object(y.jsx)(j.a,{label:"Email",type:"email",required:!0,name:"loginEmail",value:a.state.loginEmail,onChange:a.handleInputChange}),Object(y.jsx)(j.a,{label:"Password",type:"password",required:!0,name:"loginPassword",value:a.state.loginPassword,onChange:a.handleInputChange}),Object(y.jsx)(p.a,{type:"submit",children:"Log In"})]}):Object(y.jsxs)("form",{onSubmit:a.handleRegisterSubmit,className:"LoginRegister-Form",children:[Object(y.jsx)(j.a,{label:"Username",required:!0,name:"registerUsername",value:a.state.registerUsername,onChange:a.handleInputChange}),Object(y.jsx)(j.a,{label:"Email",type:"email",required:!0,name:"registerEmail",value:a.state.registerEmail,onChange:a.handleInputChange}),Object(y.jsx)(j.a,{label:"Password",type:"password",required:!0,name:"registerPassword",value:a.state.registerPassword,onChange:a.handleInputChange}),Object(y.jsx)(j.a,{label:"Confirm Password",type:"password",required:!0,name:"registerPasswordConfirm",value:a.state.registerPasswordConfirm,onChange:a.handleInputChange}),Object(y.jsx)(j.a,{label:"Admin Key",name:"registerAdminKey",value:a.state.registerAdminKey,onChange:a.handleInputChange}),Object(y.jsx)(p.a,{type:"submit",children:"Register"})]})]}),Object(y.jsx)(O.a,{anchorOrigin:{vertical:"bottom",horizontal:"left"},open:a.state.isSnackbarOpen,autoHideDuration:6e3,onClose:a.handleSnackbarClose,message:a.state.snackbarMessage,action:Object(y.jsx)(s.a.Fragment,{children:Object(y.jsx)(v.a,{size:"small","aria-label":"close",color:"inherit",onClick:a.handleSnackbarClose,children:Object(y.jsx)(S.a,{fontSize:"small"})})})})]})},a.state={tabValue:0,loginEmail:"",loginPassword:"",registerUsername:"",registerEmail:"",registerPassword:"",registerPasswordConfirm:"",registerAdminKey:"",isSnackbarOpen:!1,snackbarMessage:""},a}return t}(a.Component),x=function(e){Object(c.a)(t,e);var n=Object(l.a)(t);function t(){var e;Object(o.a)(this,t);for(var a=arguments.length,s=new Array(a),r=0;r<a;r++)s[r]=arguments[r];return(e=n.call.apply(n,[this].concat(s))).handleLogout=function(){d.auth().signOut()},e.render=function(){return Object(y.jsxs)("div",{className:"Homepage",children:[Object(y.jsx)("h1",{children:"Homepage"}),Object(y.jsx)(p.a,{color:"secondary",onClick:e.handleLogout,children:"Logout"})]})},e}return t}(a.Component),P=function(e){Object(c.a)(t,e);var n=Object(l.a)(t);function t(e){var a;return Object(o.a)(this,t),(a=n.call(this,e)).componentDidMount=function(){a.checkLogin()},a.checkLogin=function(){d.auth().onAuthStateChanged((function(e){e?a.setState((function(){return{isLoggedIn:!0}})):a.setState((function(){return{isLoggedIn:!1}}))}))},a.render=function(){return Object(y.jsx)("div",{className:"App",children:Object(y.jsxs)(u.d,{children:[Object(y.jsx)(u.b,{exact:!0,path:"/login",children:a.state.isLoggedIn?Object(y.jsx)(u.a,{to:{pathname:"/"}}):Object(y.jsx)(C,{})}),Object(y.jsx)(u.b,{exact:!0,path:"/",children:a.state.isLoggedIn?Object(y.jsx)(x,{}):Object(y.jsx)(u.a,{to:{pathname:"/login"}})})]})})},a.state={isLoggedIn:!1},a}return t}(a.Component),I=Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));function L(e,n){navigator.serviceWorker.register(e).then((function(e){e.onupdatefound=function(){var t=e.installing;null!=t&&(t.onstatechange=function(){"installed"===t.state&&(navigator.serviceWorker.controller?(console.log("New content is available and will be used when all tabs for this page are closed. See https://cra.link/PWA."),n&&n.onUpdate&&n.onUpdate(e)):(console.log("Content is cached for offline use."),n&&n.onSuccess&&n.onSuccess(e)))})}})).catch((function(e){console.error("Error during service worker registration:",e)}))}var A=function(e){e&&e instanceof Function&&t.e(3).then(t.bind(null,138)).then((function(n){var t=n.getCLS,a=n.getFID,s=n.getFCP,r=n.getLCP,i=n.getTTFB;t(e),a(e),s(e),r(e),i(e)}))},E=t(58);i.a.render(Object(y.jsx)(s.a.StrictMode,{children:Object(y.jsx)(E.a,{children:Object(y.jsx)(P,{})})}),document.getElementById("root")),function(e){if("serviceWorker"in navigator){if(new URL("/library-management-system",window.location.href).origin!==window.location.origin)return;window.addEventListener("load",(function(){var n="".concat("/library-management-system","/service-worker.js");I?(!function(e,n){fetch(e,{headers:{"Service-Worker":"script"}}).then((function(t){var a=t.headers.get("content-type");404===t.status||null!=a&&-1===a.indexOf("javascript")?navigator.serviceWorker.ready.then((function(e){e.unregister().then((function(){window.location.reload()}))})):L(e,n)})).catch((function(){console.log("No internet connection found. App is running in offline mode.")}))}(n,e),navigator.serviceWorker.ready.then((function(){console.log("This web app is being served cache-first by a service worker. To learn more, visit https://cra.link/PWA")}))):L(n,e)}))}}(),A()}},[[97,1,2]]]);
//# sourceMappingURL=main.0f61e062.chunk.js.map