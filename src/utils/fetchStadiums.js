const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

/**
 * Fetch a list of stadiums dynamically for the selected league using Gemini
 * @param {string} league - e.g., "Premier League"
 * @param {string} apiKey - your Gemini API key
 * @returns {Promise<Array>} - parsed array of stadium objects
 */
export async function fetchStadiumsForLeague(league, apiKey) {
  const prompt = `Generate 5 famous football stadiums in the ${league}. For each, return:
- team name
- stadium name
- league
- country
- latitude
- longitude
- logo URL

Return the result as a JSON array.`;

  const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
    }),
  });

  const data = await res.json();

  let raw = data.candidates?.[0]?.content?.parts?.[0]?.text || "[]";

  if (raw.startsWith("```json")) {
    raw = raw
      .replace(/^```json/, "")
      .replace(/```$/, "")
      .trim();
  }

  try {
    const json = JSON.parse(raw);
    return Array.isArray(json) ? json : [];
  } catch (err) {
    console.error("❌ Failed to parse Gemini response as JSON:\n", raw);
    return [];
  }
}
