import React, { useState } from 'react';
import { Home, User, Gamepad2, MessageSquare, ArrowLeft, Play } from 'lucide-react';
import FlappyBird from './FlappyBird';
 import Tetris from './Tetris';
 import PigRunner from './PigRunner';
 import Minesweeper from './Minesweeper';
 import MemoryMatch from './MemoryMatch';
 import Pong from './Pong';

const EMAIL_ENDPOINT = "https://formspree.io/f/mpwoyydd";

const HomePage = ({ setPage }) => {

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="text-center space-y-8 animate-fade-in">
        <div className="space-y-4">
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-2 animate-bounce-slow">
            Welcome
          </h1>
          <p className="text-xl text-purple-200">Explore, Play, Connect</p>
        </div>
        
        <div className="space-y-4 max-w-md mx-auto btn-stack">
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
};

const BioPage = ({ onBack }) => (
  <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-4 md:p-8 pb-24">
    <div className="max-w-3xl mx-auto glass-card fade-in bio-content">
      <div className="text-center bio-header">
        <div className="w-32 h-32 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full mx-auto flex items-center justify-center float">
          <User size={64} className="text-white" />
        </div>
        <h2 className="text-4xl font-bold text-white">About Me</h2>
        <div className="w-24 h-1 bg-gradient-to-r from-purple-400 to-pink-400 mx-auto"></div>
      </div>
      
      <div className="bio-text">
        <p className="text-lg bio-intro">
            Hey there! I’m a developer who loves building fun, interactive experiences.
            This space is my little digital playground.
        </p>
        
        <div className="glass-card bio-section">
          <h3 className="text-2xl font-semibold text-purple-300">My Journey</h3>
          <p>
            I love staying active, whether it’s hitting the gym, running, or trying new workouts.
            For me, it’s not just about fitness; it’s about building discipline and feeling alive.
          </p>
        </div>
        
        <div className="glass-card bio-section">
          <h3 className="text-2xl font-semibold text-blue-300">What I Do</h3>
          <p>
            --------------
          </p>
        </div>
        
        <div className="glass-card bio-section">
          <h3 className="text-2xl font-semibold text-green-300">My Vision</h3>
          <p>
            Drift with the clouds
          </p>
        </div>
      </div>
    </div>
    
    <button
      onClick={onBack}
      className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/10 backdrop-blur-md px-6 py-3 rounded-full text-white hover:bg-white/20 transition-all border border-white/20 shadow-lg z-50"
    >
      <ArrowLeft size={20} />
      <span>Back to Home</span>
    </button>
  </div>
);

