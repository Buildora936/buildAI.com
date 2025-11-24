// --- REDIRECTION VERS LE GÉNÉRATEUR D'IMAGES ---
document.getElementById("openImageGenerator").addEventListener("click", () => {
    window.location.href = "image-generator.html";
});

document.getElementById("cardImageGenerator").addEventListener("click", () => {
    window.location.href = "image-generator.html";
});


// --- FONCTION DE DÉCONNEXION ---
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const auth = getAuth();

document.getElementById("logoutBtn").addEventListener("click", () => {
    signOut(auth)
        .then(() => window.location.href = "login.html")
        .catch(err => alert("Erreur : " + err));
});
