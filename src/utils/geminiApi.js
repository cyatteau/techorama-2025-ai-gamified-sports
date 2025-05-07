// src/utils/geminiApi.js
// More robust Gemini parser – tolerates “Correct answer:”, extra spaces, code‑fences, etc.

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

/**
 * Ask Gemini for one multiple‑choice question and parse it safely.
 * Returns: { question, options:[{label,text}], answer:String, explanation:String }
 */
export async function fetchTriviaQuestion(prompt, apiKey) {
  try {
    const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    // raw Gemini text (may include ``` fences, mixed casing, etc.)
    let raw =
      (await res.json()).candidates?.[0]?.content?.parts?.[0]?.text || "";

    // strip ``` blocks if present and normalise newlines
    raw = raw
      .replace(/^```[\s\S]*?\n/, "")
      .replace(/```$/, "")
      .trim();

    /* ---------- regex parsing ---------- */
    const qMatch = raw.match(/Question:\s*([\s\S]*?)\n/i);
    const question = qMatch ? qMatch[1].trim() : "??";

    // match lines “A. …”, “B) …”, case‑insensitive
    const optionRE = /^[A-Da-d][.)]\s*(.+)$/gm;
    const options = [];
    let m;
    while ((m = optionRE.exec(raw))) {
      options.push({ label: m[0][0].toUpperCase(), text: m[1].trim() });
    }

    const ansMatch = raw.match(/(?:Answer|Correct answer)[:\s]*([A-Da-d])/i);
    const answer = ansMatch ? ansMatch[1].toUpperCase() : options[0]?.label; // fallback to first

    const explMatch = raw.match(/Explanation:\s*([\s\S]+)/i);
    const explanation = explMatch ? explMatch[1].trim() : "";

    return { question, options, answer, explanation };
  } catch (err) {
    console.error("Gemini fetch/parse failed:", err);
    return { question: "Error fetching trivia.", options: [], answer: "" };
  }
}
