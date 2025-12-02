document.getElementById("generateBtn").addEventListener("click", async () => {

  const prompt = document.getElementById("prompt").value.trim();
  const style = document.getElementById("style").value;
  const resolution = document.getElementById("resolution").value;
  const format = document.getElementById("format").value;

  if (!prompt) return alert("Entrez une description.");

  const finalPrompt = style ? `${prompt}, ${style}` : prompt;

  const loader = document.getElementById("loader");
  const img = document.getElementById("resultImage");
  const dl = document.getElementById("downloadSection");

  img.style.display = "none";
  dl.style.display = "none";
  loader.style.display = "block";

  try {
    const response = await fetch("/api/generate-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: finalPrompt,
        resolution,
        format
      })
    });

    const data = await response.json();

    if (data.error) {
      alert("Erreur : " + data.error);
      loader.style.display = "none";
      return;
    }

    const base64 = "data:image/" + format + ";base64," + data.image;

    img.src = base64;
    img.style.display = "block";

    document.getElementById("downloadBtn").onclick = () => {
      const a = document.createElement("a");
      a.href = base64;
      a.download = "buildAI_image." + format;
      a.click();
    };

    dl.style.display = "block";

  } catch (e) {
    alert("Erreur serveur.");
    console.log(e);
  }

  loader.style.display = "none";
});
// -------------------------
// 🎨 SWITCH THÈME
// -------------------------
const themeBtn = document.getElementById("themeToggle");

themeBtn.addEventListener("click", () => {
  document.body.classList.toggle("theme-pink");

  themeBtn.textContent = 
    document.body.classList.contains("theme-pink")
    ? "🎨 Thème Bleu"
    : "🎨 Thème Rose";
});
