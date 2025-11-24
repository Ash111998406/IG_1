import React, { useEffect, useRef, useState } from "react";

const COLS = 10, ROWS = 20;
const HS_KEY = "tetris-best";

const SHAPES = {
  I: [
    [[1,1,1,1]],
    [[1],[1],[1],[1]]
  ],
  O: [
    [[1,1],[1,1]]
  ],
  T: [
    [[1,1,1],[0,1,0]],
    [[0,1],[1,1],[0,1]],
    [[0,1,0],[1,1,1]],
    [[1,0],[1,1],[1,0]]
  ],
  S: [
    [[0,1,1],[1,1,0]],
    [[1,0],[1,1],[0,1]]
  ],
  Z: [
    [[1,1,0],[0,1,1]],
    [[0,1],[1,1],[1,0]]
  ],
  J: [
    [[1,0,0],[1,1,1]],
    [[1,1],[1,0],[1,0]],
    [[1,1,1],[0,0,1]],
    [[0,1],[0,1],[1,1]]
  ],
  L: [
    [[0,0,1],[1,1,1]],
    [[1,0],[1,0],[1,1]],
    [[1,1,1],[1,0,0]],
    [[1,1],[0,1],[0,1]]
  ],
};
const COLORS = { I:"#60a5fa", O:"#fbbf24", T:"#a78bfa", S:"#34d399", Z:"#f87171", J:"#60a5fa", L:"#fb923c" };
const TYPES = Object.keys(SHAPES);

const emptyBoard = () => Array.from({length: ROWS}, () => Array(COLS).fill(null));
const rndPiece = () => {
  const t = TYPES[Math.floor(Math.random()*TYPES.length)];
  return { type:t, r:0, c: Math.floor((COLS - SHAPES[t][0][0].length)/2), rot:0 };
};

function rotate(shape, r) {
  const s = SHAPES[shape.type];
  return s[(shape.rot + r + s.length) % s.length];
}
function collide(board, shape) {
  const mat = rotate(shape,0);
  for (let r=0;r<mat.length;r++)
    for (let c=0;c<mat[0].length;c++) {
      if (!mat[r][c]) continue;
      const rr = shape.r + r, cc = shape.c + c;
      if (rr<0 || rr>=ROWS || cc<0 || cc>=COLS) return true;
      if (board[rr][cc]) return true;
    }
  return false;
}
function merge(board, shape) {
  const b = board.map(row=>row.slice());
  const mat = rotate(shape,0);
  for (let r=0;r<mat.length;r++)
    for (let c=0;c<mat[0].length;c++)
      if (mat[r][c]) b[shape.r+r][shape.c+c] = shape.type;
  return b;
}
function clearLines(board) {
  const keep = board.filter(row => row.some(x=>!x));
  const cleared = ROWS - keep.length;
  while (keep.length<ROWS) keep.unshift(Array(COLS).fill(null));
  return { board: keep, cleared };
}

