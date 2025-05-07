// src/App.jsx (or wherever your main route component lives)
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function App() {
  const navigate = useNavigate();

  /** load any name we might have stored from a prior visit */
  const [name, setName] = useState(localStorage.getItem("playerName") || "");

  const handleStart = () => {
    if (!name.trim()) return; // shouldn’t happen, button disabled
    localStorage.setItem("playerName", name.trim());
    navigate("/play"); // go to the trivia screen
  };

  return (
    <main style={styles.wrap}>
      <h1 style={styles.h1}>⚽ AI‑Powered Football Trivia</h1>

      <label style={styles.label}>
        Enter your name to join the live leaderboard:
        <input
          style={styles.input}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
        />
      </label>

      <button
        style={{
          ...styles.playBtn,
          background: name.trim() ? "#1a73e8" : "#9ea9b7",
          cursor: name.trim() ? "pointer" : "not-allowed",
        }}
        disabled={!name.trim()}
        onClick={handleStart}
      >
        ▶ Play
      </button>

      <Link to="/leaderboard" style={{ textDecoration: "none" }}>
        <button style={styles.lbBtn}>🏆 Leaderboard</button>
      </Link>
    </main>
  );
}

/* ---------- simple inline styles (replace with your CSS if preferred) ---------- */
const styles = {
  wrap: {
    maxWidth: 420,
    margin: "4rem auto",
    textAlign: "center",
    padding: "2rem",
    background: "#ffffff",
    borderRadius: 12,
    boxShadow: "0 4px 14px rgba(0,0,0,.06)",
  },
  h1: { marginBottom: "2rem" },
  label: { display: "block", fontWeight: 600, marginBottom: "0.75rem" },
  input: {
    width: "100%",
    padding: "0.6rem 0.8rem",
    marginTop: "0.5rem",
    borderRadius: 8,
    border: "1px solid #ccc",
    fontSize: "1rem",
  },
  playBtn: {
    marginTop: "1.5rem",
    width: "100%",
    padding: "0.85rem 1rem",
    border: "none",
    borderRadius: 8,
    color: "#fff",
    fontSize: "1.05rem",
    transition: "background 0.2s ease",
  },
  lbBtn: {
    marginTop: "1rem",
    width: "100%",
    padding: "0.75rem 1rem",
    border: "none",
    borderRadius: 8,
    background: "#333",
    color: "#fff",
    fontSize: "1rem",
    transition: "background 0.2s ease",
  },
};
