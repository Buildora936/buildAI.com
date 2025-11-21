// dashboard.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
import { getFirestore, doc, getDoc, updateDoc, arrayUnion, onSnapshot, setDoc } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

/* === REMPLACE ICI par ton firebaseConfig (même que dans auth.js) === */
const firebaseConfig = {
  apiKey: "AIzaSyAQYsPnbxkXwpWyA6HPZvIvx3tuq4Nfejg",
  authDomain: "buildai-f12be.firebaseapp.com",
  projectId: "buildai-f12be",
  storageBucket: "buildai-f12be.firebasestorage.app",
  messagingSenderId: "1029156287214",
  appId: "1:1029156287214:web:46a2f65d03924ea74179ff",
  measurementId: "G-WN1JXJBH60"
};
/* ================================================================ */

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// UI
const displayNameEl = document.getElementById('displayName');
const emailEl = document.getElementById('email');
const avatarEl = document.getElementById('avatar');
const planEl = document.getElementById('plan');
const creditsEl = document.getElementById('credits');
const historyListEl = document.getElementById('historyList');

const logoutBtn = document.getElementById('logoutBtn');
const addCreditsBtn = document.getElementById('addCreditsBtn');
const upgradeBtn = document.getElementById('upgradeBtn');

logoutBtn.onclick = () => signOut(auth);

// redirect if not authenticated
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = 'login.html';
    return;
  }

  // listen to user doc changes
  const userRef = doc(db, 'users', user.uid);

  // If doc missing, create default
  const snap = await getDoc(userRef);
  if (!snap.exists()) {
    await setDoc(userRef, {
      displayName: user.displayName || null,
      email: user.email || null,
      credits: 10,
      plan: 'free',
      history: []
    });
  }

  // realtime update
  onSnapshot(userRef, (docSnap) => {
    const data = docSnap.data() || {};
    displayNameEl.innerText = data.displayName || (user.email.split('@')[0]);
    emailEl.innerText = data.email || user.email || '';
    avatarEl.innerText = (displayNameEl.innerText || 'U').charAt(0).toUpperCase();
    planEl.innerText = (data.plan || 'free').toUpperCase();
    creditsEl.innerText = (data.credits ?? 0);
    renderHistory(data.history || []);
  });
});

function renderHistory(arr) {
  historyListEl.innerHTML = '';
  if (!arr.length) {
    historyListEl.innerHTML = '<div class="small">Aucune action pour le moment.</div>';
    return;
  }
  // show latest first
  arr.slice().reverse().forEach(item => {
    const el = document.createElement('div');
    el.className = 'small';
    const time = item.time ? new Date(item.time).toLocaleString() : new Date().toLocaleString();
    el.innerText = `${time} — ${item.action}`;
    el.style.padding = '8px';
    el.style.borderBottom = '1px solid rgba(255,255,255,0.03)';
    historyListEl.appendChild(el);
  });
}

// simulate add credits (in real: call payment API)
addCreditsBtn.onclick = async () => {
  const user = auth.currentUser;
  if (!user) return alert('Connecte-toi');
  const userRef = doc(db, 'users', user.uid);
  const snap = await getDoc(userRef);
  const current = (snap.data()?.credits) ?? 0;
  await updateDoc(userRef, {
    credits: current + 10,
    history: arrayUnion({ time: Date.now(), action: 'Achat crédits +10 (simulé)' })
  });
  alert('10 crédits ajoutés (simulation)');
};

// simulate upgrade
upgradeBtn.onclick = async () => {
  const user = auth.currentUser;
  if (!user) return alert('Connecte-toi');
  const userRef = doc(db, 'users', user.uid);
  await updateDoc(userRef, {
    plan: 'pro',
    history: arrayUnion({ time: Date.now(), action: 'Upgrade vers PRO (simulé)' })
  });
  alert('Compte passé en PRO (simulation)');
};
