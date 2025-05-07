// src/components/Leaderboard.jsx
import { useEffect, useState } from "react";
import socket from "../utils/liveSocket";
import { Link } from "react-router-dom";
import "./Play.css"; // uses your existing table styles

export default function Leaderboard() {
  const me = localStorage.getItem("playerName") || "Anonymous";
  const [board, setBoard] = useState([]);

  /* listen for live updates */
  useEffect(() => {
    function handle(list) {
      console.log("📊 LB update:", list);
      setBoard(list);
    }
    socket.on("leaderboard", handle);

    // on first mount ask the server for a fresh snapshot
    socket.emit("leaderboard?");

    return () => socket.off("leaderboard", handle);
  }, []);

  return (
    <main className="leaderboard-container">
      <h2>🏆 Live Leaderboard</h2>

      {board.length === 0 ? (
        <p style={{ textAlign: "center" }}>Waiting for first score…</p>
      ) : (
        <table className="leaderboard-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Player</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            {board.map((entry, i) => {
              let rowStyle = {};
              if (i === 0) rowStyle = { background: "#ffd700" }; // gold
              else if (i === 1) rowStyle = { background: "#c0c0c0" }; // silver
              else if (i === 2) rowStyle = { background: "#cd7f32" }; // bronze
              else if (entry.name === me)
                rowStyle = { background: "#ffe600", fontWeight: "bold" };

              return (
                <tr key={entry.name} style={rowStyle}>
                  <td>{i + 1}</td>
                  <td>{entry.name}</td>
                  <td>{entry.score}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      <div className="play-footer">
        <Link to="/" className="play-footer-link">
          <button>🏠 Back</button>
        </Link>
        <Link to="/play" className="play-footer-link">
          <button>🎮 Play</button>
        </Link>
      </div>
    </main>
  );
}
