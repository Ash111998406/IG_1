import React, { useEffect, useRef, useState } from "react";
import { ArrowLeft } from 'lucide-react';

const GRAVITY = 0.5;
const JUMP_V = -10;
const SPEED_START = 5;
const SPEED_INCREMENT = 0.03; // 3% increase every 10 seconds
const SPEED_INCREMENT_INTERVAL = 10000; // 10 seconds
const TARGET_FPS = 60;
const FRAME_MS = 1000 / TARGET_FPS;

// Obstacle types with different emojis
const OBSTACLE_TYPES = [
  { emoji: '🪨', name: 'rock', deadly: false },
  { emoji: '🌵', name: 'cactus', deadly: false },
  { emoji: '📦', name: 'box', deadly: false },
  { emoji: '🪵', name: 'log', deadly: false },
  { emoji: '🌲', name: 'tree', deadly: false },
  { emoji: '💣', name: 'bomb', deadly: true }
];

export default function PigRunner({ onBack }) {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
  const rafRef = useRef(0);
  
  const [phase, setPhase] = useState('intro'); // 'intro' | 'playing' | 'paused' | 'gameover'
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  
  const phaseRef = useRef(phase);
  const suppressNextJumpRef = useRef(false);
  
  const gameRef = useRef({
    pig: { x: 80, y: 0, vy: 0, frame: 0, width: 50 },
    obstacles: [],
    ground: 140,
    speed: SPEED_START,
    score: 0,
    lastSpawn: 0,
    lastObstacleX: -999,
    gameStartTime: 0,
    lastSpeedIncrease: 0,
    over: false
  });

  useEffect(() => { phaseRef.current = phase; }, [phase]);
  
  useEffect(() => {
    const saved = localStorage.getItem('pig-runner-high');
    if (saved) setHighScore(parseInt(saved));
  }, []);

  const resetGame = () => {
    gameRef.current = {
      pig: { x: 80, y: 0, vy: 0, frame: 0, width: 50 },
      obstacles: [],
      ground: 140,
      speed: SPEED_START,
      score: 0,
      lastSpawn: 0,
      lastObstacleX: -999,
      gameStartTime: 0,
      lastSpeedIncrease: 0,
      over: false
    };
    setScore(0);
  };

  const startGame = () => {
    resetGame();
    setPhase('playing');
  };

  const pauseGame = (e) => {
    e?.stopPropagation?.();
    cancelAnimationFrame(rafRef.current);
    setPhase('paused');
  };

  const resumeGame = () => {
    suppressNextJumpRef.current = true;
    setPhase('playing');
  };

  const exitGame = () => {
    if (onBack) onBack();
  };

  const jump = () => {
    if (suppressNextJumpRef.current) {
      suppressNextJumpRef.current = false;
      return;
    }
    const g = gameRef.current;
    if (g.over) return;
    if (g.pig.y === 0) {
      g.pig.vy = JUMP_V;
    }
  };

  // Input handlers
  useEffect(() => {
    if (phase !== 'playing') return;
    
    const onJump = (e) => {
      if (e.type === 'keydown' && e.code !== 'Space' && e.code !== 'ArrowUp') return;
      e.preventDefault();
      jump();
    };

    window.addEventListener('pointerdown', onJump, { passive: false });
    window.addEventListener('keydown', onJump);
    if (wrapRef.current) {
      wrapRef.current.addEventListener('pointerdown', onJump, { passive: false });
    }

    return () => {
      window.removeEventListener('pointerdown', onJump);
      window.removeEventListener('keydown', onJump);
      if (wrapRef.current) {
        wrapRef.current.removeEventListener('pointerdown', onJump);
      }
    };
  }, [phase]);

  // Pause on visibility change
  useEffect(() => {
    const onVis = () => {
      if (document.hidden && phase === 'playing') setPhase('paused');
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [phase]);

  // Game loop
  useEffect(() => {
    if (phase !== 'playing') return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: false });
    const g = gameRef.current;

    // Setup canvas for fullscreen
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    const CSS_W = window.innerWidth;
    const CSS_H = window.innerHeight;
    canvas.style.width = CSS_W + 'px';
    canvas.style.height = CSS_H + 'px';
    canvas.width = Math.round(CSS_W * DPR);
    canvas.height = Math.round(CSS_H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    const W = CSS_W, H = CSS_H;
    
    // Adjust ground position based on screen height
    g.ground = H - 80;

    let lastTime = 0;

    const loop = (now = performance.now()) => {
      if (phaseRef.current !== 'playing' || g.over) return;

      // FPS cap
      if (now - lastTime < FRAME_MS) {
        rafRef.current = requestAnimationFrame(loop);
        return;
      }
      lastTime = now;
      
      // Set game start time on first frame
      if (g.gameStartTime === 0) {
        g.gameStartTime = now;
        g.lastSpeedIncrease = now;
      }

      // Background
      const skyGrad = ctx.createLinearGradient(0, 0, 0, H);
      skyGrad.addColorStop(0, '#7dd3fc');
      skyGrad.addColorStop(1, '#bae6fd');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, W, H);

      // Clouds
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      const cloudOffset = (now * 0.01) % 200;
      for (let i = 0; i < 5; i++) {
        const cx = (i * 150 - cloudOffset) % W;
        drawCloud(ctx, cx, 30 + i * 15);
      }

      // Ground
      const groundY = g.ground;
      ctx.fillStyle = '#84cc16';
      ctx.fillRect(0, groundY, W, H - groundY);
      
      // Ground pattern
      ctx.fillStyle = '#65a30d';
      for (let x = 0; x < W; x += 40) {
        const offset = (now * 0.1) % 40;
        ctx.fillRect(x - offset, groundY, 20, 4);
      }

      // Gradual speed increase every 10 seconds
      if (now - g.lastSpeedIncrease >= SPEED_INCREMENT_INTERVAL) {
        g.speed = g.speed * (1 + SPEED_INCREMENT);
        g.lastSpeedIncrease = now;
      }

      // Physics
      g.pig.vy += GRAVITY;
      g.pig.y += g.pig.vy;
      if (g.pig.y > 0) {
        g.pig.y = 0;
        g.pig.vy = 0;
      }
      g.pig.frame++;

      // Dynamic gap calculation based on speed
      // Formula: gap scales with speed to keep difficulty consistent
      // At speed 5: minGap ~250px, at speed 15: minGap ~500px
      const speedFactor = g.speed / SPEED_START; // starts at 1.0
      const minGap = g.pig.width * 5 * speedFactor; // scales with speed
      const maxGapMultiplier = 2 + speedFactor; // increases as speed increases
      const maxGap = minGap * maxGapMultiplier; // no hard limit, just relative to min
      const maxWaitTime = 2500; // 2.5 seconds max wait
      
      // Spawn obstacles with smart spacing
      const timeSinceLastSpawn = now - g.lastSpawn;
      const lastObstaclePassedEnough = W - g.lastObstacleX > minGap;
      const shouldSpawnByTime = timeSinceLastSpawn > maxWaitTime;
      
      if ((lastObstaclePassedEnough && timeSinceLastSpawn > 400) || shouldSpawnByTime) {
        // Random gap between min and max (closer when slow, wider when fast)
        const randomGap = minGap + Math.random() * (maxGap - minGap);
        
        if (W - g.lastObstacleX >= randomGap || shouldSpawnByTime) {
          g.lastSpawn = now;
          const type = OBSTACLE_TYPES[Math.floor(Math.random() * OBSTACLE_TYPES.length)];
          const newObs = {
            x: W,
            w: 25 + Math.floor(Math.random() * 15), // Reduced size
            h: 30 + Math.floor(Math.random() * 15), // Reduced size
            type: type
          };
          g.obstacles.push(newObs);
          g.lastObstacleX = W;
        }
      }

      // Update & draw obstacles
      for (let i = g.obstacles.length - 1; i >= 0; i--) {
        const obs = g.obstacles[i];
        obs.x -= g.speed;

        // Track the rightmost obstacle position for spacing
        if (i === g.obstacles.length - 1) {
          g.lastObstacleX = obs.x;
        }

        // Draw emoji obstacle (no rectangle background)
        const emojiSize = Math.max(obs.h, obs.w);
        ctx.font = `${emojiSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        
        // Add bounce animation for bombs
        const bounceOffset = obs.type.deadly ? Math.sin(now * 0.01 + obs.x * 0.01) * 3 : 0;
        
        // Position emoji so it sits on the ground
        ctx.fillText(obs.type.emoji, obs.x + obs.w / 2, groundY + 5 + bounceOffset);
        ctx.textAlign = 'left'; // reset
        ctx.textBaseline = 'alphabetic'; // reset

        // Remove offscreen
        if (obs.x + obs.w < 0) {
          g.obstacles.splice(i, 1);
          g.score += 10;
          setScore(g.score);
        }

        // Collision detection - adjusted for smaller obstacles
        const pigBox = {
          x: g.pig.x + 5,
          y: groundY + g.pig.y - 35,
          w: 40,
          h: 35
        };
        const obsBox = {
          x: obs.x + obs.w * 0.25,
          y: groundY - obs.h * 0.85,
          w: obs.w * 0.5,
          h: obs.h * 0.85
        };

        if (
          pigBox.x + pigBox.w > obsBox.x &&
          pigBox.x < obsBox.x + obsBox.w &&
          pigBox.y + pigBox.h > obsBox.y &&
          pigBox.y < obsBox.y + obsBox.h
        ) {
          g.over = true;
        }
      }

      // Speed increase - removed automatic increase based on score
      // Now only increases every 10 seconds (handled above)

      // Draw pig
      drawPig(ctx, g.pig.x, groundY + g.pig.y, g.pig.frame, g.pig.y < 0);

      // Score - positioned at top left
      ctx.fillStyle = 'white';
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 4;
      ctx.font = 'bold 28px Arial';
      const scoreText = `Score: ${g.score}`;
      ctx.strokeText(scoreText, 20, 40);
      ctx.fillText(scoreText, 20, 40);
      
      // Speed indicator at top center
      ctx.font = 'bold 20px Arial';
      const speedText = `Speed: ${g.speed.toFixed(1)}x`;
      const speedWidth = ctx.measureText(speedText).width;
      ctx.strokeText(speedText, (W - speedWidth) / 2, 35);
      ctx.fillText(speedText, (W - speedWidth) / 2, 35);
      
      // High score at top right
      if (highScore > 0) {
        ctx.font = 'bold 20px Arial';
        const hsText = `Best: ${highScore}`;
        const hsWidth = ctx.measureText(hsText).width;
        ctx.strokeText(hsText, W - hsWidth - 20, 35);
        ctx.fillText(hsText, W - hsWidth - 20, 35);
      }

      // Game over
      if (g.over) {
        if (g.score > highScore) {
          setHighScore(g.score);
          localStorage.setItem('pig-runner-high', g.score.toString());
        }
        setPhase('gameover');
        return;
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [phase, highScore]);

  // Overlays
  const IntroOverlay = () => (
    <Overlay onClick={startGame} hint="Tap anywhere to start">
      <h2 className="text-5xl font-bold text-white mb-2 glow-text">🐷 Pig Runner</h2>
      <p className="text-blue-200 text-lg">Tap to jump over obstacles!</p>
      {highScore > 0 && <p className="text-yellow-300 text-xl mt-3">High Score: {highScore}</p>}
      <div className="glass-card mt-4" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        <div className="glass-btn btn-blue text-xl touch-target">Tap to Start</div>
        <button
          className="hud-btn"
          style={{ background: '#ef4444', color: '#fff' }}
          onPointerDown={(e) => { e.stopPropagation(); exitGame(); }}
        >
          Exit
        </button>
      </div>
      <p className="text-white/60 text-sm mt-2">💡 Best played in landscape mode</p>
    </Overlay>
  );

  const GameOverOverlay = () => (
    <Overlay onClick={startGame} hint="Tap anywhere to restart">
      <h2 className="text-5xl font-bold text-white mb-2 glow-text">Game Over! 🐷</h2>
      <p className="text-blue-200 text-xl mb-2">Score: {score}</p>
      <p className="text-yellow-300 text-xl">High Score: {Math.max(highScore, score)}</p>
      <div className="glass-card mt-4" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        <div className="glass-btn btn-blue text-xl touch-target">Tap to Restart</div>
        <button
          className="hud-btn"
          style={{ background: '#ef4444', color: '#fff' }}
          onPointerDown={(e) => { e.stopPropagation(); exitGame(); }}
        >
          Exit
        </button>
      </div>
    </Overlay>
  );

  const PausedOverlay = () => (
    <Overlay onClick={resumeGame} hint="Tap anywhere to continue">
      <h2 className="text-5xl font-bold text-white mb-2 glow-text">Paused</h2>
      <p className="text-blue-200 text-lg">Game is paused</p>
      <div className="glass-card mt-4" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          className="hud-btn"
          style={{ background: '#0ea5e9', color: '#fff' }}
        >
          Tap to Continue
        </button>
        <button
          className="hud-btn"
          style={{ background: '#ef4444', color: '#fff' }}
          onPointerDown={(e) => { e.stopPropagation(); exitGame(); }}
        >
          Exit
        </button>
      </div>
    </Overlay>
  );

  return (
    <div
      ref={wrapRef}
      className="fullscreen-game"
      style={{ position: 'fixed', touchAction: 'none' }}
    >
      <style>{`
        body, html {
          margin: 0;
          padding: 0;
          overflow: hidden;
          position: fixed;
          width: 100%;
          height: 100%;
        }
        .fullscreen-game {
          position: fixed;
          inset: 0;
          width: 100vw;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(to bottom right, #164e63, #1e3a8a, #312e81);
        }
        .overlay {
          position: fixed;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          text-align: center;
          padding: 16px;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          cursor: pointer;
          z-index: 10;
        }
        .hint {
          color: #dbeafe;
          font-size: 14px;
          opacity: 0.9;
        }
        .hud-btn {
          padding: 12px 20px;
          border-radius: 12px;
          font-weight: 800;
          border: none;
          cursor: pointer;
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
          font-size: 16px;
        }
        .pause-btn {
          position: fixed;
          top: 16px;
          right: 16px;
          z-index: 11;
          padding: 10px 18px;
          background: rgba(14, 165, 233, 0.9);
          color: white;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 12px;
          font-weight: 800;
          font-size: 16px;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          backdrop-filter: blur(8px);
        }
        .pause-btn:active {
          transform: scale(0.95);
        }
        .touch-target {
          min-height: 48px;
          min-width: 120px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        canvas {
          width: 100vw !important;
          height: 100vh !important;
          display: block;
        }
      `}</style>

      {phase === 'playing' && (
        <button
          className="pause-btn"
          onPointerDown={(e) => pauseGame(e)}
        >
          ⏸ Pause
        </button>
      )}

      <canvas
        ref={canvasRef}
        width={640}
        height={360}
      />

      {phase === 'intro' && <IntroOverlay />}
      {phase === 'paused' && <PausedOverlay />}
      {phase === 'gameover' && <GameOverOverlay />}
    </div>
  );
}

function Overlay({ children, onClick, hint }) {
  return (
    <div className="overlay" onPointerDown={onClick}>
      {children}
      <div className="hint">{hint}</div>
    </div>
  );
}

function drawPig(ctx, x, y, frame, isJumping) {
  ctx.save();
  ctx.translate(x, y - 20); // Adjusted to touch ground properly

  // Body
  ctx.fillStyle = '#fca5a5';
  ctx.beginPath();
  ctx.ellipse(0, 0, 25, 18, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#f87171';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Head
  ctx.fillStyle = '#fca5a5';
  ctx.beginPath();
  ctx.arc(20, -5, 15, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Snout
  ctx.fillStyle = '#fb923c';
  ctx.beginPath();
  ctx.ellipse(30, -5, 8, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Nostrils
  ctx.fillStyle = '#7c2d12';
  ctx.beginPath();
  ctx.arc(28, -7, 2, 0, Math.PI * 2);
  ctx.arc(28, -3, 2, 0, Math.PI * 2);
  ctx.fill();

  // Eye
  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.arc(22, -12, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.arc(23, -12, 2, 0, Math.PI * 2);
  ctx.fill();

  // Ear
  ctx.fillStyle = '#fca5a5';
  ctx.beginPath();
  ctx.moveTo(15, -18);
  ctx.lineTo(12, -25);
  ctx.lineTo(18, -20);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Legs (animated when running, still when jumping)
  const legOffset = isJumping ? 0 : Math.sin(frame * 0.3) * 3;
  ctx.fillStyle = '#fca5a5';
  
  // Front leg
  ctx.fillRect(12, 15, 6, 5 + legOffset);
  // Back leg
  ctx.fillRect(-8, 15, 6, 5 - legOffset);

  // Tail (curly)
  ctx.strokeStyle = '#f87171';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(-20, -5, 6, 0, Math.PI * 1.5);
  ctx.stroke();

  ctx.restore();
}

function drawCloud(ctx, x, y) {
  ctx.beginPath();
  ctx.arc(x, y, 15, 0, Math.PI * 2);
  ctx.arc(x + 15, y, 20, 0, Math.PI * 2);
  ctx.arc(x + 30, y, 15, 0, Math.PI * 2);
  ctx.fill();
}