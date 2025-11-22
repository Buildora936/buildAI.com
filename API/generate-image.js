export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  try {
    const { prompt, resolution } = req.body;

    if (!prompt || prompt.trim() === "") {
      return res.status(400).json({ error: "Aucun prompt fourni." });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "GEMINI_API_KEY manquant dans Vercel."
      });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateImage?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: { text: prompt },
          imageConfig: {
            resolution: resolution || "1024x1024"
          }
        })
      }
    );

    const data = await response.json();

    // Gemini renvoie : data.images[0].data
    if (!data.images || !data.images[0] || !data.images[0].data) {
      return res.status(500).json({
        error: "Erreur API Gemini",
        details: data
      });
    }

    return res.status(200).json({
      image: data.images[0].data
    });

  } catch (err) {
    return res.status(500).json({
      error: "Erreur serveur",
      details: err.toString()
    });
  }
}