export default function Tetris() {
  const [gameState, setGameState] = useState("menu"); // menu, difficulty, tutorial, playing, paused, gameover
  const [difficulty, setDifficulty] = useState("medium");
  const [board, setBoard] = useState(emptyBoard());
  const [piece, setPiece] = useState(rndPiece());
  const [next, setNext] = useState(rndPiece());
  const [lines, setLines] = useState(0);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(() => +localStorage.getItem(HS_KEY) || 0);
  const [speed, setSpeed] = useState(700);
  const dropRef = useRef(null);
  const touchRef = useRef(null);

  // Difficulty settings
  const getDifficultySettings = () => {
    switch(difficulty) {
      case "easy":
        return { startSpeed: 900, speedStep: 40, scoreMultiplier: 0.8 };
      case "medium":
        return { startSpeed: 700, speedStep: 60, scoreMultiplier: 1.0 };
      case "hard":
        return { startSpeed: 500, speedStep: 80, scoreMultiplier: 1.5 };
      default:
        return { startSpeed: 700, speedStep: 60, scoreMultiplier: 1.0 };
    }
  };

  const showDifficultyScreen = () => {
    setGameState("difficulty");
  };

  const showTutorial = (selectedDifficulty) => {
    setDifficulty(selectedDifficulty);
    setGameState("tutorial");
  };

  const startGame = () => {
    const settings = getDifficultySettings();
    setBoard(emptyBoard());
    setPiece(rndPiece());
    setNext(rndPiece());
    setLines(0);
    setScore(0);
    setSpeed(settings.startSpeed);
    setGameState("playing");
  };

  const pauseGame = () => setGameState("paused");
  const resumeGame = () => setGameState("playing");
  const backToMenu = () => setGameState("menu");

  useEffect(() => {
    if (gameState !== "playing") return;
    
    const onKey = (e) => {
      if (["ArrowLeft","ArrowRight","ArrowDown","ArrowUp"," "].includes(e.key)) e.preventDefault();
      if (e.key==="ArrowLeft") tryMove({ ...piece, c: piece.c-1 });
      if (e.key==="ArrowRight")tryMove({ ...piece, c: piece.c+1 });
      if (e.key==="ArrowUp")  tryMove({ ...piece, rot: piece.rot+1 });
      if (e.key===" ") hardDrop();
      if (e.key==="ArrowDown") tick();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [piece, board, gameState]);

  useEffect(() => {
    if (gameState !== "playing") return;
    
    clearInterval(dropRef.current);
    dropRef.current = setInterval(() => tick(), speed);
    return () => clearInterval(dropRef.current);
  }, [speed, piece, board, gameState]);

  function tryMove(np) {
    if (!collide(board, np)) setPiece(np);
  }

  function spawn() {
    const p = next;
    p.r = 0; p.c = Math.floor((COLS - rotate(p,0)[0].length)/2);
    p.rot = 0;
    if (collide(board, p)) { 
      setGameState("gameover");
      return;
    }
    setPiece(p);
    setNext(rndPiece());
  }

  function tick() {
    const np = { ...piece, r: piece.r+1 };
    if (!collide(board, np)) { setPiece(np); return; }
    
    // lock piece
    const merged = merge(board, piece);
    const { board: cleared, cleared: cnt } = clearLines(merged);
    
    if (cnt) {
      setLines(l => l+cnt);
      const settings = getDifficultySettings();
      const gain = Math.floor(([0,40,100,300,1200][cnt] || (cnt*200)) * settings.scoreMultiplier);
      setScore(s => {
        const ns = s+gain;
        if (ns>best) { localStorage.setItem(HS_KEY, ns); setBest(ns); }
        return ns;
      });
      
      // Speed up every 5 lines
      if ((lines+cnt) % 5 === 0) {
        setSpeed(v => Math.max(120, v - settings.speedStep));
      }
    }
    setBoard(cleared);
    spawn();
  }

  function hardDrop() {
    let np = { ...piece };
    while (!collide(board, { ...np, r: np.r+1 })) np.r++;
    setPiece(np);
    tick();
  }

  const onTouchStart = (e) => {
    e.preventDefault(); // Prevent browser scrolling
    const t = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    const cellWidth = rect.width / COLS;
    touchRef.current = {
      x: t.clientX, 
      y: t.clientY, 
      startX: t.clientX,
      startY: t.clientY,
      lastMoveX: t.clientX,
      initialCol: piece.c,
      t: Date.now(),
      isDragging: false
    };
  };

  const onTouchMove = (e) => {
    if (!touchRef.current || gameState !== "playing") return;
    e.preventDefault(); // Prevent browser scrolling
    
    const t = e.touches[0];
    const dx = t.clientX - touchRef.current.startX;
    const dy = t.clientY - touchRef.current.startY;
    
    // Mark as dragging if moved more than 10px
    if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
      touchRef.current.isDragging = true;
    }
    
    // Horizontal drag - move piece continuously
    const rect = e.currentTarget.getBoundingClientRect();
    const cellWidth = rect.width / COLS;
    const cellsMoved = Math.floor(dx / cellWidth);
    const targetCol = Math.max(0, Math.min(COLS - rotate(piece, 0)[0].length, touchRef.current.initialCol + cellsMoved));
    
    if (targetCol !== piece.c) {
      tryMove({ ...piece, c: targetCol });
    }
    
    // Vertical drag down - accelerate drop
    if (dy > 30 && t.clientY > touchRef.current.lastMoveY) {
      tick();
      touchRef.current.lastMoveY = t.clientY + 30; // Throttle
    }
    
    touchRef.current.x = t.clientX;
    touchRef.current.y = t.clientY;
  };

  const onTouchEnd = (e) => {
    if (!touchRef.current || gameState !== "playing") return;
    e.preventDefault(); // Prevent browser scrolling
    
    const t = e.changedTouches[0];
    const dx = t.clientX - touchRef.current.startX;
    const dy = t.clientY - touchRef.current.startY;
    const timeDiff = Date.now() - touchRef.current.t;
    
    // Quick tap (not drag) = instant drop
    if (!touchRef.current.isDragging && timeDiff < 300 && Math.abs(dx) < 10 && Math.abs(dy) < 10) {
      hardDrop();
      touchRef.current = null;
      return;
    }
    
    // Quick upward swipe = rotate
    if (touchRef.current.isDragging && dy < -40 && Math.abs(dy) > Math.abs(dx)) {
      tryMove({...piece, rot: piece.rot + 1});
    }
    
    touchRef.current = null;
  };

  // Menu Screen
  if (gameState === "menu") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-6">
        <div className="flex flex-col items-center w-full max-w-xl">
          <div className="text-center mb-20 animate-bounce-slow">
            <h1 className="text-7xl md:text-8xl font-bold text-white mb-6" style={{textShadow: "0 0 20px rgba(255,255,255,0.5)"}}>
              🎮 Tetris
            </h1>
            <p className="text-3xl text-white/80 font-semibold">Stack blocks and clear lines!</p>
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
            <p className="mb-2">👆 Drag to control blocks smoothly</p>
            <p className="mb-2">⬆️ Swipe up to rotate</p>
            <p>🎯 Clear lines to score!</p>
          </div>
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
            <h2 className="text-6xl font-bold text-white mb-4" style={{textShadow: "0 0 20px rgba(255,255,255,0.5)"}}>
              Choose Difficulty
            </h2>
            <p className="text-2xl text-white/70 font-semibold">Select your challenge level</p>
          </div>
          
          <div className="flex flex-col gap-6 w-full px-4">
            <button 
              onClick={() => showTutorial("easy")}
              className="w-full py-8 px-10 text-4xl font-bold text-white transition-all transform active:scale-95"
              style={{
                background: "linear-gradient(135deg, #34d399 0%, #10b981 100%)",
                boxShadow: "0 15px 40px rgba(52, 211, 153, 0.5)",
                borderRadius: "40px",
                minHeight: "90px",
                border: "2px solid rgba(255,255,255,0.2)"
              }}
            >
              😊 Easy
            </button>

            <button 
              onClick={() => showTutorial("medium")}
              className="w-full py-8 px-10 text-4xl font-bold text-white transition-all transform active:scale-95"
              style={{
                background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
                boxShadow: "0 15px 40px rgba(251, 191, 36, 0.5)",
                borderRadius: "40px",
                minHeight: "90px",
                border: "2px solid rgba(255,255,255,0.2)"
              }}
            >
              😐 Medium
            </button>

            <button 
              onClick={() => showTutorial("hard")}
              className="w-full py-8 px-10 text-4xl font-bold text-white transition-all transform active:scale-95"
              style={{
                background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                boxShadow: "0 15px 40px rgba(239, 68, 68, 0.5)",
                borderRadius: "40px",
                minHeight: "90px",
                border: "2px solid rgba(255,255,255,0.2)"
              }}
            >
              😈 Hard
            </button>
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
            <p className="mb-2">🟢 Easy: Slower speed, 80% score</p>
            <p className="mb-2">🟡 Medium: Normal speed, 100% score</p>
            <p>🔴 Hard: Fast speed, 150% score</p>
          </div>
        </div>
      </div>
    );
  }

  // Tutorial/Controls Screen
  if (gameState === "tutorial") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-6">
        <div className="flex flex-col items-center w-full max-w-2xl">
          <div className="text-center mb-12">
            <h2 className="text-5xl font-bold text-white mb-4" style={{textShadow: "0 0 20px rgba(255,255,255,0.5)"}}>
              How to Play
            </h2>
            <p className="text-2xl text-white/70 font-semibold">Master the controls!</p>
          </div>

          {/* Controls Guide */}
          <div className="w-full px-4 mb-8">
            {/* Drag Left/Right */}
            <div className="bg-black/40 backdrop-blur-md rounded-3xl p-6 mb-5" style={{border: "2px solid rgba(255,255,255,0.2)"}}>
              <div className="flex items-center gap-6">
                <div className="text-6xl">👈👉</div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white mb-2">Move Left/Right</h3>
                  <p className="text-xl text-white/80">Touch & drag horizontally to move blocks smoothly</p>
                </div>
              </div>
              <div className="mt-4 bg-white/10 rounded-2xl p-4 flex justify-center gap-8">
                <div className="text-center">
                  <div className="text-4xl mb-2">👆↔️</div>
                  <div className="text-white/60 text-sm">Drag Anywhere</div>
                </div>
              </div>
            </div>

            {/* Swipe Up */}
            <div className="bg-black/40 backdrop-blur-md rounded-3xl p-6 mb-5" style={{border: "2px solid rgba(255,255,255,0.2)"}}>
              <div className="flex items-center gap-6">
                <div className="text-6xl">🔄</div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white mb-2">Rotate Block</h3>
                  <p className="text-xl text-white/80">Quick swipe up to rotate the falling block</p>
                </div>
              </div>
              <div className="mt-4 bg-white/10 rounded-2xl p-4 flex justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-2">👆⬆️</div>
                  <div className="text-white/60 text-sm">Swipe Up Fast</div>
                </div>
              </div>
            </div>

            {/* Drag Down */}
            <div className="bg-black/40 backdrop-blur-md rounded-3xl p-6 mb-5" style={{border: "2px solid rgba(255,255,255,0.2)"}}>
              <div className="flex items-center gap-6">
                <div className="text-6xl">⚡</div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white mb-2">Fast Drop</h3>
                  <p className="text-xl text-white/80">Drag down to drop blocks faster</p>
                </div>
              </div>
              <div className="mt-4 bg-white/10 rounded-2xl p-4 flex justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-2">👆⬇️</div>
                  <div className="text-white/60 text-sm">Drag Down</div>
                </div>
              </div>
            </div>

            {/* Tap */}
            <div className="bg-black/40 backdrop-blur-md rounded-3xl p-6 mb-5" style={{border: "2px solid rgba(255,255,255,0.2)"}}>
              <div className="flex items-center gap-6">
                <div className="text-6xl">💥</div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white mb-2">Instant Drop</h3>
                  <p className="text-xl text-white/80">Quick tap (no drag) to drop instantly to bottom</p>
                </div>
              </div>
              <div className="mt-4 bg-white/10 rounded-2xl p-4 flex justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-2">👆</div>
                  <div className="text-white/60 text-sm">Quick Tap</div>
                </div>
              </div>
            </div>

            {/* Goal */}
            <div className="bg-gradient-to-r from-purple-600/40 to-pink-600/40 backdrop-blur-md rounded-3xl p-6 mb-5" style={{border: "2px solid rgba(255,255,255,0.3)"}}>
              <div className="text-center">
                <div className="text-5xl mb-3">🎯</div>
                <h3 className="text-2xl font-bold text-white mb-2">Clear Lines to Score!</h3>
                <p className="text-lg text-white/90">Fill complete rows to clear them and earn points</p>
              </div>
            </div>
          </div>

          {/* Start Button */}
          <button 
            onClick={startGame}
            className="w-full max-w-md py-8 px-10 text-4xl font-bold text-white transition-all transform active:scale-95 mb-4"
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              boxShadow: "0 15px 40px rgba(102, 126, 234, 0.5)",
              borderRadius: "40px",
              minHeight: "90px",
              border: "2px solid rgba(255,255,255,0.2)"
            }}
          >
            🎮 Start Playing!
          </button>

          <button 
            onClick={() => setGameState("difficulty")}
            className="px-8 py-4 text-xl font-bold text-white/80 transition-all transform active:scale-95"
            style={{
              background: "rgba(255,255,255,0.1)",
              borderRadius: "30px",
              border: "2px solid rgba(255,255,255,0.2)"
            }}
          >
            ← Back
          </button>
        </div>
      </div>
    );
  }

  // Pause Screen
  if (gameState === "paused") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-6">
        <div className="flex flex-col items-center w-full max-w-xl">
          <div className="bg-black/40 backdrop-blur-md w-full p-10" style={{borderRadius: "40px", boxShadow: "0 20px 60px rgba(0,0,0,0.4)"}}>
            <h2 className="text-5xl font-bold text-white text-center mb-12">⏸️ Paused</h2>
            
            <div className="flex flex-col gap-8 mb-10">
              <div className="flex justify-between text-white/80 text-2xl">
                <span>Score:</span>
                <span className="font-bold text-3xl">{score}</span>
              </div>
              <div className="flex justify-between text-white/80 text-2xl">
                <span>Lines:</span>
                <span className="font-bold text-3xl">{lines}</span>
              </div>
              <div className="flex justify-between text-white/80 text-2xl">
                <span>Best:</span>
                <span className="font-bold text-3xl">{best}</span>
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

  // Game Over Screen
  if (gameState === "gameover") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-6">
        <div className="flex flex-col items-center w-full max-w-xl">
          <div className="bg-black/40 backdrop-blur-md w-full p-10" style={{borderRadius: "40px", boxShadow: "0 20px 60px rgba(0,0,0,0.4)"}}>
            <div className="text-center mb-8">
              <div className="text-8xl mb-6">😢</div>
              <h2 className="text-5xl font-bold text-white mb-6">Game Over!</h2>
            </div>
            
            <div className="flex flex-col gap-6 mb-10">
              <div className="flex justify-between text-white/80 text-2xl">
                <span>Final Score:</span>
                <span className="font-bold text-3xl">{score}</span>
              </div>
              <div className="flex justify-between text-white/80 text-2xl">
                <span>Lines Cleared:</span>
                <span className="font-bold text-3xl">{lines}</span>
              </div>
              <div className="flex justify-between text-white/80 text-2xl">
                <span>Best Score:</span>
                <span className="font-bold text-3xl text-yellow-400">{best}</span>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <button 
                onClick={startGame}
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
    );
  }

  // Game Screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-4 flex flex-col">
      {/* Header */}
      <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-4 mb-4 shadow-lg">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold text-white">🎮 Tetris</h2>
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
      </div>

      {/* Game Area */}
      <div className="flex-1 flex items-center justify-center">
        <div className="flex gap-4" style={{maxWidth: "95vw"}}>
          {/* Game Board */}
          <div 
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            className="bg-black/40 backdrop-blur-sm rounded-2xl p-2 shadow-2xl"
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${COLS}, 1fr)`,
              gap: "3px",
              width: "min(70vw, 350px)",
              aspectRatio: `${COLS}/${ROWS}`,
              border: "3px solid rgba(255,255,255,0.2)",
              touchAction: "none" // Prevent all browser touch gestures
            }}
          >
            {Array.from({length:ROWS}).map((_,r) =>
              Array.from({length:COLS}).map((__,c) => {
                let cell = board[r][c];
                const mat = rotate(piece,0);
                const pr = r - piece.r, pc = c - piece.c;
                if (pr>=0 && pc>=0 && mat[pr] && mat[pr][pc]) cell = piece.type;
                
                return (
                  <div 
                    key={`${r}-${c}`} 
                    style={{
                      background: cell ? COLORS[cell] : "rgba(0,0,0,0.4)",
                      borderRadius: "4px",
                      boxShadow: cell ? "0 2px 8px rgba(0,0,0,0.3)" : "none",
                      border: cell ? "1px solid rgba(255,255,255,0.2)" : "none"
                    }}
                  />
                );
              })
            )}
          </div>

          {/* Side Panel */}
          <div className="flex flex-col gap-3" style={{minWidth: "120px"}}>
            {/* Score */}
            <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-4" style={{border: "2px solid rgba(255,255,255,0.2)"}}>
              <div className="text-white/70 text-sm font-semibold">Score</div>
              <div className="text-2xl font-bold text-white">{score}</div>
            </div>

            {/* Lines */}
            <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-4" style={{border: "2px solid rgba(255,255,255,0.2)"}}>
              <div className="text-white/70 text-sm font-semibold">Lines</div>
              <div className="text-2xl font-bold text-white">{lines}</div>
            </div>

            {/* Best */}
            <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-4" style={{border: "2px solid rgba(255,255,255,0.2)"}}>
              <div className="text-white/70 text-sm font-semibold">Best</div>
              <div className="text-2xl font-bold text-yellow-400">{best}</div>
            </div>

            {/* Next Piece */}
            <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-4" style={{border: "2px solid rgba(255,255,255,0.2)"}}>
              <div className="text-white/70 text-sm font-semibold mb-2">Next</div>
              <div style={{ 
                display:"grid", 
                gridTemplateColumns:"repeat(4, 20px)", 
                gap: 3,
                justifyContent: "center"
              }}>
                {Array.from({length:4}).map((_,r)=>
                  Array.from({length:4}).map((__,c)=>{
                    const m = SHAPES[next.type][0];
                    const v = m[r]?.[c] ? COLORS[next.type] : "transparent";
                    return (
                      <div 
                        key={`${r}-${c}`} 
                        style={{ 
                          width: 20, 
                          height: 20, 
                          background: v, 
                          borderRadius: 4,
                          border: v !== "transparent" ? "1px solid rgba(255,255,255,0.3)" : "none"
                        }}
                      />
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls Hint */}
      <div className="mt-4 text-center text-white/50 text-sm">
        <p>Drag ↔️ to move | Swipe ↑ to rotate | Drag ↓ for speed | Tap for instant drop</p>
      </div>

      <style jsx>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-slow {
          animation: bounce 2s infinite;
        }
      `}</style>
    </div>
  );
}