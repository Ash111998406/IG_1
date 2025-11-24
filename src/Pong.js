import React, { useEffect, useRef, useState } from "react";

const W = 400, H = 600, PAD_H = 100, PAD_W = 15, BALL = 15;

export default function Pong() {
  const [gameState, setGameState] = useState("menu"); // menu, difficulty, playing, paused
  const [difficulty, setDifficulty] = useState("medium"); // easy, medium, hard
  const [py, setPy] = useState(H/2 - PAD_H/2);   // player paddle (bottom)
  const [ay, setAy] = useState(H/2 - PAD_H/2);   // AI paddle (top)
  const [bx, setBx] = useState(W/2 - BALL/2);
  const [by, setBy] = useState(H/2 - BALL/2);
  const [vx, setVx] = useState(0);
  const [vy, setVy] = useState(0);
  const [ps, setPs] = useState(0);
  const [as, setAs] = useState(0);
  const af = useRef(null);

  // Difficulty settings
  const getDifficultySettings = () => {
    switch(difficulty) {
      case "easy":
        // Slow AI, slow ball - very beginner friendly
        return { 
          aiSpeed: 2.8, 
          ballSpeedMultiplier: 0.7, 
          aiReactionDelay: 0.65,
          aiMaxSpeed: 3.5 // AI has speed limit
        };
      case "medium":
        // Medium AI, medium ball - balanced and fair
        return { 
          aiSpeed: 3.8, 
          ballSpeedMultiplier: 1.0, 
          aiReactionDelay: 0.80,
          aiMaxSpeed: 5.0 // AI can be outpaced by fast shots
        };
      case "hard":
        // Fast AI, fast ball - challenging but beatable with skill
        return { 
          aiSpeed: 5.0, 
          ballSpeedMultiplier: 1.3, 
          aiReactionDelay: 0.92,
          aiMaxSpeed: 6.5 // AI still has limits, fast edge shots can beat it
        };
      default:
        return { 
          aiSpeed: 3.8, 
          ballSpeedMultiplier: 1.0, 
          aiReactionDelay: 0.80,
          aiMaxSpeed: 5.0
        };
    }
  };

  const resetBall = (dir = Math.random()<0.5?-1:1) => {
    const settings = getDifficultySettings();
    setBx(W/2 - BALL/2); 
    setBy(H/2 - BALL/2);
    // Base speeds that scale well with difficulty multipliers
    setVx((Math.random()*2-1)*2.8 * settings.ballSpeedMultiplier);
    setVy(dir*(3.5 + Math.random()*1.0) * settings.ballSpeedMultiplier);
  };

  const showDifficultyScreen = () => {
    setGameState("difficulty");
  };

  const startGame = (selectedDifficulty) => {
    setDifficulty(selectedDifficulty);
    setPy(H/2 - PAD_H/2);
    setAy(H/2 - PAD_H/2);
    setPs(0);
    setAs(0);
    resetBall();
    setGameState("playing");
  };

  const pauseGame = () => setGameState("paused");
  const resumeGame = () => setGameState("playing");
  const backToMenu = () => {
    setGameState("menu");
    setVx(0);
    setVy(0);
  };

  // Touch controls for player paddle
  const onTouch = (e) => {
    if (gameState !== "playing") return;
    e.preventDefault();
    const t = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    const x = t.clientX - rect.left - PAD_H/2;
    setPy(Math.max(0, Math.min(W - PAD_H, x)));
  };

  // Game loop
  useEffect(() => {
    if (gameState !== "playing") return;

    const settings = getDifficultySettings();

    const loop = () => {
      af.current = requestAnimationFrame(loop);

      // Calculate next positions
      const nextBx = bx + vx;
      const nextBy = by + vy;

      // Check for paddle collisions BEFORE moving the ball to prevent tunneling
      const willCollideBottom = nextBy + BALL >= H - PAD_W && nextBx + BALL >= py && nextBx <= py + PAD_H && vy > 0;
      const willCollideTop = nextBy <= PAD_W && nextBx + BALL >= ay && nextBx <= ay + PAD_H && vy < 0;
      
      if (willCollideBottom) {
        // Immediately set ball position at paddle surface
        setBx(nextBx);
        setBy(H - PAD_W - BALL);
        
        // Calculate where on the paddle the ball hit
        const hitPos = (nextBx + BALL/2 - py) / PAD_H;
        const relativeHitPos = hitPos * 2 - 1;
        
        // Calculate reflection angle
        const maxAngle = Math.PI / 6;
        const angle = relativeHitPos * maxAngle;
        
        // Calculate new velocity
        const speed = Math.sqrt(vx * vx + vy * vy) * 1.05;
        setVx(speed * Math.sin(angle));
        setVy(-speed * Math.cos(angle));
      } else if (willCollideTop) {
        // Immediately set ball position at paddle surface
        setBx(nextBx);
        setBy(PAD_W);
        
        // Calculate where on the paddle the ball hit
        const hitPos = (nextBx + BALL/2 - ay) / PAD_H;
        const relativeHitPos = hitPos * 2 - 1;
        
        // Calculate reflection angle
        const maxAngle = Math.PI / 6;
        const angle = relativeHitPos * maxAngle;
        
        // Calculate new velocity
        const speed = Math.sqrt(vx * vx + vy * vy) * 1.05;
        setVx(speed * Math.sin(angle));
        setVy(speed * Math.cos(angle));
      } else {
        // No collision, move ball normally
        setBx(nextBx);
        setBy(nextBy);
      }

      // Side walls - bounce
      setBx(x => {
        if (x <= 0 && vx < 0) setVx(-vx);
        if (x >= W - BALL && vx > 0) setVx(-vx);
        return Math.max(0, Math.min(W - BALL, x));
      });

      // AI follows ball (top paddle) with difficulty-based speed and reaction
      setAy(x => {
        const target = bx - (PAD_H - BALL)/2;
        // AI only reacts when ball is moving towards it
        if (vy < 0) {
          const reactionTarget = target * settings.aiReactionDelay + x * (1 - settings.aiReactionDelay);
          const distance = reactionTarget - x;
          
          // Calculate desired movement, but cap it at aiMaxSpeed
          const desiredSpeed = Math.abs(distance) > settings.aiSpeed ? settings.aiSpeed : Math.abs(distance);
          const cappedSpeed = Math.min(desiredSpeed, settings.aiMaxSpeed);
          
          const nx = x + (distance > 0 ? cappedSpeed : -cappedSpeed);
          return Math.max(0, Math.min(W - PAD_H, nx));
        }
        return x;
      });

      // Scoring
      setBy(y => {
        if (y < -20) { 
          setPs(s => s + 1); 
          resetBall(1); 
          return H/2 - BALL/2; 
        }
        if (y > H + 20) { 
          setAs(s => s + 1); 
          resetBall(-1); 
          return H/2 - BALL/2; 
        }
        return y;
      });
    };

    af.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(af.current);
  }, [gameState, py, ay, bx, by, vx, vy, difficulty]);

  // Menu Screen
  if (gameState === "menu") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-6">
        <div className="flex flex-col items-center w-full max-w-xl">
          <div className="text-center mb-20 animate-bounce-slow">
            <h1 className="text-7xl md:text-8xl font-bold text-white mb-6" style={{textShadow: "0 0 20px rgba(255,255,255,0.5)"}}>
              🏓 Pong
            </h1>
            <p className="text-3xl text-white/80 font-semibold">Classic arcade action!</p>
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
            <p className="mb-2">Slide the handle to move your paddle</p>
            <p>Don't let the ball pass you!</p>
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
              onClick={() => startGame("easy")}
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
              onClick={() => startGame("medium")}
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
              onClick={() => startGame("hard")}
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
            <p className="mb-2">🟢 Easy: Slower AI, Easier ball speed</p>
            <p className="mb-2">🟡 Medium: Balanced challenge</p>
            <p>🔴 Hard: Fast AI, Faster ball speed</p>
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
                <span>AI Score:</span>
                <span className="font-bold text-3xl">{as}</span>
              </div>
              <div className="flex justify-between text-white/80 text-2xl">
                <span>Your Score:</span>
                <span className="font-bold text-3xl">{ps}</span>
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-4 flex flex-col">
      {/* Header */}
      <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-5 mb-4 shadow-lg">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-3xl font-bold text-white">🏓 Pong</h2>
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
        
        <div className="flex justify-center gap-8 text-white/90 text-2xl font-bold">
          <div className="bg-purple-500/30 px-6 py-3 rounded-2xl">
            AI: <span className="text-3xl">{as}</span>
          </div>
          <div className="bg-green-500/30 px-6 py-3 rounded-2xl">
            You: <span className="text-3xl">{ps}</span>
          </div>
        </div>
      </div>

      {/* Game Board */}
      <div className="flex-1 flex items-center justify-center">
        <div className="bg-black/30 backdrop-blur-sm rounded-3xl p-4 shadow-2xl">
          <div 
            onTouchStart={onTouch} 
            onTouchMove={onTouch}
            style={{ 
              width: W, 
              height: H, 
              maxWidth: "95vw",
              maxHeight: "70vh",
              background: "linear-gradient(135deg, rgba(17,24,39,0.8) 0%, rgba(31,41,55,0.8) 100%)", 
              borderRadius: 20, 
              position: "relative", 
              overflow: "hidden",
              border: "3px solid rgba(255,255,255,0.1)",
              touchAction: "none"
            }}
          >
            {/* Center line */}
            <div style={{ 
              position: "absolute", 
              left: 0, 
              right: 0, 
              top: "50%", 
              height: 3, 
              background: "rgba(255,255,255,0.2)",
              transform: "translateY(-50%)"
            }}/>
            
            {/* AI paddle (top - horizontal) */}
            <div style={{ 
              position: "absolute", 
              left: ay, 
              top: 0, 
              width: PAD_H, 
              height: PAD_W, 
              background: "linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)", 
              borderRadius: 4,
              boxShadow: "0 0 20px rgba(167, 139, 250, 0.6)"
            }}/>
            
            {/* Player paddle (bottom - horizontal) with rod and sphere handle */}
            <div style={{ 
              position: "absolute", 
              left: py, 
              bottom: 0, 
              width: PAD_H, 
              height: PAD_W, 
              background: "linear-gradient(135deg, #34d399 0%, #10b981 100%)", 
              borderRadius: 4,
              boxShadow: "0 0 20px rgba(52, 211, 153, 0.6)"
            }}>
              {/* Rod extending from paddle */}
              <div style={{
                position: "absolute",
                left: "50%",
                top: PAD_W,
                transform: "translateX(-50%)",
                width: 6,
                height: 50,
                background: "linear-gradient(180deg, #34d399 0%, #10b981 100%)",
                boxShadow: "0 2px 10px rgba(52, 211, 153, 0.4)",
                borderRadius: "3px"
              }}>
                {/* Sphere/circle at the tip of the rod */}
                <div style={{
                  position: "absolute",
                  left: "50%",
                  bottom: -25,
                  transform: "translateX(-50%)",
                  width: 50,
                  height: 50,
                  background: "radial-gradient(circle at 30% 30%, #6ee7b7 0%, #34d399 50%, #10b981 100%)",
                  borderRadius: "50%",
                  boxShadow: "0 4px 20px rgba(52, 211, 153, 0.6), inset -2px -2px 8px rgba(0,0,0,0.2), inset 2px 2px 8px rgba(255,255,255,0.3)",
                  border: "3px solid rgba(255,255,255,0.4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  {/* Inner highlight for 3D effect */}
                  <div style={{
                    width: 15,
                    height: 15,
                    background: "rgba(255,255,255,0.6)",
                    borderRadius: "50%",
                    position: "absolute",
                    top: 8,
                    left: 12,
                    filter: "blur(3px)"
                  }}/>
                  {/* Grip texture lines */}
                  <div style={{
                    position: "absolute",
                    fontSize: "24px",
                    opacity: 0.8
                  }}>
                    👆
                  </div>
                </div>
              </div>
            </div>
            
            {/* Ball */}
            <div style={{ 
              position: "absolute", 
              left: bx, 
              top: by, 
              width: BALL, 
              height: BALL, 
              background: "radial-gradient(circle, #fbbf24 0%, #f59e0b 100%)", 
              borderRadius: "50%",
              boxShadow: "0 0 30px rgba(251, 191, 36, 0.8), 0 0 15px rgba(251, 191, 36, 0.5)"
            }}/>
          </div>
        </div>
      </div>

      {/* Victory/Loss Modal */}
      {(ps >= 10 || as >= 10) && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-6 z-50 animate-fade-in">
          <div className={`rounded-3xl p-10 max-w-lg w-full shadow-2xl transform animate-scale-in`}
               style={{
                 background: ps >= 10 
                   ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
                   : "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"
               }}>
            <div className="text-center">
              <div className="text-8xl mb-6">{ps >= 10 ? "🏆" : "😢"}</div>
              <h3 className="text-5xl font-bold text-white mb-6">
                {ps >= 10 ? "You Win!" : "AI Wins!"}
              </h3>
              <p className="text-white/90 text-2xl mb-8 font-semibold">
                Final Score: {as} - {ps}
              </p>

              <div className="flex flex-col gap-5">
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