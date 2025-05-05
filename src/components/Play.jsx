// src/components/Play.jsx
import { useEffect, useState } from "react";
import { fetchTriviaQuestion } from "../utils/geminiApi";
import StadiumMap from "./StadiumMap";
import "./Play.css";
import { Link } from "react-router-dom";

/* ---------- helpers ---------- */
const getBadgeDescription = (b) =>
  b === "🔥 3-Correct Streak!"
    ? "Earned for 3 correct answers in a row."
    : b === "🏅 5-Correct Streak!"
    ? "Earned for 5 correct answers in a row."
    : "Achievement unlocked!";

const getDifficultyLabel = (s) =>
  s === 0 ? "🟢 Easy" : s > 5 ? "🔴 Hard" : "🟡 Medium";

/* ============================== component ============================== */
export default function Play() {
  /* ---------- state ---------- */
  const leagues = [
    "Premier League",
    "Bundesliga",
    "La Liga",
    "Serie A",
    "Belgian Pro League",
  ];
  const TIMER = 15;

  const [selectedLeague, setSelectedLeague] = useState("Premier League");
  const [selectedTeam, setSelectedTeam] = useState("football");

  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState([]);
  const [answer, setAnswer] = useState("");
  const [explanation, setExplanation] = useState("");
  const [selected, setSelected] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [score, setScore] = useState(() => +localStorage.getItem("score") || 0);
  const [streak, setStreak] = useState(
    () => +localStorage.getItem("streak") || 0
  );
  const [badge, setBadge] = useState(() => localStorage.getItem("badge") || "");

  const [playerName, setPlayerName] = useState(
    () => localStorage.getItem("playerName") || ""
  );
  const [badgeHistory, setBadgeHistory] = useState(() => {
    const json = localStorage.getItem("badgeHistory");
    return json ? JSON.parse(json) : [];
  });
  const [funFacts, setFunFacts] = useState(() => {
    const json = localStorage.getItem("funFacts");
    return json ? JSON.parse(json) : [];
  });

  /* ---------- timer ---------- */
  const [timeLeft, setTimeLeft] = useState(TIMER);
  const [timerActive, setTimerActive] = useState(false);
  const [lastAnswerTime, setLastAnswerTime] = useState(null);

  useEffect(() => {
    if (!timerActive) return;
    if (timeLeft === 0) {
      setTimerActive(false);
      setError("⏳ Time’s up!");
      setStreak(0);
      setBadge("");
      return;
    }
    const id = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [timerActive, timeLeft]);

  /* ---------- question generation ---------- */
  const generateQuestion = async (team = selectedTeam) => {
    setLoading(true);
    setError("");

    const diffPrompt =
      streak === 0
        ? "a simple football trivia question suitable for beginners"
        : streak > 5
        ? "a challenging football trivia question suitable for experts"
        : "a football trivia question";

    const speedPrompt =
      lastAnswerTime == null
        ? ""
        : lastAnswerTime < 5
        ? "and answered very quickly"
        : "and took a bit longer";

    const prompt = `Generate ${diffPrompt} about a ${selectedLeague} team (${team}) ${speedPrompt} with 1 correct answer and 3 incorrect options. Format it as:
Question: <question text>
A. <option A>
B. <option B>
C. <option C>
D. <option D>
Answer: <correct letter>
Explanation: <one-sentence explanation or fun fact related to the answer>`;

    try {
      const key = import.meta.env.VITE_GEMINI_API_KEY;
      const res = await fetchTriviaQuestion(prompt, key);

      setQuestion(res.question);
      setOptions(res.options);
      setAnswer(res.answer);
      setExplanation(res.explanation);
      setSelected("");

      if (res.explanation) setFunFacts((f) => [...f, res.explanation]);

      setTimeLeft(TIMER);
      setLastAnswerTime(null);
      setTimerActive(true);
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  /* ---------- first load ---------- */
  useEffect(() => {
    generateQuestion();
  }, []);

  /* ---------- persist ---------- */
  useEffect(() => {
    localStorage.setItem("score", score);
    localStorage.setItem("streak", streak);
    localStorage.setItem("badge", badge);
    localStorage.setItem("badgeHistory", JSON.stringify(badgeHistory));
    localStorage.setItem("funFacts", JSON.stringify(funFacts));
    if (playerName) localStorage.setItem("playerName", playerName);
  }, [score, streak, badge, badgeHistory, funFacts, playerName]);

  /* -------------------------------------------------------------------- */
  return (
    <main className="play-container">
      {/* ---------- quick settings ---------- */}
      <div className="play-top">
        <div className="play-field">
          <label htmlFor="playerName" className="play-label">
            Name:
          </label>
          <input
            id="playerName"
            className="play-input"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
          />
        </div>

        <div className="play-field">
          <label htmlFor="league" className="play-label">
            League:
          </label>
          <select
            id="league"
            className="play-input"
            value={selectedLeague}
            onChange={(e) => setSelectedLeague(e.target.value)}
          >
            {leagues.map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>
        </div>

        <div className="play-field">
          <label className="play-label">Team:</label>
          <span className="play-value">{selectedTeam}</span>
        </div>

        <div className="play-field">
          <label className="play-label">Timer:</label>
          <span
            className="play-value"
            style={{ color: timeLeft <= 5 ? "#d33" : "#222" }}
          >
            ⏱️ {timeLeft}s
          </span>
        </div>
      </div>

      {/* ---------- main content ---------- */}
      <div className="play-content">
        {/* left column */}
        <div className="play-card-wrapper">
          <div className="play-card">
            {loading ? (
              <p className="play-loading">Loading question…</p>
            ) : error ? (
              <p className="play-error">{error}</p>
            ) : (
              <>
                <p>
                  <strong>Score:</strong> {score} &nbsp;|&nbsp;{" "}
                  <strong>Streak:</strong> {streak}
                </p>
                <p>
                  <strong>Difficulty:</strong> {getDifficultyLabel(streak)}
                </p>

                {badge && !badgeHistory.includes(badge) && (
                  <div className="badge pop-in">{badge}</div>
                )}

                {badgeHistory.length > 0 && (
                  <div className="play-badge-wall">
                    {badgeHistory.map((b, i) => (
                      <span
                        key={i}
                        className={`badge ${b === badge ? "badge-bounce" : ""}`}
                        title={getBadgeDescription(b)}
                      >
                        {b}
                      </span>
                    ))}
                  </div>
                )}

                <p className="fade-in play-question">{question}</p>

                {options.map((opt) => (
                  <button
                    key={opt.label}
                    className="play-button"
                    disabled={!timerActive && selected === ""}
                    style={{
                      opacity: !timerActive && selected === "" ? 0.5 : 1,
                      background:
                        selected === opt.label
                          ? opt.label === answer
                            ? "#4CAF50"
                            : "#F44336"
                          : "#1a1a1a",
                    }}
                    onClick={() => {
                      if (timerActive) {
                        setLastAnswerTime(TIMER - timeLeft);
                        setTimerActive(false);
                      }
                      setSelected(opt.label);

                      if (opt.label === answer) {
                        let pts = 1;
                        if (lastAnswerTime != null && lastAnswerTime < 5) pts++;
                        setScore((s) => s + pts);

                        setStreak((prev) => {
                          const next = prev + 1;
                          const newBadge =
                            next === 3
                              ? "🔥 3-Correct Streak!"
                              : next === 5
                              ? "🏅 5-Correct Streak!"
                              : "";
                          if (newBadge && !badgeHistory.includes(newBadge)) {
                            setBadge(newBadge);
                            setBadgeHistory((h) => [...h, newBadge]);
                          }
                          return next;
                        });
                      } else {
                        setStreak(0);
                        setBadge("");
                      }
                    }}
                  >
                    {opt.label}. {opt.text}
                  </button>
                ))}

                {selected === answer &&
                  lastAnswerTime != null &&
                  lastAnswerTime < 5 && (
                    <p className="play-bonus">⚡ Speed bonus: +1!</p>
                  )}

                {explanation && selected && (
                  <p className="play-explanation">💡 {explanation}</p>
                )}
              </>
            )}
          </div>

          {funFacts.length > 0 && (
            <section className="play-facts">
              <strong>🧠 Fun Facts:</strong>
              <ul>
                {funFacts.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </section>
          )}

          <div className="play-controls">
            <button onClick={() => generateQuestion()}>🔄 New Question</button>
            <button
              style={{ background: "#cc0000" }}
              onClick={() => {
                setScore(0);
                setStreak(0);
                setBadge("");
                setBadgeHistory([]);
                setFunFacts([]);
                localStorage.clear();
              }}
            >
              🔄 Reset
            </button>
            <button
              style={{ background: "#007bff" }}
              onClick={() => {
                const msg = `I'm playing a football trivia game! ⚽\nScore: ${score}, Streak: ${streak}\nTry it yourself!`;
                navigator.clipboard.writeText(msg);
                alert("Copied to clipboard! 🥳");
              }}
            >
              📤 Share
            </button>
          </div>
        </div>

        {/* right column */}
        <div className="play-map">
          {/* heading removed – StadiumMap already shows it */}
          <StadiumMap
            selectedLeague={selectedLeague}
            onSelectTeam={(team) => {
              setSelectedTeam(team);
              generateQuestion(team);
            }}
          />
        </div>
      </div>

      {/* footer */}
      <div className="play-footer">
        <Link to="/">
          <button>🏠 Back to Home</button>
        </Link>
      </div>
    </main>
  );
}
