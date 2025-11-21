// ---------------------------
// Firebase Init
// ---------------------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";

// FIREBASE CONFIGURATION
const firebaseConfig = {
  apiKey: "AIzaSyAQYsPnbxkXwpWyA6HPZvIvx3tuq4Nfejg",
  authDomain: "buildai-f12be.firebaseapp.com",
  projectId: "buildai-f12be",
  storageBucket: "buildai-f12be.firebasestorage.app",
  messagingSenderId: "1029156287214",
  appId: "1:1029156287214:web:46a2f65d03924ea74179ff",
  measurementId: "G-WN1JXJBH60"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// ---------------------------
// SIGNUP email
// ---------------------------
const signupForm = document.getElementById("signupForm");

if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const pass = document.getElementById("password").value.trim();

    try {
      await createUserWithEmailAndPassword(auth, email, pass);
      window.location.href = "dashboard.html"; // redirection OK
    } catch (error) {
      alert(error.message);
    }
  });
}

// ---------------------------
// LOGIN email
// ---------------------------
const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const pass = document.getElementById("password").value.trim();

    try {
      await signInWithEmailAndPassword(auth, email, pass);
      window.location.href = "dashboard.html";
    } catch (error) {
      alert(error.message);
    }
  });
}

// ---------------------------
// GOOGLE LOGIN + SIGNUP
// ---------------------------
const googleLogin = document.getElementById("googleLogin");
const googleSignup = document.getElementById("googleSignup");

async function googleAuth() {
  try {
    await signInWithPopup(auth, provider);
    window.location.href = "dashboard.html";
  } catch (error) {
    alert(error.message);
  }
}

if (googleLogin) googleLogin.onclick = googleAuth;
if (googleSignup) googleSignup.onclick = googleAuth;
