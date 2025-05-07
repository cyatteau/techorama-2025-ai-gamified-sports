# ⚽ AI-Powered Football Trivia

A **React + Vite** web app that turns sports trivia into a real-time, audience-playable game.  
Built for the **“AI-Powered Gamification for Sports Apps”** talk (Techorama 2025).

---

## ✨ Features at a Glance

| Area                   | What you’ll see                                                     |
|------------------------|---------------------------------------------------------------------|
| **AI-generated Questions** | Google Gemini 1.5 Flash creates unique Q&As on demand.         |
| **Adaptive Difficulty**    | Questions get harder as your streak grows.                      |
| **Gamification**           | Score, streak, speed-answer bonus, badges for 3 & 5 correct.     |
| **Live Multiplayer**       | Node + Socket.IO broadcasts a leaderboard in real time.         |
| **Map Selector**           | Pick your club by clicking its stadium pin (Esri Leaflet).      |
| **Persist & Continue**     | Leave *Play*, browse the leaderboard, resume with **Continue Game**. |
| **One-click Share**        | Copy your score to clipboard to challenge friends.             |

---

## 🗂 Project Structure
<pre><code>
server/                  Node + Socket.IO live server

src/
 ├─ components/
 │   ├─ Play.jsx         main game screen
 |   ├─ Play.css         main screen styling
 │   ├─ Leaderboard.jsx  real-time leaderboard
 │   └─ StadiumMap.jsx   clickable Esri Leaflet map
 ├─ utils/               helpers (Gemini API, socket client)
 ├─ App.jsx, main.jsx    Vite entry
 ├─ index.css            root page styling
 └─ index.html           root page
</code></pre>

---

## 🚀 Getting Started

### 1 · Clone & Install

```bash
git clone https://github.com/your-handle/ai-football-trivia.git
cd ai-football-trivia
npm install
```

### 2 · Environment Variables

Create a **<code>.env</code>** file in the project root with:

<pre><code>
VITE_GEMINI_API_KEY=YOUR_GEMINI_KEY
VITE_ARCGIS_API_KEY=YOUR_ARCGIS_KEY
</code></pre>

### 3 · Run the Live Server

```bash
node server/server.js
```

> **Tip:** Expose via ngrok for a remote demo:
> ```bash
> npx ngrok http 4000
> ```

### 4 · Start the React Client

```bash
npm run dev
```

Open your browser at <code>http://localhost:5173</code> (or your ngrok URL) in multiple tabs/devices, play a round, and watch the **Leaderboard** update in real time!

---

## 🔧 Available Scripts

| Command                   | Description                                 |
|---------------------------|---------------------------------------------|
| <code>npm run dev</code>             | Launch Vite dev server with hot-reload      |
| <code>npm run build</code>           | Create production build in <code>dist/</code>          |
| <code>node server/server.js</code>   | Start Socket.IO server (port 4000 by default) |

---

## 🛠 Tech Stack

- **Frontend:** React 18, Vite  
- **Realtime:** Socket.IO 4  
- **AI:** Google Gemini 1.5-flash  
- **Map:** Esri Leaflet
- **Tunneling:** ngrok for remote demos  

---

## 📝 License

MIT © Courtney Yatteau

Built with ☕ and ⚛️.
PRs and ⭐ welcome!