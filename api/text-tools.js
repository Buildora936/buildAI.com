// /api/text-tools.js

import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  try {
    const { text, tool, lang } = req.body;

    if (!text || !tool) {
      return res.status(400).json({ error: "Texte ou outil manquant." });
    }

    const apiKey = process.env.GEMINI_API_KEY || "AIzaSyADvMM0q_NpMRAbc8YaoeLn_iGSwPF0C3E";
    const genAI = new GoogleGenerativeAI(apiKey);

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // --- PROMPTS PAR OUTIL ---
    const prompts = {
      correct: `Corrige et améliore ce texte en français, sans changer le sens :\n\n${text}`,
      
      resume: `Résume ce texte de manière claire et courte :\n\n${text}`,
      
      traduction: `Traduis ce texte en ${lang} :\n\n${text}`,
      
      generate: `Génère un paragraphe cohérent en continuant ce texte :\n\n${text}`,
      
      transcription: `Interprète ce texte comme une transcription audio et reformule proprement :\n\n${text}`,

      description: `Décris clairement ce contenu pour quelqu'un qui ne peut pas le voir :\n\n${text}`,

      bio: `Rédige une biographie courte et professionnelle basé sur ces informations :\n\n${text}`,

      chatbot: `Tu es un assistant utile. Réponds clairement à ce message :\n\n${text}`
    };

    const prompt = prompts[tool];

    const result = await model.generateContent(prompt);
    const response = await result.response.text();

    res.status(200).json({ output: response });

  } catch (err) {
    console.error("Erreur API Gemini :", err);
    res.status(500).json({ error: "Erreur serveur (Gemini)." });
  }
}
