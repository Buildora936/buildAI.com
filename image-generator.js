import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
  getFirestore, doc, getDoc, updateDoc 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { 
  getFunctions, httpsCallable 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-functions.js";

const firebaseConfig = {
  apiKey: "AIzaSyAQYsPnbxkXwpWyA6HPZvIvx3tuq4Nfejg",
  authDomain: "buildai-f12be.firebaseapp.com",
  projectId: "buildai-f12be",
  storageBucket: "buildai-f12be.firebasestorage.app",
  messagingSenderId: "1029156287214",
  appId: "1:1029156287214:web:46a2f65d03924ea74179ff",
  measurementId: "G-WN1JXJBH60"
};

// Initialisation
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const functions = getFunctions(app);

// ===========================
//   AFFICHER LES CRÉDITS
// ===========================
async function loadCredits() {
  const user = auth.currentUser;
  if (!user) return;

  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    document.getElementById("credits").textContent =
      "Crédits : " + snap.data().credits;
  }
}

onAuthStateChanged(auth, () => {
  loadCredits();
});

// ===========================
//   GÉNÉRATION D’IMAGE
// ===========================
const generate = httpsCallable(functions, "generateImage");

document.getElementById("generateBtn").addEventListener("click", async () => {
  const prompt = document.getElementById("prompt").value;
  const loading = document.getElementById("loading");
  const result = document.getElementById("result");

  if (!prompt.trim()) {
    alert("Veuillez entrer une description !");
    return;
  }

  // ▼ Vérification de l’utilisateur
  const user = auth.currentUser;
  if (!user) {
    alert("Veuillez vous connecter.");
    return;
  }

  // ▼ Vérifier crédits
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);

  if (!snap.exists() || snap.data().credits <= 0) {
    alert("Vous n'avez plus de crédits !");
    return;
  }

  // ▼ Déduire 1 crédit
  await updateDoc(ref, {
    credits: snap.data().credits - 1
  });
  loadCredits();

  loading.style.display = "block";
  result.innerHTML = "";

  // ▼ Appel Firebase Cloud Function
  const response = await generate({ prompt });

  loading.style.display = "none";

  if (response.data.error) {
    result.innerHTML = `<p style="color:red;">Erreur : ${response.data.error}</p>`;
    return;
  }

  // ▼ Afficher l’image générée
  result.innerHTML = `
    <img src="${response.data.url}" style="width:100%;border-radius:10px;">
  `;
});
