// --- OUVRIR / FERMER LA SIDEBAR ---
const sidebar = document.getElementById("sidebar");
document.getElementById("toggleMenu").addEventListener("click", () => {
    sidebar.classList.toggle("closed");
});


// --- BOUTONS VERS LES OUTILS ---
const btn1 = document.getElementById("openImageGenerator");
const btn2 = document.getElementById("cardImageGenerator");

if (btn1) btn1.addEventListener("click", () => {
    window.location.href = "image-generator.html";
});

if (btn2) btn2.addEventListener("click", () => {
    window.location.href = "image-generator.html";
});


// --- DÉCONNEXION FIREBASE ---
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
        try {
            await firebase.auth().signOut();
            window.location.href = "login.html";
        } catch (e) {
            alert("Erreur : " + e.message);
        }
    });
}
