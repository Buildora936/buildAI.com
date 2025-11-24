// api/text-tools.js
// Vercel Serverless (Node.js) — backend pour text-tools via Gemini
// Attends POST JSON (sauf transcribe => FormData). Retourne JSON { result: "..." }

export default async function handler(req, res) {
  try {
    // Only POST (except we can respond to GET health)
    if (req.method === "GET") {
      return res.status(200).json({ status: "ok", note: "POST JSON to use text tools" });
    }
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) {
      return res.status(500).json({ error: "Missing GEMINI_API_KEY in environment" });
    }

    // If request is form-data (transcribe), handle below (we don't implement STT here).
    const contentType = req.headers["content-type"] || "";
    if (contentType.includes("multipart/form-data")) {
      // We don't handle transcription server-side here (needs a speech-to-text provider).
      return res.status(400).json({
        error: "Transcription not implemented on this endpoint. Use a Speech-to-Text provider (Google Speech-to-Text, AssemblyAI, Whisper) and then send the text to this endpoint."
      });
    }

    const body = req.body || {};
    const mode = (body.mode || "generate").toString();
    const text = (body.text || body.prompt || "").toString();
    const lang = body.lang || "fr";
    const target = body.target || "fr";
    const tone = body.tone || "";
    const messages = body.messages || null; // for chat

    if (!text && mode !== "chat") {
      return res.status(400).json({ error: "Missing text/prompt" });
    }

    // Build a prompt based on mode
    function buildPrompt(mode, text) {
      switch (mode) {
        case "improve":
          return `Améliore la qualité, la clarté et le style du texte suivant en conservant le sens. Conserve la longueur approximative.\n\nTexte:\n${text}`;
        case "summarize":
          return `Résume le texte suivant en 3-4 lignes (langue: ${lang}).\n\nTexte:\n${text}`;
        case "translate":
          return `Traduis le texte suivant vers ${target} sans ajouter d'explications.\n\nTexte:\n${text}`;
        case "description":
          return `Rédige une description produit persuasive, courte et orientée conversion pour: ${text}`;
        case "bio":
          return `Rédige 3 variantes de biographie Instagram (max 150 caractères chacune) pour: ${text}`;
        case "rewrite":
          return `Réécris le texte suivant de manière plus claire, professionnelle et naturelle:\n\n${text}`;
        case "generate":
          return `Génère un texte original (ton: ${tone || "neutre"}), centré sur: ${text}. Fournis 3 variantes courtes.`;
        case "description":
          return `Rédige une description produit persuasive et courte pour: ${text}`;
        default:
          return text;
      }
    }

    // If mode is chat, construct a single prompt from messages
    let finalPrompt = "";
    if (mode === "chat") {
      // messages is expected to be an array [{role:'user'|'assistant'|'system', content:'...'}, ...]
      if (!Array.isArray(messages)) {
        return res.status(400).json({ error: "Chat mode requires messages array" });
      }
      // Build context for Gemini: join messages, put system first
      finalPrompt = messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join("\n\n");
    } else {
      finalPrompt = buildPrompt(mode, text);
    }

    // Call Gemini generateContent endpoint
    const geminiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5:generateContent?key=" + API_KEY;
    // Note: some projects use generateText or generateContent; this uses generateContent compatible structure.

    const payload = {
      // request-level options
      // temperature, max output tokens, safety settings can be adjusted
      temperature: 0.2,
      candidateCount: 1,
      // contents: array of messages or a single content
      contents: [
        { parts: [{ text: finalPrompt }] }
      ]
    };

    const r = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      // Note: do not include the API key in code; we use env var above
    });

    if (!r.ok) {
      const textErr = await r.text().catch(()=>null);
      return res.status(502).json({ error: "Generator error", status: r.status, details: textErr });
    }

    const data = await r.json();

    // Gemini responses vary; we try to extract text robustly
    const output =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      data?.candidates?.[0]?.output?.[0]?.content?.[0]?.text ||
      data?.outputs?.[0]?.content?.[0]?.text ||
      null;

    if (!output) {
      return res.status(500).json({ error: "No output from Gemini", details: data });
    }

    // Return result
    return res.status(200).json({ result: output });

  } catch (err) {
    console.error("TEXT-TOOLS ERROR:", err);
    return res.status(500).json({ error: "Server error", details: String(err) });
  }
}
