const modeSelect = document.getElementById("mode");
const translateOptions = document.getElementById("translateOptions");
const runBtn = document.getElementById("runBtn");
const loader = document.getElementById("loader");
const resultBox = document.getElementById("resultBox");
const resultText = document.getElementById("result");
const copyBtn = document.getElementById("copyBtn");

modeSelect.addEventListener("change", () => {
  if (modeSelect.value === "translate") {
    translateOptions.classList.remove("hidden");
  } else {
    translateOptions.classList.add("hidden");
  }
});

runBtn.addEventListener("click", async () => {
  const text = document.getElementById("inputText").value.trim();
  const mode = modeSelect.value;
  const target = document.getElementById("targetLang").value;

  if (!text && mode !== "chat") {
    return alert("Entre un texte !");
  }

  resultBox.classList.add("hidden");
  loader.classList.remove("hidden");

  const payload = mode === "chat"
    ? {
        mode: "chat",
        messages: [{ role: "user", content: text }]
      }
    : {
        mode,
        text,
        target
      };

  try {
    const response = await fetch("/api/text-tools", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    loader.classList.add("hidden");

    if (data.error) {
      alert("Erreur : " + data.error);
      return;
    }

    resultText.textContent = data.result;
    resultBox.classList.remove("hidden");
  } catch (e) {
    loader.classList.add("hidden");
    alert("Erreur serveur.");
    console.log(e);
  }
});

copyBtn.addEventListener("click", () => {
  navigator.clipboard.writeText(resultText.textContent);
  alert("Copié !");
});
