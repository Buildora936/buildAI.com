// ====== Import Firebase ======
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";

// ====== CONFIG FIREBASE (mettre la tienne) ======
const firebaseConfig = {
  apiKey: "AIzaSyAQYsPnbxKXwpWyA6HPZvIvx3tuq4Nfejg",
  authDomain: "buildai-f12be.firebaseapp.com",
  projectId: "buildai-f12be",
  storageBucket: "buildai-f12be.firebasestorage.app",
  messagingSenderId: "1029156287214",
  appId: "1:1029156287214:web:46a2f65d03924ea74179ff"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// ====== SIGNUP ======
window.signup = function () {
  const email = document.getElementById("signupEmail").value;
  const password = document.getElementById("signupPassword").value;

  createUserWithEmailAndPassword(auth, email, password)
    .then(() => {
      alert("Compte créé !");
      window.location.href = "dashboard.html";
    })
    .catch(err => alert(err.message));
};

// ====== LOGIN ======
window.login = function () {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  signInWithEmailAndPassword(auth, email, password)
    .then(() => {
      window.location.href = "dashboard.html";
    })
    .catch(err => alert(err.message));
};

// ====== GOOGLE LOGIN ======
window.googleLogin = function () {
  signInWithPopup(auth, provider)
    .then(() => {
      window.location.href = "dashboard.html";
    })
    .catch(err => alert(err.message));
};
