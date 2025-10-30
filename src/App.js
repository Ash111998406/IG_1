import React, { useState, useEffect, useRef } from 'react';
import { Home, User, Gamepad2, MessageSquare, ArrowLeft, Play } from 'lucide-react';

const GamePortal = () => {
  const [page, setPage] = useState('home');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [messages, setMessages] = useState([]);

  const HomePage = () => (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="text-center space-y-8 animate-fade-in">
        <div className="space-y-4">
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-2 animate-bounce-slow">
            Welcome
          </h1>
          <p className="text-xl text-purple-200">Explore, Play, Connect</p>
        </div>
        
        <div className="space-y-4 max-w-md mx-auto">
          <button
            onClick={() => setPage('bio')}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-semibold py-4 px-8 rounded-2xl shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3"
          >
            <User size={24} />
            <span className="text-lg">My Bio</span>
          </button>
          
          <button
            onClick={() => setPage('games')}
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold py-4 px-8 rounded-2xl shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3"
          >
            <Gamepad2 size={24} />
            <span className="text-lg">Play a Game</span>
          </button>
          
          <button
            onClick={() => setPage('message')}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-4 px-8 rounded-2xl shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3"
          >
            <MessageSquare size={24} />
            <span className="text-lg">Send Anonymous Message</span>
          </button>
        </div>
      </div>
    </div>
  );

  const BioPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-4 md:p-8">
      <button
        onClick={() => setPage('home')}
        className="mb-6 flex items-center gap-2 text-white hover:text-purple-200 transition-colors"
      >
        <ArrowLeft size={20} />
        <span>Back</span>
      </button>
      
      <div className="max-w-3xl mx-auto bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-32 h-32 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full mx-auto mb-4 flex items-center justify-center">
            <User size={64} className="text-white" />
          </div>
          <h2 className="text-4xl font-bold text-white mb-2">About Me</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-purple-400 to-pink-400 mx-auto"></div>
        </div>
        
        <div className="space-y-6 text-white/90 leading-relaxed">
          <p className="text-lg">
            Hello! I'm a passionate developer and gamer who loves creating interactive experiences. 
            This portal is my digital playground where I share my creations with the world.
          </p>
          
          <div className="bg-white/5 rounded-2xl p-6">
            <h3 className="text-2xl font-semibold text-purple-300 mb-3">My Journey</h3>
            <p>
              My journey into game development started with a simple curiosity about how games work. 
              Over time, I've learned to create fun, engaging experiences that bring joy to players. 
              This collection represents my ongoing adventure in coding and creativity.
            </p>
          </div>
          
          <div className="bg-white/5 rounded-2xl p-6">
            <h3 className="text-2xl font-semibold text-blue-300 mb-3">What I Do</h3>
            <p>
              I love bringing classic games to life with modern web technologies. Each game here 
              is crafted with care, optimized for mobile play, and designed to provide instant fun 
              without any downloads or installations.
            </p>
          </div>
          
          <div className="bg-white/5 rounded-2xl p-6">
            <h3 className="text-2xl font-semibold text-green-300 mb-3">My Vision</h3>
            <p>
              I believe games should be accessible to everyone. That's why I'm building this 
              collection of browser-based games that anyone can enjoy, anywhere, anytime. More 
              games are coming soon, so stay tuned!
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const GamesPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 p-4 md:p-8">
      <button
        onClick={() => setPage('home')}
        className="mb-6 flex items-center gap-2 text-white hover:text-blue-200 transition-colors"
      >
        <ArrowLeft size={20} />
        <span>Back</span>
      </button>
      
      <div className="max-w-4xl mx-auto">
        <h2 className="text-5xl font-bold text-white text-center mb-12">Game Collection</h2>
        
        <div className="grid gap-6">
          <div
            onClick={() => setPage('flappy')}
            className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl hover:bg-white/20 transition-all duration-300 cursor-pointer transform hover:scale-105"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-3xl font-bold text-white mb-3">Flappy Bird</h3>
                <p className="text-purple-200 text-lg mb-4">
                  The classic game that took the world by storm! Tap to flap and navigate through pipes.
                </p>
                <div className="flex gap-2 flex-wrap">
                  <span className="bg-blue-500/50 text-white px-4 py-1 rounded-full text-sm">Arcade</span>
                  <span className="bg-purple-500/50 text-white px-4 py-1 rounded-full text-sm">Classic</span>
                  <span className="bg-pink-500/50 text-white px-4 py-1 rounded-full text-sm">Addictive</span>
                </div>
              </div>
              <Play size={48} className="text-white ml-4" />
            </div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-8 text-center border-2 border-dashed border-white/20">
            <Gamepad2 size={48} className="text-white/40 mx-auto mb-4" />
            <p className="text-white/60 text-lg">More games coming soon...</p>
          </div>
        </div>
      </div>
    </div>
  );

  const MessagePage = () => {
    const handleSubmit = async () => {
      if (message.trim()) {
        try {
          await window.storage.set(`message:${Date.now()}`, JSON.stringify({
            message: message,
            timestamp: new Date().toISOString()
          }), true);
          setSubmitted(true);
          setMessage('');
          setTimeout(() => setSubmitted(false), 3000);
        } catch (error) {
          console.error('Failed to save message:', error);
        }
      }
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-emerald-900 to-teal-900 p-4 md:p-8">
        <button
          onClick={() => setPage('home')}
          className="mb-6 flex items-center gap-2 text-white hover:text-green-200 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>
        
        <div className="max-w-2xl mx-auto bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <MessageSquare size={64} className="text-white mx-auto mb-4" />
            <h2 className="text-4xl font-bold text-white mb-2">Send Anonymous Message</h2>
            <p className="text-green-200">Your identity remains completely private</p>
          </div>
          
          {submitted ? (
            <div className="bg-green-500/20 border-2 border-green-400 rounded-2xl p-6 text-center">
              <p className="text-white text-xl font-semibold">✨ Message sent successfully! ✨</p>
              <p className="text-green-200 mt-2">Thank you for sharing your thoughts</p>
            </div>
          ) : (
            <div className="space-y-6">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your anonymous message here..."
                className="w-full h-48 bg-white/10 border-2 border-white/20 rounded-2xl p-4 text-white placeholder-white/50 focus:outline-none focus:border-green-400 transition-colors resize-none text-lg"
              />
              
              <button
                onClick={handleSubmit}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-4 px-8 rounded-2xl shadow-lg transform hover:scale-105 transition-all duration-300 text-lg"
              >
                Send Message
              </button>
              
              <p className="text-white/60 text-sm text-center">
                Your message will be sent anonymously. No personal information is collected.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const FlappyBird = () => {
    const canvasRef = useRef(null);
    const [gameStarted, setGameStarted] = useState(false);
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);
    const gameStateRef = useRef({
      bird: { x: 50, y: 200, velocity: 0 },
      pipes: [],
      score: 0,
      gameOver: false,
      frame: 0
    });

    useEffect(() => {
      const loadHighScore = async () => {
        try {
          const result = await window.storage.get('flappy-highscore');
          if (result) {
            setHighScore(parseInt(result.value));
          }
        } catch (error) {
          console.log('No high score found');
        }
      };
      loadHighScore();
    }, []);

    useEffect(() => {
      if (!gameStarted) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const game = gameStateRef.current;

      const GRAVITY = 0.5;
      const JUMP_STRENGTH = -8;
      const PIPE_WIDTH = 60;
      const PIPE_GAP = 150;
      const PIPE_SPEED = 2;

      game.bird = { x: 50, y: 200, velocity: 0 };
      game.pipes = [];
      game.score = 0;
      game.gameOver = false;
      game.frame = 0;

      const jump = () => {
        if (!game.gameOver) {
          game.bird.velocity = JUMP_STRENGTH;
        }
      };

      const handleClick = () => jump();
      const handleKeyPress = (e) => {
        if (e.code === 'Space') jump();
      };

      canvas.addEventListener('click', handleClick);
      window.addEventListener('keydown', handleKeyPress);

      const gameLoop = () => {
        if (game.gameOver) return;

        game.frame++;
        ctx.fillStyle = '#4facfe';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        game.bird.velocity += GRAVITY;
        game.bird.y += game.bird.velocity;

        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(game.bird.x, game.bird.y, 15, 0, Math.PI * 2);
        ctx.fill();

        if (game.frame % 90 === 0) {
          const pipeY = Math.random() * (canvas.height - PIPE_GAP - 100) + 50;
          game.pipes.push({ x: canvas.width, y: pipeY, scored: false });
        }

        ctx.fillStyle = '#2ecc71';
        for (let i = game.pipes.length - 1; i >= 0; i--) {
          const pipe = game.pipes[i];
          pipe.x -= PIPE_SPEED;

          ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.y);
          ctx.fillRect(pipe.x, pipe.y + PIPE_GAP, PIPE_WIDTH, canvas.height);

          if (pipe.x + PIPE_WIDTH < 0) {
            game.pipes.splice(i, 1);
          }

          if (!pipe.scored && pipe.x + PIPE_WIDTH < game.bird.x) {
            game.score++;
            setScore(game.score);
            pipe.scored = true;
          }

          if (
            game.bird.x + 15 > pipe.x &&
            game.bird.x - 15 < pipe.x + PIPE_WIDTH &&
            (game.bird.y - 15 < pipe.y || game.bird.y + 15 > pipe.y + PIPE_GAP)
          ) {
            game.gameOver = true;
          }
        }

        if (game.bird.y + 15 > canvas.height || game.bird.y - 15 < 0) {
          game.gameOver = true;
        }

        ctx.fillStyle = 'white';
        ctx.font = 'bold 32px Arial';
        ctx.fillText(game.score, 20, 50);

        if (game.gameOver) {
          if (game.score > highScore) {
            setHighScore(game.score);
            window.storage.set('flappy-highscore', game.score.toString()).catch(console.error);
          }
          ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = 'white';
          ctx.font = 'bold 48px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2 - 40);
          ctx.font = 'bold 32px Arial';
          ctx.fillText(`Score: ${game.score}`, canvas.width / 2, canvas.height / 2 + 10);
          ctx.fillText(`High Score: ${Math.max(highScore, game.score)}`, canvas.width / 2, canvas.height / 2 + 50);
          ctx.font = '24px Arial';
          ctx.fillText('Click or press Space to restart', canvas.width / 2, canvas.height / 2 + 100);
          canvas.removeEventListener('click', handleClick);
          window.removeEventListener('keydown', handleKeyPress);
          canvas.addEventListener('click', () => setGameStarted(false));
          return;
        }

        requestAnimationFrame(gameLoop);
      };

      gameLoop();

      return () => {
        canvas.removeEventListener('click', handleClick);
        window.removeEventListener('keydown', handleKeyPress);
      };
    }, [gameStarted, highScore]);

    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-900 via-blue-900 to-indigo-900 p-4 flex flex-col items-center justify-center">
        <button
          onClick={() => setPage('games')}
          className="mb-6 flex items-center gap-2 text-white hover:text-blue-200 transition-colors self-start"
        >
          <ArrowLeft size={20} />
          <span>Back to Games</span>
        </button>

        <div className="text-center mb-6">
          <h2 className="text-5xl font-bold text-white mb-2">Flappy Bird</h2>
          <p className="text-blue-200 text-lg">Tap or press Space to fly!</p>
          {highScore > 0 && (
            <p className="text-yellow-300 text-xl mt-2">High Score: {highScore}</p>
          )}
        </div>

        {!gameStarted ? (
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-12 text-center">
            <button
              onClick={() => setGameStarted(true)}
              className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-bold py-6 px-12 rounded-2xl shadow-2xl transform hover:scale-110 transition-all duration-300 text-2xl"
            >
              Start Game
            </button>
          </div>
        ) : (
          <canvas
            ref={canvasRef}
            width={400}
            height={600}
            className="border-4 border-white rounded-3xl shadow-2xl bg-sky-400"
          />
        )}
      </div>
    );
  };

  return (
    <>
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
      `}</style>
      
      {page === 'home' && <HomePage />}
      {page === 'bio' && <BioPage />}
      {page === 'games' && <GamesPage />}
      {page === 'message' && <MessagePage />}
      {page === 'flappy' && <FlappyBird />}
    </>
  );
};

export default GamePortal;
