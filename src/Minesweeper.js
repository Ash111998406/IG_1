import React, { useEffect, useMemo, useState } from "react";

// Difficulty configurations
const DIFFICULTIES = {
  easy: { rows: 8, cols: 8, bombs: 10, name: "Easy", emoji: "😊", color: "#34d399" },
  medium: { rows: 10, cols: 10, bombs: 20, name: "Medium", emoji: "😐", color: "#fbbf24" },
  hard: { rows: 12, cols: 12, bombs: 35, name: "Hard", emoji: "😈", color: "#ef4444" }
};

const HS_KEY = "ms-best";

function neighbors(r, c, R, C) {
  const out = [];
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (!dr && !dc) continue;
      const rr = r + dr, cc = c + dc;
      if (rr >= 0 && rr < R && cc >= 0 && cc < C) out.push([rr, cc]);
    }
  }
  return out;
}

function genBoard(firstR, firstC, R, C, B) {
  const cells = Array.from({ length: R }, () =>
    Array.from({ length: C }, () => ({ m: false, n: 0, open: false, flag: false }))
  );
  
  // Place bombs (avoid first click)
  let placed = 0;
  while (placed < B) {
    const rr = Math.floor(Math.random() * R);
    const cc = Math.floor(Math.random() * C);
    if ((rr === firstR && cc === firstC) || cells[rr][cc].m) continue;
    cells[rr][cc].m = true;
    placed++;
  }
  
  // Calculate numbers
  for (let r = 0; r < R; r++) {
    for (let c = 0; c < C; c++) {
      if (cells[r][c].m) continue;
      cells[r][c].n = neighbors(r, c, R, C).reduce((s, [rr, cc]) => s + (cells[rr][cc].m ? 1 : 0), 0);
    }
  }
  return cells;
}

function floodOpen(cells, r, c, R, C) {
  const stack = [[r, c]];
  const seen = new Set();
  
  while (stack.length) {
    const [rr, cc] = stack.pop();
    const key = `${rr},${cc}`;
    if (seen.has(key)) continue;
    seen.add(key);
    
    const cell = cells[rr][cc];
    if (cell.open || cell.flag) continue;
    cell.open = true;
    
    if (!cell.m && cell.n === 0) {
      for (const [ar, ac] of neighbors(rr, cc, R, C)) {
        stack.push([ar, ac]);
      }
    }
  }
}

// Number colors for visual appeal
const NUMBER_COLORS = {
  1: "#3b82f6", // blue
  2: "#10b981", // green
  3: "#ef4444", // red
  4: "#8b5cf6", // purple
  5: "#f59e0b", // orange
  6: "#06b6d4", // cyan
  7: "#000000", // black
  8: "#6b7280"  // gray
};

