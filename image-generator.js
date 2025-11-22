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

const promptInput = document.getElementById("prompt");
const generateBtn = document.getElementById("generateBtn");
const loader = document.getElementById("loader");
const resultImage = document.getElementById("resultImage");
const downloadBtn = document.getElementById("downloadBtn");
const resolutionSelect = document.getElementById("resolution");

generateBtn.addEventListener("click", async () => {
  const prompt = promptInput.value.trim();
  const resolution = resolutionSelect.value;

  if (!prompt) return alert("Entre une description.");

  loader.classList.remove("hidden");
  resultImage.classList.add("hidden");
  downloadBtn.classList.add("hidden");

  try {
    const res = await fetch("/api/generate-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, resolution })
    });

    const data = await res.json();

    if (data.error) {
      alert("Erreur: " + data.error);
      return;
    }

    const imgBase64 = "data:image/png;base64," + data.image;

    resultImage.src = imgBase64;
    resultImage.classList.remove("hidden");
    downloadBtn.classList.remove("hidden");

    downloadBtn.onclick = () => {
      const link = document.createElement("a");
      link.href = imgBase64;
      link.download = "image_buildAI.png";
      link.click();
    };

  } catch (err) {
    alert("Erreur serveur.");
    console.log(err);
  }

  loader.classList.add("hidden");
});rtyu
