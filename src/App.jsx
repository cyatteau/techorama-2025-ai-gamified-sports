import { Link } from "react-router-dom";

function App() {
  return (
    <main style={{ padding: "2rem", textAlign: "center" }}>
      <h1>Welcome to Football Trivia</h1>
      <p>Choose where to start:</p>
      <Link to="/play">
        <button style={{ margin: "0.5rem" }}>🎮 Play</button>
      </Link>
      <Link to="/leaderboard">
        <button style={{ margin: "0.5rem" }}>🏆 Leaderboard</button>
      </Link>
    </main>
  );
}

export default App;