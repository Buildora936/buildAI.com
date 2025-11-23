export default async function handler(req) {
  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
    }

    const { prompt } = await req.json();

    if (!prompt) {
      return new Response(JSON.stringify({ error: "Missing prompt" }), { status: 400 });
    }

    const API_KEY = process.env.GEMINI_API_KEY;

    if (!API_KEY) {
      return new Response(JSON.stringify({ error: "Missing GEMINI_API_KEY" }), { status: 500 });
    }

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateImage?key=" + API_KEY,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: { text: prompt }
        })
      }
    );

    const data = await response.json();
    console.log("Gemini response:", data);

    // Extraction correcte du Base64
    const base64 =
      data?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!base64) {
      return new Response(JSON.stringify({ error: "Invalid Gemini response", details: data }), { status: 500 });
    }

    return new Response(JSON.stringify({ image: base64 }), { status: 200 });

  } catch (err) {
    console.error("API ERROR:", err);
    return new Response(JSON.stringify({ error: "Server error", details: err.message }), { status: 500 });
  }
}
