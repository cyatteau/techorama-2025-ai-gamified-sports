const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

export async function fetchTriviaQuestion(prompt, apiKey) {
  try {
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

    const text = await res
      .json()
      .then((d) => d.candidates?.[0]?.content?.parts?.[0]?.text || "");

    const lines = text.split("\n").map((l) => l.trim());
    const question = lines
      .find((l) => l.startsWith("Question:"))
      ?.replace("Question:", "")
      .trim();
    const options = lines
      .filter((l) => /^[A-D]\./.test(l))
      .map((l) => ({ label: l[0], text: l.slice(3).trim() }));
    const answer = lines
      .find((l) => l.startsWith("Answer:"))
      ?.split(":")[1]
      ?.trim();

    return { question, options, answer };
  } catch (err) {
    console.error("Gemini fetch failed:", err);
    return { question: "Error fetching trivia.", options: [], answer: "" };
  }
}
