// FlappyBird.js — Easy mode + original vector bird + tap-to-start + flip-on-tap
import React, { useEffect, useRef, useState } from 'react';

// tiny localStorage-only helper for scores
const scoreStore = {
  get: () => {
    try { const v = localStorage.getItem('flappy-highscore'); return v ? parseInt(v) : 0; }
    catch { return 0; }
  },
  set: (n) => { try { localStorage.setItem('flappy-highscore', String(n)); } catch {} }
};

const EASY = {
  GRAVITY: 0.18,     // slower fall
  JUMP:    -4.2,     // gentler jump
  SPEED:   1.1,      // slower pipes
  PIPE_W:  60,
  GAP:     200,      // bigger gap to fly through
  SPAWN:   120       // frames per new pipe (≈2s @ 60fps)
};

// Where to send users when they quit/exit:
// change this to your actual "Play a Game" route (e.g. "/games" or "/play-game")


export default function FlappyBird({ onBack }) {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
  const [phase, setPhase] = useState('intro'); // 'intro' | 'playing' | 'paused' | 'gameover'
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(scoreStore.get());
  const rafRef = useRef(0);      // holds the current requestAnimationFrame id
  const phaseRef = useRef(phase); // mirror phase for the loop closure
  const suppressNextFlapRef = useRef(false); // prevents the first flap after resume

  const gameRef = useRef({
    bird: { x: 70, y: 240, vel: 0, spin: 0, wing: 0 },
    pipes: [],
    score: 0,
    frame: 0,
    over: false
  });

  useEffect(() => { setHighScore(scoreStore.get()); }, []);
  useEffect(() => { phaseRef.current = phase; }, [phase]);

  // Start / Restart helpers
  const resetGame = () => {
    const c = canvasRef.current;
    const h = c ? c.height : 600;
    gameRef.current = {
      bird: { x: 70, y: h * 0.4, vel: 0, spin: 0, wing: 0 },
      pipes: [],
      score: 0,
      frame: 0,
      over: false
    };
    setScore(0);
  };

  const startGame = () => {
    resetGame();
    setPhase('playing');
  };

  // New: pause / resume / exit
  const pauseGame = (e) => {
    e?.stopPropagation?.();
    // stop the loop immediately
    cancelAnimationFrame(rafRef.current);
    setPhase('paused');
  };
  const resumeGame = (suppressNext = true) => {
    if (suppressNext) suppressNextFlapRef.current = true;
    setPhase('playing');
  };
const exitGame = () => {
  if (onBack) onBack();
};

  // Input (tap/click/space) → jump + flip
  const useJumpHandlers = (enabled) => {
    useEffect(() => {
      if (!enabled) return;
      const onJump = (ev) => {
        // ignore key repeats except Space
        if (ev.type === 'keydown' && ev.code !== 'Space') return;
        // if we just resumed from pause, consume this event without flapping
        if (suppressNextFlapRef.current) {
          suppressNextFlapRef.current = false;
          return;
        }
        const g = gameRef.current;
        if (g.over) return;
        g.bird.vel = EASY.JUMP;
        g.bird.spin = Math.PI;     // add a quick 180° flip
        g.bird.wing = 1;           // kick wing animation
      };
      const handlers = [
        ['pointerdown', onJump],
        ['keydown', onJump]
      ];
      handlers.forEach(([t, fn]) => window.addEventListener(t, fn, { passive: true }));
      // also allow tapping the overlay (intro/gameover)
      if (wrapRef.current) wrapRef.current.addEventListener('pointerdown', onJump, { passive: true });

      return () => {
        handlers.forEach(([t, fn]) => window.removeEventListener(t, fn));
        if (wrapRef.current) wrapRef.current.removeEventListener('pointerdown', onJump);
      };
    }, [enabled]);
  };

  // Game loop (only when playing)
  useJumpHandlers(phase === 'playing');

// Pause when the tab/app is hidden (saves heat/battery)
useEffect(() => {
  const onVis = () => {
    if (document.hidden && phase === 'playing') setPhase('paused');
  };
  document.addEventListener('visibilitychange', onVis);
  return () => document.removeEventListener('visibilitychange', onVis);
}, [phase]);

  useEffect(() => {
    if (phase !== 'playing') return;
    const canvas = canvasRef.current, ctx = canvas.getContext('2d', { alpha: false });
    const g = gameRef.current;

  // === performance: cap FPS + scale for Hi-DPI screens ===
  const TARGET_FPS = 60;
  const FRAME_MS = 1000 / TARGET_FPS;
  let lastTime = 0;
  const DPR = Math.min(window.devicePixelRatio || 1, 1.5);
  const CSS_W = 420, CSS_H = 640;
  // draw in "CSS pixels", canvas stores device pixels
  canvas.style.width = CSS_W + 'px';
  canvas.style.height = CSS_H + 'px';
  canvas.width  = Math.round(CSS_W * DPR);
  canvas.height = Math.round(CSS_H * DPR);
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  const W = CSS_W, H = CSS_H;

  const loop = (now = performance.now()) => {
      // if paused or game over, bail and DON'T schedule the next frame
      if (phaseRef.current !== 'playing' || g.over) return;
    // FPS cap
    if (now - lastTime < FRAME_MS) { 
      rafRef.current = requestAnimationFrame(loop); 
      return; }
    lastTime = now;
      g.frame++;

    // Himalaya background (sky + parallax ridges)
    drawHimalayas(ctx, W, H, g.frame);

      // physics
      g.bird.vel += EASY.GRAVITY;
      g.bird.y   += g.bird.vel;
      // decay spin + wing
      g.bird.spin *= 0.86;
      g.bird.wing *= 0.90;

      // spawn pipes
      if (g.frame % EASY.SPAWN === 0) {
        const margin = 60;
      const gapY = Math.random() * (H - EASY.GAP - margin * 2) + margin;
      g.pipes.push({ x: W, y: gapY, scored: false });
      }

      // pipes
      ctx.fillStyle = '#2ecc71';
      for (let i = g.pipes.length - 1; i >= 0; i--) {
        const p = g.pipes[i];
        p.x -= EASY.SPEED;

        // draw top & bottom
      ctx.fillRect(p.x, 0, EASY.PIPE_W, p.y);
      ctx.fillRect(p.x, p.y + EASY.GAP, EASY.PIPE_W, H - (p.y + EASY.GAP));

        // score when passed
        if (!p.scored && p.x + EASY.PIPE_W < g.bird.x) {
          p.scored = true;
          g.score++;
          setScore(g.score);
        }

        // remove offscreen
        if (p.x + EASY.PIPE_W < 0) g.pipes.splice(i, 1);

        // collision (approx bird radius 14)
        const bx = g.bird.x, by = g.bird.y, r = 14;
        const hitPipeX = bx + r > p.x && bx - r < p.x + EASY.PIPE_W;
        const hitPipeY = by - r < p.y || by + r > p.y + EASY.GAP;
        if (hitPipeX && hitPipeY) g.over = true;
      }

      // bounds
      if (g.bird.y + 14 > H || g.bird.y - 14 < 0) g.over = true;

      // bird
      drawVectorBird(ctx, g.bird.x, g.bird.y, g.bird.vel, g.bird.spin, g.bird.wing);

      // score
      ctx.fillStyle = 'white';
      ctx.font = 'bold 32px Poppins, Arial, sans-serif';
      ctx.fillText(String(g.score), 20, 50);

      if (g.over) {
        // persist HS
        if (g.score > highScore) {
          scoreStore.set(g.score);
          setHighScore(g.score);
        }
        setPhase('gameover');
        return;
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    // IMPORTANT: cancel the loop if we leave 'playing'
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Overlays
  const IntroOverlay = () => (
    <Overlay onClick={startGame} hint="Tap anywhere to start">
      <h2 className="text-5xl font-bold text-white mb-2 glow-text">Flappy Bird — Easy</h2>
      <p className="text-blue-200 text-lg">Gentle gravity • Slow pipes • Bigger gap</p>
      {highScore > 0 && <p className="text-yellow-300 text-xl mt-3">High Score: {highScore}</p>}
      <div className="glass-card mt-4" style={{ display:'flex', gap:12 }}>
        <div className="glass-btn btn-blue text-xl touch-target">Tap to Start</div>
        <button
          className="hud-btn"
          style={{ background:'#ef4444', color:'#fff' }}
          onPointerDown={(e)=> { e.stopPropagation(); exitGame(); }}
        >
          Exit
        </button>
      </div>
    </Overlay>
  );

  const GameOverOverlay = () => (
    <Overlay
      onClick={() => { startGame(); }}
      hint="Tap anywhere to restart"
    >
      <h2 className="text-5xl font-bold text-white mb-2 glow-text">Game Over</h2>
      <p className="text-blue-200 text-xl mb-2">Score: {score}</p>
      <p className="text-yellow-300 text-xl">High Score: {Math.max(highScore, score)}</p>
      <div className="glass-card mt-4">
        <div className="glass-btn btn-blue text-xl touch-target">Tap to Restart</div>
      </div>
    </Overlay>
  );

  const PausedOverlay = ({ onResume, onExit }) => (
    <Overlay
      onClick={(e) => { e.stopPropagation(); onResume(); }}  // first tap continues but doesn't flap
      hint="Tap anywhere to continue"
    >
      <h2 className="text-5xl font-bold text-white mb-2 glow-text">Paused</h2>
      <p className="text-blue-200 text-lg">Game is paused. Your score is safe.</p>
      <div className="glass-card mt-4" style={{ display:'flex', gap:12 }}>
        <button
          className="hud-btn"
          style={{ background:'#0ea5e9', color:'#fff' }}
        >
          Tap to Continue
        </button>
        <button
          className="hud-btn"
          style={{ background:'#ef4444', color:'#fff' }}
          onPointerDown={(e)=> { e.stopPropagation(); onExit(); }}
        >
          Exit
        </button>
      </div>
    </Overlay>
  );

  return (
    <div
      ref={wrapRef}
      className="min-h-screen bg-gradient-to-br from-cyan-900 via-blue-900 to-indigo-900 p-4 flex flex-col items-center justify-center pb-24"
      style={{ position: 'relative' }}
      onPointerDown={(e) => {
        if (phase === 'intro') startGame();
      }}
    >
      <style>{`
        .overlay {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          text-align: center;
          padding: 16px;
          background: rgba(0,0,0,0.35);
          backdrop-filter: blur(3px);
          -webkit-backdrop-filter: blur(3px);
          cursor: pointer;
          z-index: 10;
        }
        .hint {
          color: #dbeafe;
          font-size: 14px;
          opacity: .9;
        }
        .hud-btn {
          padding: 10px 16px;
          border-radius: 12px;
          font-weight: 800;
          border: none;
          cursor: pointer;
          box-shadow: 0 6px 20px rgba(0,0,0,.25);
        }
      `}</style>

      {/* Title & HS (visible while playing too) */}
      <div className="text-center mb-4">
        <h2 className="text-4xl font-bold text-white mb-1 glow-text">Flappy Bird</h2>
        <p className="text-blue-200">Tap / Space to flap — the bird flips on tap</p>
        {highScore>0 && <p className="text-yellow-300 text-lg mt-1">High Score: {highScore}</p>}
      </div>

      {/* Pause button (only while playing) */}
      {phase === 'playing' && (
        <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 11 }}>
          <button
            className="hud-btn"
            style={{ background:'#0ea5e9', color:'#fff' }}
            onPointerDown={(e)=> pauseGame(e)}
          >
            Pause
          </button>
        </div>
      )}

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={420}
        height={640}
        className="border-4 border-white rounded-3xl shadow-2xl bg-sky-400"
      />

      {/* Overlays */}
      {phase === 'intro' && <IntroOverlay />}
      {phase === 'paused' && (
        <PausedOverlay
          onResume={() => resumeGame(true)}  // suppress first flap after resume
          onExit={exitGame}
        />
      )}
      {phase === 'gameover' && <GameOverOverlay />}
    </div>
  );
}

/* ----------------- helpers ----------------- */
function Overlay({ children, onClick, hint }) {
  return (
    <div className="overlay" onPointerDown={onClick}>
      {children}
      <div className="hint">{hint}</div>
    </div>
  );
}

// cute original vector bird (triangle body, wing, beak, eye) with rotation
function drawVectorBird(ctx, x, y, vel, spinAngle, wingPhase) {
  ctx.save();
  ctx.translate(x, y);

  // tilt with velocity + quick flip spin on tap
  const tilt = clamp(vel * 0.08, -0.6, 1.0); // radians
  const spin = spinAngle * 0.6;              // dampened spin
  ctx.rotate(tilt + spin);

  // body
  const bodyR = 16;
  const grd = ctx.createLinearGradient(-bodyR, -bodyR, bodyR, bodyR);
  grd.addColorStop(0, '#ffdd66');
  grd.addColorStop(1, '#ffb347');
  ctx.fillStyle = grd;
  roundedRect(ctx, -bodyR, -bodyR, bodyR*2, bodyR*2, 10);
  ctx.fill();

  // wing (flap a little on tap)
  const flap = Math.sin((1 - wingPhase) * Math.PI) * 8 * wingPhase; // 0..~8
  ctx.save();
  ctx.translate(-2, 0);
  ctx.rotate(-0.7 + wingPhase * 0.3);
  ctx.fillStyle = '#f4a300';
  roundedRect(ctx, -10, -6 - flap*0.4, 18, 12 + flap*0.5, 6);
  ctx.fill();
  ctx.restore();

  // beak
  ctx.fillStyle = '#ff6b35';
  ctx.beginPath();
  ctx.moveTo(bodyR - 2, -3);
  ctx.lineTo(bodyR + 10, 0);
  ctx.lineTo(bodyR - 2, 3);
  ctx.closePath();
  ctx.fill();

  // eye
  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.arc(6, -5, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#222';
  ctx.beginPath();
  ctx.arc(7, -5, 2, 0, Math.PI * 2);
  ctx.fill();

  // outline
  ctx.strokeStyle = 'rgba(0,0,0,.15)';
  ctx.lineWidth = 2;
  roundedRect(ctx, -bodyR, -bodyR, bodyR*2, bodyR*2, 10);
  ctx.stroke();

  ctx.restore();
}

function roundedRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w * 0.5, h * 0.5);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

// animated Himalaya-style ridges with subtle snow caps
function drawHimalayas(ctx, w, h, frame) {
  // sky gradient
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, '#9be2ff'); // high sky
  sky.addColorStop(1, '#e8f6ff'); // horizon haze
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  const ridge = (x, t, k1, k2) =>
    (Math.sin((x + t) * k1) * 0.6 + Math.cos((x + t) * k2) * 0.4 + 1) * 0.5;

  function drawRidge(baseY, amp, speed, color, snowLine, capColor) {
    const t = frame * speed;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, h);
    ctx.lineTo(0, baseY);
    for (let x = 0; x <= w; x += 4) {
      const y = baseY - ridge(x, t, 0.010, 0.017) * amp;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    // simple snow caps on taller peaks
    if (capColor) {
      ctx.fillStyle = capColor;
      for (let x = 24; x < w; x += 92) {
        const y = baseY - ridge(x, t, 0.010, 0.017) * amp;
        if (y < snowLine) {
          ctx.beginPath();
          ctx.moveTo(x, y - 10);
          ctx.lineTo(x - 12, y + 6);
          ctx.lineTo(x + 12, y + 6);
          ctx.closePath();
          ctx.fill();
        }
      }
    }
  }

  // far ranges (cooler, lighter)
  drawRidge(h * 0.70, 60, 0.10, '#e8f5ff', h * 0.62, '#ffffff');
  // mid ranges
  drawRidge(h * 0.78, 80, 0.18, '#d0e6fb', h * 0.70, '#f7fbff');
  // foreground range
  drawRidge(h * 0.88, 90, 0.25, '#b7d4f5', h * 0.80, '#ffffffcc');

  // valley mist
  const mist = ctx.createLinearGradient(0, h * 0.78, 0, h);
  mist.addColorStop(0, 'rgba(255,255,255,0)');
  mist.addColorStop(1, 'rgba(255,255,255,0.45)');
  ctx.fillStyle = mist;
  ctx.fillRect(0, h * 0.78, w, h * 0.22);
}
