// auth.js (module)
window.authInit = function(modeHint){ /* noop for fallback */ };

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  updateProfile
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

/* === REMPLACE ICI ton firebaseConfig === */
const firebaseConfig = {
  apiKey: "/* REMPLACE ICI - API KEY */",
  authDomain: "/* REMPLACE ICI - AUTH DOMAIN */",
  projectId: "/* REMPLACE ICI - PROJECT ID */",
  storageBucket: "/* REMPLACE ICI - STORAGE BUCKET */",
  messagingSenderId: "/* REMPLACE ICI - MSG SENDER */",
  appId: "/* REMPLACE ICI - APP ID */"
};
/* ======================================= */

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// Expose for page inline call
window.authInit = function(modeHint = 'login') {
  // LOGIN page handlers
  if (document.getElementById('loginBtn')) {
    const loginBtn = document.getElementById('loginBtn');
    const loginEmail = document.getElementById('loginEmail');
    const loginPassword = document.getElementById('loginPassword');
    const loginMessage = document.getElementById('loginMessage');

    loginBtn.onclick = async () => {
      loginMessage.innerText = "";
      const email = loginEmail.value.trim();
      const pass = loginPassword.value;
      if (!email || !pass) { loginMessage.innerText = "Email + mot de passe requis."; return; }
      try {
        await signInWithEmailAndPassword(auth, email, pass);
        loginMessage.innerText = "Connexion réussie — redirection...";
        setTimeout(()=> window.location.href = "dashboard.html", 700);
      } catch (err) {
        loginMessage.innerText = err.message || "Erreur de connexion";
        console.error(err);
      }
    };

    const googleLoginBtn = document.getElementById('googleLoginBtn');
    googleLoginBtn.onclick = async () => {
      try {
        const result = await signInWithPopup(auth, googleProvider);
        await ensureUserDoc(result.user);
        window.location.href = "dashboard.html";
      } catch (err) {
        loginMessage.innerText = (err.message || "Erreur Google");
        console.error(err);
      }
    };
  }

  // SIGNUP page handlers
  if (document.getElementById('registerBtn')) {
    const registerBtn = document.getElementById('registerBtn');
    const regName = document.getElementById('regName');
    const regEmail = document.getElementById('regEmail');
    const regPassword = document.getElementById('regPassword');
    const regMessage = document.getElementById('regMessage');

    registerBtn.onclick = async () => {
      regMessage.innerText = "";
      const name = regName.value.trim();
      const email = regEmail.value.trim();
      const pass = regPassword.value;
      if (!email || pass.length < 6) { regMessage.innerText = "Email valide + mdp 6+ chars."; return; }
      try {
        const cred = await createUserWithEmailAndPassword(auth, email, pass);
        // set displayName if provided
        if (name) {
          try { await updateProfile(cred.user, { displayName: name }); } catch {}
        }
        await ensureUserDoc(cred.user);
        regMessage.innerText = "Compte créé — redirection...";
        setTimeout(()=> window.location.href = "dashboard.html", 700);
      } catch (err) {
        regMessage.innerText = err.message || "Erreur inscription";
        console.error(err);
      }
    };

    const googleRegisterBtn = document.getElementById('googleRegisterBtn');
    if (googleRegisterBtn) {
      googleRegisterBtn.onclick = async () => {
        try {
          const result = await signInWithPopup(auth, googleProvider);
          await ensureUserDoc(result.user);
          window.location.href = "dashboard.html";
        } catch (err) {
          regMessage.innerText = (err.message || "Erreur Google");
          console.error(err);
        }
      };
    }
  }

  // onAuthStateChanged: redirect already-logged users away from auth pages
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // if on login/signup page, redirect to dashboard
      if (location.pathname.endsWith('login.html') || location.pathname.endsWith('signup.html') || location.pathname.endsWith('/')) {
        // small delay to allow UI message
        setTimeout(()=> { if (location.pathname.indexOf('dashboard') === -1) location.href = 'dashboard.html'; }, 200);
      }
    }
  });
};

// Ensure there is a Firestore doc for the user
async function ensureUserDoc(user) {
  if (!user || !user.uid) return;
  const ref = doc(db, 'users', user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    const profile = {
      displayName: user.displayName || null,
      email: user.email || null,
      createdAt: serverTimestamp(),
      credits: 10,
      plan: "free",
      history: []
    };
    await setDoc(ref, profile);
  }
}
