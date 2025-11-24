import React, { useEffect, useState } from "react";

const EMOJI = ["🍎","🍌","🍓","🍉","🍇","🍒","🍑","🥝"];

function shuffle(a) {
  for(let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function MemoryMatch() {
  const [gameState, setGameState] = useState("menu"); // menu, playing, paused
  const [cards, setCards] = useState([]);
  const [open, setOpen] = useState([]);
  const [matched, setMatched] = useState(new Set());
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  // Timer
  useEffect(() => {
    if (gameState !== "playing") return;
    const timer = setInterval(() => setTime(t => t + 1), 1000);
    return () => clearInterval(timer);
  }, [gameState]);

  const startGame = () => {
    const deck = shuffle([...EMOJI, ...EMOJI]).map((e, i) => ({ id: i, face: e }));
    setCards(deck);
    setOpen([]);
    setMatched(new Set());
    setMoves(0);
    setTime(0);
    setGameOver(false);
    setGameState("playing");
  };

  const pauseGame = () => setGameState("paused");
  const resumeGame = () => setGameState("playing");
  const backToMenu = () => setGameState("menu");

  const clickCard = (idx) => {
    if (gameState !== "playing" || gameOver) return;
    if (matched.has(idx) || open.includes(idx)) return;
    if (open.length === 2) return;

    const newOpen = [...open, idx];
    setOpen(newOpen);

    if (newOpen.length === 2) {
      setMoves(m => m + 1);
      const [a, b] = newOpen;
      if (cards[a].face === cards[b].face) {
        const nm = new Set([...matched, a, b]);
        setTimeout(() => {
          setMatched(nm);
          setOpen([]);
          if (nm.size === cards.length) setGameOver(true);
        }, 400);
      } else {
        setTimeout(() => setOpen([]), 800);
      }
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Menu Screen
  if (gameState === "menu") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-6">
        <div className="flex flex-col items-center w-full max-w-xl">
          <div className="text-center mb-20 animate-bounce-slow">
            <h1 className="text-7xl md:text-8xl font-bold text-white mb-6" style={{textShadow: "0 0 20px rgba(255,255,255,0.5)"}}>
              🧠 Memory Match
            </h1>
            <p className="text-3xl text-white/80 font-semibold">Match all the emoji pairs!</p>
          </div>
          
          <div className="flex flex-col gap-8 w-full px-4">
            <button 
              onClick={startGame}
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
            <p className="mb-2">Tap cards to flip them</p>
            <p>Match all pairs in the fewest moves!</p>
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
          <div className="bg-black/40 backdrop-blur-md w-full p-10" style={{borderRadius: "40px", boxShadow: "0 20px 60px rgba(0,0,0,0.4)"}}>
            <h2 className="text-5xl font-bold text-white text-center mb-12">⏸️ Paused</h2>
            
            <div className="flex flex-col gap-8 mb-10">
              <div className="flex justify-between text-white/80 text-2xl">
                <span>Moves:</span>
                <span className="font-bold text-3xl">{moves}</span>
              </div>
              <div className="flex justify-between text-white/80 text-2xl">
                <span>Time:</span>
                <span className="font-bold text-3xl">{formatTime(time)}</span>
              </div>
              <div className="flex justify-between text-white/80 text-2xl">
                <span>Matched:</span>
                <span className="font-bold text-3xl">{matched.size / 2} / {EMOJI.length}</span>
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
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-4 sm:p-6 flex flex-col">
      {/* Header */}
      <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-5 sm:p-6 mb-4 sm:mb-6 shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">Memory Match</h2>
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
        
        <div className="flex justify-between text-white/90 text-xl sm:text-2xl font-semibold">
          <div>Moves: <span className="font-bold text-2xl sm:text-3xl">{moves}</span></div>
          <div>Time: <span className="font-bold text-2xl sm:text-3xl">{formatTime(time)}</span></div>
          <div>Pairs: <span className="font-bold text-2xl sm:text-3xl">{matched.size / 2}/{EMOJI.length}</span></div>
        </div>
      </div>

      {/* Game Board */}
      <div className="flex-1 flex items-center justify-center">
        <div className="bg-black/30 backdrop-blur-sm rounded-3xl p-4 sm:p-8 shadow-2xl">
          <div 
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "12px",
              maxWidth: "min(95vw, 500px)"
            }}
          >
            {cards.map((c, idx) => {
              const isOpen = open.includes(idx) || matched.has(idx);
              const isMatched = matched.has(idx);
              return (
                <button
                  key={c.id}
                  onClick={() => clickCard(idx)}
                  disabled={isMatched}
                  className="aspect-square transition-all transform active:scale-95"
                  style={{
                    minWidth: "80px",
                    minHeight: "80px",
                    borderRadius: "16px",
                    border: "3px solid rgba(255,255,255,0.2)",
                    background: isOpen 
                      ? isMatched 
                        ? "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)"
                        : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                      : "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)",
                    fontSize: "clamp(36px, 8vw, 48px)",
                    boxShadow: isOpen ? "0 4px 20px rgba(102, 126, 234, 0.4)" : "none",
                    cursor: isMatched ? "default" : "pointer"
                  }}
                >
                  {isOpen ? c.face : "❓"}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Victory Modal */}
      {gameOver && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-6 z-50 animate-fade-in">
          <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl p-10 max-w-lg w-full shadow-2xl transform animate-scale-in">
            <div className="text-center">
              <div className="text-8xl mb-6">🎉</div>
              <h3 className="text-5xl font-bold text-white mb-6">Congratulations!</h3>
              <p className="text-white/90 text-2xl mb-8 font-semibold">You matched all pairs!</p>
              
              <div className="bg-black/30 rounded-2xl p-6 mb-8">
                <div className="flex justify-between text-white mb-4 text-2xl">
                  <span>Moves:</span>
                  <span className="font-bold text-3xl">{moves}</span>
                </div>
                <div className="flex justify-between text-white text-2xl">
                  <span>Time:</span>
                  <span className="font-bold text-3xl">{formatTime(time)}</span>
                </div>
              </div>

              <div className="flex flex-col gap-5">
                <button 
                  onClick={startGame}
                  className="w-full py-7 px-8 text-3xl font-bold text-white rounded-2xl transition-all transform active:scale-95"
                  style={{
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    minHeight: "75px"
                  }}
                >
                  🔄 Play Again
                </button>
                
                <button 
                  onClick={backToMenu}
                  className="w-full py-7 px-8 text-3xl font-bold text-white rounded-2xl transition-all transform active:scale-95"
                  style={{
                    background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                    minHeight: "75px"
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