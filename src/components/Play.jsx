// src/components/Play.jsx
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import socket from "../utils/liveSocket";
import { fetchTriviaQuestion } from "../utils/geminiApi";
import StadiumMap from "./StadiumMap";
import "./Play.css";

const TIMER = 15;
const LEAGUES = [
  "Premier League",
  "Bundesliga",
  "La Liga",
  "Serie A",
  "Belgian Pro League",
];
const badgeTxt = (b) =>
  b === "🔥 3-Correct Streak!"
    ? "Earned for 3 in a row"
    : "🏅 5‑Correct Streak!";

export default function Play() {
  /* ── persisted state ── */
  const playerName = localStorage.getItem("playerName") || "Anonymous";
  const [inGame, setInGame] = useState(
    () => localStorage.getItem("inGame") === "true"
  );
  const [league, setLeague] = useState(
    () => localStorage.getItem("league") || "Premier League"
  );
  const [team, setTeam] = useState(() => localStorage.getItem("team") || "");

  const [score, setScore] = useState(() => +localStorage.getItem("score") || 0);
  const [streak, setStreak] = useState(
    () => +localStorage.getItem("streak") || 0
  );
  const [badges, setBadges] = useState(() =>
    JSON.parse(localStorage.getItem("badgeHistory") || "[]")
  );

  /* ── volatile ── */
  const [question, setQ] = useState("");
  const [options, setOpt] = useState([]);
  const [answer, setAns] = useState("");
  const [explanation, setEx] = useState("");
  const [sel, setSel] = useState("");
  const [funFact, setFF] = useState("");
  const [loading, setLoad] = useState(false);
  const [error, setErr] = useState("");
  const [asked, setAsked] = useState(new Set());

  const [tLeft, setTL] = useState(TIMER);
  const [running, setRun] = useState(false);
  const [lastT, setLastT] = useState(null);
  const [justEarned, setJE] = useState(null);

  /* ── save to localStorage ── */
  useEffect(() => {
    localStorage.setItem("inGame", inGame);
    localStorage.setItem("league", league);
    localStorage.setItem("team", team);
    localStorage.setItem("score", score.toString());
    localStorage.setItem("streak", streak.toString());
    localStorage.setItem("badgeHistory", JSON.stringify(badges));
    if (funFact) localStorage.setItem("funFacts", JSON.stringify([funFact]));
  }, [inGame, league, team, score, streak, badges, funFact]);

  /* ── socket join once ── */
  const joined = useRef(false);
  useEffect(() => {
    if (!joined.current) {
      socket.emit("join", playerName);
      joined.current = true;
    }
  }, [playerName]);

  /* ── timer tick ── */
  useEffect(() => {
    if (!running) return;
    if (tLeft === 0) {
      setRun(false);
      setErr("⏳ Time’s up!");
      setStreak(0);
      return;
    }
    const id = setInterval(() => setTL((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [running, tLeft]);

  /* ── fetch question ── */
  async function fetchQuestion(teamSel = team, attempt = 1) {
    if (attempt > 4) {
      setErr("Couldn’t fetch a unique question.");
      return;
    }
    setLoad(true);
    setErr("");
    setSel("");
    setFF("");
    setJE(null);

    const diff = streak === 0 ? "an easy" : streak > 5 ? "a hard" : "a medium";
    const speed = lastT == null ? "" : lastT < 5 ? " quickly" : " a bit slowly";
    const prompt = `Generate ${diff} football trivia question about ${teamSel} answered${speed}.
Question: …
A. …
B. …
C. …
D. …
Answer: <letter>
Explanation: …`;

    try {
      const { question, options, answer, explanation } =
        await fetchTriviaQuestion(prompt, import.meta.env.VITE_GEMINI_API_KEY);

      if (asked.has(question)) return fetchQuestion(teamSel, attempt + 1);
      setAsked((p) => new Set(p).add(question));

      setQ(question);
      setOpt(options);
      setAns(answer);
      setEx(explanation);
      setTL(TIMER);
      setLastT(null);
      setRun(true);
    } catch {
      setErr("Error fetching question.");
    } finally {
      setLoad(false);
    }
  }

  /* ── start | continue ── */
  const handleStart = () => {
    if (!team) {
      alert("Pick a stadium pin first!");
      return;
    }

    if (!inGame) {
      // brand‑new session
      setScore(0);
      setStreak(0);
      setBadges([]);
      setAsked(new Set());
    }
    setInGame(true);
    fetchQuestion();
  };

  /* ── answer click ── */
  const handleAnswer = (opt) => {
    if (running) {
      setLastT(TIMER - tLeft);
      setRun(false);
    }
    if (sel) return;
    setSel(opt.label);

    let pts = 0;
    if (opt.label === answer) {
      pts = 1 + (lastT != null && lastT < 5 ? 1 : 0);
      setScore((s) => s + pts);
      if (explanation) setFF(explanation);

      setStreak((p) => {
        const n = p + 1;
        const b =
          n === 3
            ? "🔥 3-Correct Streak!"
            : n === 5
            ? "🏅 5-Correct Streak!"
            : null;
        if (b && !badges.includes(b)) {
          setBadges((bs) => [...bs, b]);
          setJE(b);
        }
        return n;
      });
    } else setStreak(0);

    socket.emit("score", { name: playerName, points: pts });
  };

  /* ── reset ── */
  const reset = () => {
    setInGame(false);
    setScore(0);
    setStreak(0);
    setBadges([]);
    setAsked(new Set());
    setSel("");
    setQ("");
    setFF("");
    setJE(null);
    socket.emit("reset", playerName);
  };

  /* ── UI ── */
  return (
    <main className="play-container">
      <div className="play-top">
        <div className="play-field">
          <label className="play-label">League</label>
          <select
            className="play-input"
            value={league}
            onChange={(e) => setLeague(e.target.value)}
          >
            {LEAGUES.map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>
        </div>

        <div className="play-field">
          <label className="play-label">Team</label>
          <span className="play-value">
            {team || <em className="muted">pick on map</em>}
          </span>
        </div>

        <div className="play-field">
          <label className="play-label">Timer</label>
          <span
            className="play-value"
            style={{ color: inGame && tLeft <= 5 ? "#d33" : undefined }}
          >
            ⏱️ {inGame ? `${tLeft}s` : "—"}
          </span>
        </div>

        {!running && (
          <div className="start-wrap">
            <button
              className="play-button"
              style={{ background: team ? "#1a73e8" : "#9ea9b7" }}
              disabled={!team}
              onClick={handleStart}
            >
              ▶ {inGame ? "Continue Game" : "Start Game"}
            </button>
          </div>
        )}
      </div>

      <div className="play-content">
        <div className="play-card-wrapper">
          <div className="play-card">
            {!inGame ? (
              <div className="info-box">
                <p>Select a league & team, then start!</p>
              </div>
            ) : loading ? (
              <p className="play-loading">Loading…</p>
            ) : error ? (
              <p className="play-error">{error}</p>
            ) : (
              <>
                <p>
                  <strong>Score:</strong> {score} &nbsp;|&nbsp;{" "}
                  <strong>Streak:</strong> {streak}
                </p>
                <p>
                  <strong>Difficulty:</strong>{" "}
                  {streak === 0
                    ? "🟢 Easy"
                    : streak > 5
                    ? "🔴 Hard"
                    : "🟡 Medium"}
                </p>

                {justEarned && <div className="badge pop-in">{justEarned}</div>}
                {!!badges.length && (
                  <div className="play-badge-wall">
                    {[...new Set(badges)]
                      .filter((b) => b !== justEarned)
                      .map((b) => (
                        <span key={b} className="badge" title={badgeTxt(b)}>
                          {b}
                        </span>
                      ))}
                  </div>
                )}

                <p className="fade-in play-question">{question}</p>
                {options.map((opt) => (
                  <button
                    key={opt.label}
                    disabled={!!sel}
                    className={
                      "play-button" +
                      (sel === opt.label
                        ? opt.label === answer
                          ? " correct"
                          : " wrong"
                        : "")
                    }
                    onClick={() => handleAnswer(opt)}
                  >
                    {opt.label}. {opt.text}
                  </button>
                ))}

                {sel === answer && lastT < 5 && (
                  <p className="play-bonus">⚡ Speed bonus: +1!</p>
                )}
                {explanation && sel && (
                  <p className="play-explanation">💡 {explanation}</p>
                )}
              </>
            )}
          </div>

          {funFact && inGame && (
            <section className="play-facts">
              <strong>🧠 Fun Fact</strong>
              <p>{funFact}</p>
            </section>
          )}

          <div className="play-controls">
            <button onClick={() => fetchQuestion()} disabled={!inGame}>
              🔄 New Question
            </button>
            <button
              onClick={reset}
              disabled={!inGame}
              style={{ background: "#cc0000" }}
            >
              🔄 Reset
            </button>
            <button
              style={{ background: "#333" }}
              onClick={() => {
                navigator.clipboard.writeText(
                  `⚽ Trivia – Score ${score}, Streak ${streak}`
                );
                alert("Copied!");
              }}
            >
              📤 Share
            </button>
          </div>
        </div>

        <div className="play-map">
          <StadiumMap
            selectedLeague={league}
            onSelectTeam={(t) => {
              setTeam(t);
              if (inGame) fetchQuestion(t);
            }}
          />
        </div>
      </div>

      <div className="play-footer">
        <Link to="/" className="play-footer-link">
          <button>🏠 Home</button>
        </Link>
        <Link to="/leaderboard" className="play-footer-link">
          <button>🏆 Leaderboard</button>
        </Link>
      </div>
    </main>
  );
}
