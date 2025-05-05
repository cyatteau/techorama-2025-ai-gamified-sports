import { Link } from "react-router-dom";

export default function Leaderboard() {
  const userScore = Number(localStorage.getItem("score")) || 0;
  const userName = localStorage.getItem("playerName") || "You";

  const mockScores = [
    { name: "Alex", score: 12 },
    { name: "Taylor", score: 10 },
    { name: "Jordan", score: 9 },
    { name: "Casey", score: 7 },
    { name: userName, score: userScore },
  ].sort((a, b) => b.score - a.score);

  return (
    <main style={styles.container}>
      <h2>🏆 Leaderboard</h2>
      <table style={styles.table}>
        <thead>
          <tr>
            <th>Rank</th>
            <th>Player</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          {mockScores.map((entry, i) => (
            <tr
              key={entry.name + entry.score}
              style={entry.name === userName ? styles.highlight : {}}
            >
              <td>{i + 1}</td>
              <td>{entry.name}</td>
              <td>{entry.score}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Link to="/" style={{ textDecoration: "none" }}>
        <button style={{ ...styles.button, marginTop: "2rem" }}>
          🏠 Back to Home
        </button>
      </Link>
    </main>
  );
}

const styles = {
  container: {
    padding: "2rem",
    maxWidth: "600px",
    margin: "0 auto",
    textAlign: "center",
  },
  table: {
    width: "100%",
    marginTop: "1rem",
    borderCollapse: "collapse",
    fontSize: "1.1rem",
  },
  highlight: {
    backgroundColor: "#ffe600",
    fontWeight: "bold",
  },
  button: {
    fontSize: "1rem",
    padding: "0.75rem 1.5rem",
    borderRadius: "8px",
    backgroundColor: "#1a1a1a",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
};