const GamesPage = ({ onBack, onSelectGame }) => (
  <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 p-4 md:p-8 pb-24">
    <div className="max-w-4xl mx-auto games-content">
      <h2 className="text-5xl font-bold text-white text-center glow-text games-title">Game Collection</h2>
      
      <div className="games-grid">
        <div
          onClick={() => onSelectGame('flappy')}
          className="glass-card cursor-pointer fade-in game-card"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-3xl font-bold text-white game-title">Flappy Bird</h3>
              <p className="text-purple-200 text-lg game-description">
                The classic game that took the world by storm! Tap to flap and navigate through pipes.
              </p>
              <div className="flex gap-2 flex-wrap game-tags">
                <span className="bg-blue-500/50 text-white px-4 py-1 rounded-full text-sm">Arcade</span>
                <span className="bg-purple-500/50 text-white px-4 py-1 rounded-full text-sm">Classic</span>
                <span className="bg-pink-500/50 text-white px-4 py-1 rounded-full text-sm">Addictive</span>
              </div>
            </div>
            <Play size={48} className="text-white ml-4 float" />
          </div>
        </div>

    {/* Pig Runner */}
    <div onClick={() => onSelectGame('pig')} className="glass-card cursor-pointer fade-in game-card">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-3xl font-bold text-white game-title">Pig Runner</h3>
          <p className="text-purple-200 text-lg game-description">Jump over cacti. Faster over time.</p>
          <div className="flex gap-2 flex-wrap game-tags">
            <span className="bg-pink-500/50 text-white px-4 py-1 rounded-full text-sm">Runner</span>
            <span className="bg-yellow-500/50 text-white px-4 py-1 rounded-full text-sm">Arcade</span>
          </div>
        </div>
        <Play size={48} className="text-white ml-4 float" />
      </div>
    </div>

    {/* Tetris */}
    <div onClick={() => onSelectGame('tetris')} className="glass-card cursor-pointer fade-in game-card">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-3xl font-bold text-white game-title">Tetris</h3>
          <p className="text-purple-200 text-lg game-description">Stack and clear lines. Swipe/keys supported.</p>
          <div className="flex gap-2 flex-wrap game-tags">
            <span className="bg-blue-500/50 text-white px-4 py-1 rounded-full text-sm">Puzzle</span>
            <span className="bg-indigo-500/50 text-white px-4 py-1 rounded-full text-sm">Classic</span>
          </div>
        </div>
        <Play size={48} className="text-white ml-4 float" />
      </div>
    </div>

    {/* Minesweeper */}
    <div onClick={() => onSelectGame('mines')} className="glass-card cursor-pointer fade-in game-card">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-3xl font-bold text-white game-title">Minesweeper</h3>
          <p className="text-purple-200 text-lg game-description">Avoid the bombs, clear the field.</p>
          <div className="flex gap-2 flex-wrap game-tags">
            <span className="bg-green-500/50 text-white px-4 py-1 rounded-full text-sm">Logic</span>
            <span className="bg-gray-500/50 text-white px-4 py-1 rounded-full text-sm">Classic</span>
          </div>
        </div>
        <Play size={48} className="text-white ml-4 float" />
      </div>
    </div>
    {/* Memory Match */}
    <div onClick={() => onSelectGame('memory')} className="glass-card cursor-pointer fade-in game-card">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-3xl font-bold text-white game-title">Memory Match</h3>
          <p className="text-purple-200 text-lg game-description">Flip and find all pairs.</p>
          <div className="flex gap-2 flex-wrap game-tags">
            <span className="bg-purple-500/50 text-white px-4 py-1 rounded-full text-sm">Casual</span>
            <span className="bg-pink-500/50 text-white px-4 py-1 rounded-full text-sm">Family</span>
          </div>
        </div>
        <Play size={48} className="text-white ml-4 float" />
      </div>
    </div>
    {/* Pong */}
    <div onClick={() => onSelectGame('pong')} className="glass-card cursor-pointer fade-in game-card">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-3xl font-bold text-white game-title">Pong</h3>
          <p className="text-purple-200 text-lg game-description">Beat the AI paddle. Swipe or keys.</p>
          <div className="flex gap-2 flex-wrap game-tags">
            <span className="bg-emerald-500/50 text-white px-4 py-1 rounded-full text-sm">Arcade</span>
            <span className="bg-blue-500/50 text-white px-4 py-1 rounded-full text-sm">Classic</span>
          </div>
        </div>
        <Play size={48} className="text-white ml-4 float" />
      </div>
    </div>

        <div className="glass-card text-center border-2 border-dashed border-white/20 fade-in coming-soon">
          <Gamepad2 size={48} className="text-white/40 mx-auto wiggle" />
          <p className="text-white/60 text-lg">More games coming soon...</p>
        </div>
      </div>
    </div>
    
    <button
      onClick={onBack}
      className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/10 backdrop-blur-md px-6 py-3 rounded-full text-white hover:bg-white/20 transition-all border border-white/20 shadow-lg z-50"
    >
      <ArrowLeft size={20} />
      <span>Back to Home</span>
    </button>
  </div>
);

