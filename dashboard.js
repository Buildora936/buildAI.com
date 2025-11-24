// --- RÉPARER LE BOUTON VERS LE GÉNÉRATEUR D'IMAGES ---
const btn1 = document.getElementById("openImageGenerator");
const btn2 = document.getElementById("cardImageGenerator");

if (btn1) btn1.addEventListener("click", () => window.location.href = "image-generator.html");
if (btn2) btn2.addEventListener("click", () => window.location.href = "image-generator.html");


// --- FONCTION DE DÉCONNEXION ---
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const auth = getAuth();

document.getElementById("logoutBtn").addEventListener("click", () => {
    signOut(auth)
        .then(() => window.location.href = "login.html")
        .catch(err => alert("Erreur : " + err));
});
// --- OUVRIR / FERMER LE MENU ---
const sidebar = document.querySelector(".sidebar");
document.getElementById("toggleMenu").addEventListener("click", () => {
  sidebar.classList.toggle("closed");
});