export default function Minesweeper() {
  const [gameState, setGameState] = useState("menu"); // menu, difficulty, playing, paused
  const [difficulty, setDifficulty] = useState("medium");
  const [started, setStarted] = useState(false);
  const [cells, setCells] = useState([]);
  const [over, setOver] = useState(false);
  const [win, setWin] = useState(false);
  const [flags, setFlags] = useState(0);
  const [time, setTime] = useState(0);
  const [flagMode, setFlagMode] = useState(false);
  const [bestTimes, setBestTimes] = useState(() => {
    const stored = localStorage.getItem(HS_KEY);
    return stored ? JSON.parse(stored) : { easy: null, medium: null, hard: null };
  });

  const config = DIFFICULTIES[difficulty];
  const { rows: R, cols: C, bombs: B } = config;

  // Timer
  useEffect(() => {
    if (gameState !== "playing" || !started || over || win) return;
    const id = setInterval(() => setTime(t => t + 1), 1000);
    return () => clearInterval(id);
  }, [gameState, started, over, win]);

  // Save best time on win
  useEffect(() => {
    if (win && time > 0) {
      const currentBest = bestTimes[difficulty];
      if (!currentBest || time < currentBest) {
        const newBest = { ...bestTimes, [difficulty]: time };
        setBestTimes(newBest);
        localStorage.setItem(HS_KEY, JSON.stringify(newBest));
      }
    }
  }, [win, time, difficulty]);

  const showDifficultyScreen = () => {
    setGameState("difficulty");
  };

  const startGame = (selectedDifficulty) => {
    setDifficulty(selectedDifficulty);
    const cfg = DIFFICULTIES[selectedDifficulty];
    setStarted(false);
    setOver(false);
    setWin(false);
    setTime(0);
    setFlags(0);
    setFlagMode(false);
    setCells(
      Array.from({ length: cfg.rows }, () =>
        Array.from({ length: cfg.cols }, () => ({ m: false, n: 0, open: false, flag: false }))
      )
    );
    setGameState("playing");
  };

  const pauseGame = () => setGameState("paused");
  const resumeGame = () => setGameState("playing");
  const backToMenu = () => setGameState("menu");

  const openCell = (r, c) => {
    if (gameState !== "playing" || over || win) return;
    
    let next = cells.map(row => row.map(c => ({ ...c })));
    
    if (!started) {
      next = genBoard(r, c, R, C, B);
      setStarted(true);
    }
    
    const cell = next[r][c];
    if (cell.flag || cell.open) return;
    
    if (cell.m) {
      cell.open = true;
      setCells(next);
      setOver(true);
      return;
    }
    
    floodOpen(next, r, c, R, C);
    
    // Win check
    const allOpen = next.flat().filter(x => !x.m).every(x => x.open);
    setWin(allOpen);
    setCells(next);
  };

  const toggleFlag = (r, c) => {
    if (gameState !== "playing" || over || win) return;
    
    const next = cells.map(row => row.map(c => ({ ...c })));
    const cell = next[r][c];
    if (cell.open) return;
    
    cell.flag = !cell.flag;
    setFlags(f => f + (cell.flag ? 1 : -1));
    setCells(next);
  };

  const handleCellClick = (r, c) => {
    if (flagMode) {
      toggleFlag(r, c);
    } else {
      openCell(r, c);
    }
  };

  // Menu Screen
  if (gameState === "menu") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-6">
        <div className="flex flex-col items-center w-full max-w-xl">
          <div className="text-center mb-20 animate-bounce-slow">
            <h1 className="text-7xl md:text-8xl font-bold text-white mb-6" style={{ textShadow: "0 0 20px rgba(255,255,255,0.5)" }}>
              💣 Minesweeper
            </h1>
            <p className="text-3xl text-white/80 font-semibold">Clear the field!</p>
          </div>

          <div className="flex flex-col gap-8 w-full px-4">
            <button
              onClick={showDifficultyScreen}
              className="w-full py-8 px-10 text-4xl font-bold text-white transition-all transform active:scale-95"
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                boxShadow: "0 15px 40px rgba(102, 126, 234, 0.5)",
                borderRadius: "40px",
                minHeight: "90px",
                border: "2px solid rgba(255,255,255,0.2)"
              }}
            >
              ▶️ Start Game
            </button>

            <button
              onClick={() => window.location.reload()}
              className="w-full py-8 px-10 text-4xl font-bold text-white transition-all transform active:scale-95"
              style={{
                background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                boxShadow: "0 15px 40px rgba(245, 87, 108, 0.5)",
                borderRadius: "40px",
                minHeight: "90px",
                border: "2px solid rgba(255,255,255,0.2)"
              }}
            >
              🚪 Exit
            </button>
          </div>

          <div className="mt-20 text-white/60 text-center text-xl">
            <p className="mb-2">Find all the mines</p>
            <p>Use logic to win!</p>
          </div>

          {/* Best times display */}
          {Object.entries(bestTimes).some(([_, time]) => time !== null) && (
            <div className="mt-12 bg-black/30 backdrop-blur-md rounded-3xl p-6 w-full max-w-md">
              <h3 className="text-2xl font-bold text-white text-center mb-4">🏆 Best Times</h3>
              <div className="flex flex-col gap-2">
                {Object.entries(bestTimes).map(([diff, time]) => (
                  time && (
                    <div key={diff} className="flex justify-between text-white/80 text-lg">
                      <span>{DIFFICULTIES[diff].emoji} {DIFFICULTIES[diff].name}:</span>
                      <span className="font-bold">{time}s</span>
                    </div>
                  )
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Difficulty Selection Screen
  if (gameState === "difficulty") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-6">
        <div className="flex flex-col items-center w-full max-w-xl">
          <div className="text-center mb-16">
            <h2 className="text-6xl font-bold text-white mb-4" style={{ textShadow: "0 0 20px rgba(255,255,255,0.5)" }}>
              Choose Difficulty
            </h2>
            <p className="text-2xl text-white/70 font-semibold">Select your challenge level</p>
          </div>

          <div className="flex flex-col gap-6 w-full px-4">
            {Object.entries(DIFFICULTIES).map(([key, cfg]) => (
              <button
                key={key}
                onClick={() => startGame(key)}
                className="w-full py-8 px-10 text-4xl font-bold text-white transition-all transform active:scale-95"
                style={{
                  background: `linear-gradient(135deg, ${cfg.color} 0%, ${cfg.color}dd 100%)`,
                  boxShadow: `0 15px 40px ${cfg.color}80`,
                  borderRadius: "40px",
                  minHeight: "90px",
                  border: "2px solid rgba(255,255,255,0.2)"
                }}
              >
                {cfg.emoji} {cfg.name}
              </button>
            ))}
          </div>

          <button
            onClick={() => setGameState("menu")}
            className="mt-12 px-8 py-4 text-2xl font-bold text-white/80 transition-all transform active:scale-95"
            style={{
              background: "rgba(255,255,255,0.1)",
              borderRadius: "30px",
              border: "2px solid rgba(255,255,255,0.2)"
            }}
          >
            ← Back
          </button>

          <div className="mt-16 text-white/60 text-center text-lg">
            <p className="mb-2">🟢 Easy: 8×8 grid, 10 bombs</p>
            <p className="mb-2">🟡 Medium: 10×10 grid, 20 bombs</p>
            <p>🔴 Hard: 12×12 grid, 35 bombs</p>
          </div>
        </div>
      </div>
    );
  }

  // Pause Screen
  if (gameState === "paused") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-6">
        <div className="flex flex-col items-center w-full max-w-xl">
          <div className="bg-black/40 backdrop-blur-md w-full p-10" style={{ borderRadius: "40px", boxShadow: "0 20px 60px rgba(0,0,0,0.4)" }}>
            <h2 className="text-5xl font-bold text-white text-center mb-12">⏸️ Paused</h2>

            <div className="flex flex-col gap-8 mb-10">
              <div className="flex justify-between text-white/80 text-2xl">
                <span>Time:</span>
                <span className="font-bold text-3xl">{time}s</span>
              </div>
              <div className="flex justify-between text-white/80 text-2xl">
                <span>Flags:</span>
                <span className="font-bold text-3xl">{flags}/{B}</span>
              </div>
              <div className="flex justify-between text-white/80 text-2xl">
                <span>Difficulty:</span>
                <span className="font-bold text-3xl">{config.emoji} {config.name}</span>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <button
                onClick={resumeGame}
                className="w-full py-7 px-8 text-3xl font-bold text-white transition-all transform active:scale-95"
                style={{
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  minHeight: "85px",
                  borderRadius: "35px",
                  boxShadow: "0 10px 30px rgba(102, 126, 234, 0.5)",
                  border: "2px solid rgba(255,255,255,0.2)"
                }}
              >
                ▶️ Continue
              </button>

              <button
                onClick={backToMenu}
                className="w-full py-7 px-8 text-3xl font-bold text-white transition-all transform active:scale-95"
                style={{
                  background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                  minHeight: "85px",
                  borderRadius: "35px",
                  boxShadow: "0 10px 30px rgba(245, 87, 108, 0.5)",
                  border: "2px solid rgba(255,255,255,0.2)"
                }}
              >
                🏠 Back to Menu
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Game Screen
  const cellSize = Math.min(40, Math.floor((window.innerWidth - 80) / C));
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-4 flex flex-col">
      {/* Header */}
      <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-5 mb-4 shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-3xl font-bold text-white">💣 Minesweeper</h2>
          <button
            onClick={pauseGame}
            className="px-6 py-4 text-2xl font-bold text-white rounded-xl transition-all transform active:scale-95"
            style={{
              background: "linear-gradient(135deg, #ffa500 0%, #ff6347 100%)",
              minWidth: "120px",
              minHeight: "60px"
            }}
          >
            ⏸️ Pause
          </button>
        </div>

        <div className="flex justify-between items-center text-white/90 text-xl font-semibold">
          <div className="bg-purple-500/30 px-4 py-2 rounded-xl">
            ⏱️ {time}s
          </div>
          <div className="bg-red-500/30 px-4 py-2 rounded-xl">
            🚩 {flags}/{B}
          </div>
          <div className="text-2xl">
            {config.emoji}
          </div>
        </div>
      </div>

      {/* Game Board */}
      <div className="flex-1 flex items-center justify-center overflow-auto">
        <div className="bg-black/30 backdrop-blur-sm rounded-3xl p-4 shadow-2xl">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${C}, ${cellSize}px)`,
              gap: 4,
              touchAction: "manipulation"
            }}
          >
            {cells.map((row, r) =>
              row.map((cell, c) => {
                let bg = "rgba(255,255,255,0.1)";
                let content = "";
                let textColor = "#e5e7eb";

                if (cell.open) {
                  bg = "rgba(31, 41, 55, 0.8)";
                  if (cell.m) {
                    bg = "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)";
                    content = "💣";
                  } else if (cell.n > 0) {
                    content = cell.n;
                    textColor = NUMBER_COLORS[cell.n];
                  }
                } else if (cell.flag) {
                  content = "🚩";
                }

                return (
                  <button
                    key={`${r}-${c}`}
                    onClick={() => handleCellClick(r, c)}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      toggleFlag(r, c);
                    }}
                    style={{
                      width: cellSize,
                      height: cellSize,
                      borderRadius: 8,
                      border: "2px solid rgba(255,255,255,0.2)",
                      background: bg,
                      color: textColor,
                      fontWeight: 700,
                      fontSize: cellSize * 0.5,
                      lineHeight: "1",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.1s",
                      boxShadow: cell.open ? "inset 0 2px 4px rgba(0,0,0,0.3)" : "0 2px 4px rgba(0,0,0,0.2)"
                    }}
                  >
                    {content}
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Control Toggle */}
      <div className="flex justify-center mt-4 mb-2">
        <div className="bg-black/40 backdrop-blur-md rounded-full p-2 flex gap-2">
          <button
            onClick={() => setFlagMode(false)}
            className="px-6 py-3 text-xl font-bold rounded-full transition-all transform active:scale-95"
            style={{
              background: !flagMode
                ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                : "transparent",
              color: "white",
              border: "2px solid rgba(255,255,255,0.2)"
            }}
          >
            👆 Dig
          </button>
          <button
            onClick={() => setFlagMode(true)}
            className="px-6 py-3 text-xl font-bold rounded-full transition-all transform active:scale-95"
            style={{
              background: flagMode
                ? "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"
                : "transparent",
              color: "white",
              border: "2px solid rgba(255,255,255,0.2)"
            }}
          >
            🚩 Flag
          </button>
        </div>
      </div>

      {/* Victory/Loss Modal */}
      {(over || win) && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-6 z-50 animate-fade-in">
          <div
            className="rounded-3xl p-10 max-w-lg w-full shadow-2xl transform animate-scale-in"
            style={{
              background: win
                ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
                : "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"
            }}
          >
            <div className="text-center">
              <div className="text-8xl mb-6">{win ? "🏆" : "💥"}</div>
              <h3 className="text-5xl font-bold text-white mb-6">
                {win ? "You Win!" : "Game Over!"}
              </h3>
              <p className="text-white/90 text-2xl mb-4 font-semibold">
                Time: {time}s
              </p>
              {win && bestTimes[difficulty] === time && (
                <p className="text-white/90 text-xl mb-6 font-bold">
                  ⭐ New Best Time! ⭐
                </p>
              )}

              <div className="flex flex-col gap-5 mt-8">
                <button
                  onClick={() => startGame(difficulty)}
                  className="w-full py-7 px-8 text-3xl font-bold text-white transition-all transform active:scale-95"
                  style={{
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    minHeight: "85px",
                    borderRadius: "35px",
                    boxShadow: "0 10px 30px rgba(102, 126, 234, 0.5)",
                    border: "2px solid rgba(255,255,255,0.2)"
                  }}
                >
                  🔄 Play Again
                </button>

                <button
                  onClick={backToMenu}
                  className="w-full py-7 px-8 text-3xl font-bold text-white transition-all transform active:scale-95"
                  style={{
                    background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                    minHeight: "85px",
                    borderRadius: "35px",
                    boxShadow: "0 10px 30px rgba(245, 87, 108, 0.5)",
                    border: "2px solid rgba(255,255,255,0.2)"
                  }}
                >
                  🏠 Main Menu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scale-in {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
        .animate-bounce-slow {
          animation: bounce 2s infinite;
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
}