export default async function handler(req, res) {
  // Autoriser Vercel à accepter JSON
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  try {
    const { prompt } = req.body;

    // Vérification du prompt
    if (!prompt || prompt.trim() === "") {
      return res.status(400).json({ error: "Veuillez fournir un prompt." });
    }

    // Clé API stockée dans Vercel (NE PAS mettre dans le code)
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "GEMINI_API_KEY est manquant dans Vercel."
      });
    }

    // Appel API Gemini
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateImage?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          prompt: { text: prompt }
        })
      }
    );

    const data = await response.json();

    // Vérification du résultat
    if (!data.image || !data.image.base64) {
      return res.status(500).json({
        error: "Erreur API Gemini",
        details: data
      });
    }

    // Envoi de l’image en base64
    return res.status(200).json({
      url: `data:image/png;base64,${data.image.base64}`
    });

  } catch (err) {
    return res.status(500).json({
      error: "Erreur serveur",
      details: err.toString()
    });
  }
}
