export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Missing prompt" });
    }

    const API_KEY = process.env.GEMINI_API_KEY;

    if (!API_KEY) {
      return res.status(500).json({ error: "Missing GEMINI_API_KEY" });
    }

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateImage?key=" + API_KEY,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: { text: prompt }
        })
      }
    );

    const data = await response.json();

    if (!data.image || !data.image.base64) {
      return res.status(500).json({ error: "Invalid Gemini response", details: data });
    }

    res.status(200).json({
      image: data.image.base64
    });

  } catch (err) {
    console.error("API ERROR:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
}