const MessagePage = ({ onBack }) => {
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = async () => {
    if (!message.trim() || sending) {
      return;
    }

    setSending(true);
    
    try {
      const response = await fetch(EMAIL_ENDPOINT, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: message.trim() })
      });

      if (response.ok) {
        setSubmitted(true);
        setMessage('');
        setTimeout(() => {
          setSubmitted(false);
        }, 4000);
      } else {
        alert('Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please check your internet connection.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-emerald-900 to-teal-900 p-4 md:p-8 pb-24">
      <div className="max-w-2xl mx-auto glass-card fade-in message-container">
        <div className="text-center message-header">
          <MessageSquare size={64} className="text-white mx-auto float" />
          <h2 className="text-4xl font-bold text-white">Send Anonymous Message</h2>
          <p className="text-green-200">Your identity remains completely private</p>
        </div>
        
        {submitted ? (
          <div className="bg-green-500/20 border-2 border-green-400 rounded-2xl p-6 text-center pulse-glow success-message">
            <p className="text-white text-xl font-semibold">✨ Message sent successfully! ✨</p>
            <p className="text-green-200 mt-2">Thank you for sharing your thoughts</p>
          </div>
        ) : (
          <div className="message-form">
            <div className="textarea-wrapper">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your anonymous message here..."
                rows={8}
                disabled={sending}
                style={{
                  width: '100%',
                  padding: '16px 20px',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  border: '2px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '16px',
                  color: 'white',
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '16px',
                  lineHeight: '1.6',
                  resize: 'vertical',
                  outline: 'none',
                  transition: 'all 0.3s ease'
                }}
              />
            </div>
            
            <button
              onClick={handleSubmit}
              disabled={sending || !message.trim()}
              className="glass-btn btn-green w-full submit-button"
              style={{
                opacity: (sending || !message.trim()) ? 0.5 : 1,
                cursor: (sending || !message.trim()) ? 'not-allowed' : 'pointer'
              }}
            >
              {sending ? 'Sending...' : 'Send Message'}
            </button>
            
            <p className="text-white/60 text-sm text-center privacy-note">
              Your message will be sent anonymously. No personal information is collected.
            </p>
          </div>
        )}
      </div>
      
      <button
        onClick={onBack}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/10 backdrop-blur-md px-6 py-3 rounded-full text-white hover:bg-white/20 transition-all border border-white/20 shadow-lg z-50"
      >
        <ArrowLeft size={20} />
        <span>Back to Home</span>
      </button>
    </div>
  );
};

const GamePortal = () => {
  const [page, setPage] = useState('home');

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
        
        /* Bio Page Spacing */
        .bio-content {
          padding: 3rem 2rem;
        }
        .bio-header {
          margin-bottom: 3rem;
        }
        .bio-header > * {
          margin-bottom: 1.5rem;
        }
        .bio-text {
          display: flex;
          flex-direction: column;
          gap: 2.5rem;
        }
        .bio-intro {
          margin-bottom: 1rem;
        }
        .bio-section {
          padding: 2rem;
        }
        .bio-section h3 {
          margin-bottom: 1.5rem;
        }
        
        /* Games Page Spacing */
        .games-content {
          padding: 2rem 0;
        }
        .games-title {
          margin-bottom: 3rem;
        }
        .games-grid {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        .game-card {
          padding: 2rem;
        }
        .game-title {
          margin-bottom: 1.5rem;
        }
        .game-description {
          margin-bottom: 1.5rem;
        }
        .game-tags {
          margin-top: 1rem;
        }
        .coming-soon {
          padding: 3rem 2rem;
        }
        .coming-soon > * {
          margin-bottom: 1.5rem;
        }
        
        /* Message Page Spacing */
        .message-container {
          padding: 3rem 2rem;
        }
        .message-header {
          margin-bottom: 3rem;
        }
        .message-header > * {
          margin-bottom: 1.5rem;
        }
        .message-form {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        .textarea-wrapper {
          margin-bottom: 0.5rem;
        }
        .submit-button {
          margin-bottom: 0.5rem;
        }
        .success-message {
          padding: 2rem;
        }
        .success-message p:first-child {
          margin-bottom: 1rem;
        }
        
        @media (max-width: 768px) {
          .bio-content {
            padding: 2rem 1.5rem;
          }
          .bio-header {
            margin-bottom: 2.5rem;
          }
          .bio-text {
            gap: 2rem;
          }
          .bio-section {
            padding: 1.5rem;
          }
          .message-container {
            padding: 2rem 1.5rem;
          }
          .message-header {
            margin-bottom: 2.5rem;
          }
        }
      `}</style>
      
      {page === 'home' && <HomePage setPage={setPage} />}
      {page === 'bio' && <BioPage onBack={() => setPage('home')} />}
      {page === 'games' && <GamesPage onBack={() => setPage('home')} onSelectGame={(key) => setPage(key)} />}
      {page === 'message' && <MessagePage onBack={() => setPage('home')} />}
      {page === 'flappy' && <FlappyBird onBack={() => setPage('games')} />}
      {page === 'pig' && <PigRunner onBack={() => setPage('games')} />}
      {page === 'tetris' && <Tetris onBack={() => setPage('games')} />}
      {page === 'mines' && <Minesweeper onBack={() => setPage('games')} />}
      {page === 'memory' && <MemoryMatch onBack={() => setPage('games')} />}
      {page === 'pong' && <Pong onBack={() => setPage('games')} />}
    </>
  );
};

export default GamePortal;