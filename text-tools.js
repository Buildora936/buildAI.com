// text-tools.js
// Client side for text tools. Uses a single backend endpoint: POST /api/text-tools
// Modes: improve, summarize, translate, generate, description, bio, rewrite, transcribe, chat

const tools = document.querySelectorAll(".tool");
const toolTitle = document.getElementById("toolTitle");
const inputText = document.getElementById("inputText");
const runBtn = document.getElementById("runBtn");
const outputDiv = document.getElementById("output");
const copyBtn = document.getElementById("copyBtn");
const downloadTxtBtn = document.getElementById("downloadTxtBtn");
const speakBtn = document.getElementById("speakBtn");
const fileRow = document.getElementById("fileRow");
const audioFile = document.getElementById("audioFile");
const langSelect = document.getElementById("langSelect");
const toolOptions = document.getElementById("toolOptions");
const chatArea = document.getElementById("chatArea");
const messagesDiv = document.getElementById("messages");
const chatInput = document.getElementById("chatInput");
const chatSend = document.getElementById("chatSend");
const themeToggle = document.getElementById("themeToggle");

let currentTool = "improve";
let chatHistory = [];

// Theme toggle
themeToggle.addEventListener("change", () => {
  if (themeToggle.checked) document.body.classList.add("rose");
  else document.body.classList.remove("rose");
});

// Tool switching
tools.forEach(btn => {
  btn.addEventListener("click", () => {
    tools.forEach(t=>t.classList.remove("active"));
    btn.classList.add("active");
    selectTool(btn.dataset.tool);
  });
});

function selectTool(tool) {
  currentTool = tool;
  toolTitle.textContent = getToolLabel(tool);
  outputDiv.innerHTML = "Résultat affiché ici";
  // Show/hide file row and chat area and options
  fileRow.classList.toggle("hidden", tool !== "transcribe");
  chatArea.classList.toggle("hidden", tool !== "chat");
  renderOptionsFor(tool);
}

function getToolLabel(tool) {
  const labels = {
    improve: "✏️ Correcteur / Améliorer",
    summarize: "📝 Résumeur",
    translate: "🌐 Traducteur",
    generate: "⚡ Générateur de texte (IA)",
    description: "🛍️ Description produit",
    bio: "👤 Rédacteur de biographie",
    rewrite: "🔁 Réécriture",
    transcribe: "🎤 Transcription",
    chat: "💬 Chatbot IA"
  };
  return labels[tool] || tool;
}

function renderOptionsFor(tool) {
  toolOptions.innerHTML = "";
  if (tool === "translate") {
    toolOptions.innerHTML = `<label>Langue cible</label>
      <select id="targetLang" class="select">
        <option value="fr">Français</option>
        <option value="en">Anglais</option>
        <option value="es">Espagnol</option>
      </select>`;
  } else if (tool === "generate") {
    toolOptions.innerHTML = `<label>Tone / Style (ex: professionnel, amical, court)</label>
      <input id="toneInput" class="input" placeholder="professionnel">`;
  } else {
    toolOptions.innerHTML = "";
  }
}

// Run button
runBtn.addEventListener("click", async () => {
  clearOutput();
  if (currentTool === "transcribe") {
    return transcribeFile();
  }
  if (currentTool === "chat") {
    return sendChatMessage();
  }
  const text = inputText.value.trim();
  if (!text) return alert("Entrez du texte ou utilisez la transcription.");
  outputDiv.innerHTML = loadingHtml();
  try {
    const payload = {
      mode: currentTool,
      text,
      lang: langSelect.value
    };
    if (currentTool === "translate") {
      payload.target = document.getElementById("targetLang").value;
    }
    if (currentTool === "generate") {
      payload.tone = document.getElementById("toneInput")?.value || "";
    }
    const res = await fetch("/api/text-tools", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const j = await res.json();
    if (j.error) {
      outputDiv.innerHTML = `<div class="muted">Erreur: ${escapeHtml(j.error)}</div>`;
    } else {
      outputDiv.innerHTML = `<pre>${escapeHtml(j.result || JSON.stringify(j))}</pre>`;
    }
  } catch (e) {
    console.error(e);
    outputDiv.innerHTML = `<div class="muted">Erreur serveur. Vérifie l'API /api/text-tools.</div>`;
  }
});

// Transcription (file)
async function transcribeFile() {
  const f = audioFile.files[0];
  if (!f) return alert("Choisis un fichier audio.");
  outputDiv.innerHTML = loadingHtml();
  try {
    const fd = new FormData();
    fd.append("mode", "transcribe");
    fd.append("file", f);
    const res = await fetch("/api/text-tools", { method: "POST", body: fd });
    const j = await res.json();
    if (j.error) outputDiv.innerHTML = `<div class="muted">Erreur: ${escapeHtml(j.error)}</div>`;
    else {
      outputDiv.innerHTML = `<pre>${escapeHtml(j.result)}</pre>`;
      inputText.value = j.result; // place transcription in input for editing
    }
  } catch (e) {
    console.error(e);
    outputDiv.innerHTML = `<div class="muted">Erreur transcription.</div>`;
  }
}

// Chat
async function sendChatMessage() {
  const msg = chatInput.value.trim();
  if (!msg) return;
  appendMessage("user", msg);
  chatInput.value = "";
  outputDiv.innerHTML = loadingHtml();
  try {
    chatHistory.push({ role: "user", content: msg });
    const res = await fetch("/api/text-tools", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: "chat", messages: chatHistory })
    });
    const j = await res.json();
    if (j.error) {
      appendMessage("bot", "Erreur: " + j.error);
    } else {
      const botText = j.result || j.reply || "Pas de réponse";
      appendMessage("bot", botText);
      chatHistory.push({ role: "assistant", content: botText });
    }
    outputDiv.innerHTML = "";
  } catch (e) {
    console.error(e);
    appendMessage("bot", "Erreur serveur.");
  }
}

function appendMessage(who, text) {
  const div = document.createElement("div");
  div.className = "msg " + (who === "user" ? "user" : "bot");
  div.innerText = text;
  messagesDiv.appendChild(div);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Utilities
copyBtn.addEventListener("click", () => {
  const text = outputDiv.innerText || "";
  navigator.clipboard.writeText(text).then(()=> alert("Copié !"));
});
downloadTxtBtn.addEventListener("click", () => {
  const text = outputDiv.innerText || "";
  const blob = new Blob([text], {type:"text/plain"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "result.txt";
  a.click();
});
speakBtn.addEventListener("click", () => {
  const text = outputDiv.innerText || "";
  if (!text) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = langSelect.value === "fr" ? "fr-FR" : "en-US";
  window.speechSynthesis.speak(u);
});

function clearOutput() { outputDiv.innerHTML = ""; }
function loadingHtml() { return `<div class="muted">⏳ Génération en cours…</div>`; }
function escapeHtml(s){ if(!s) return ""; return String(s).replace(/[&<>"']/g, (m)=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }

// Init
selectTool("improve");
