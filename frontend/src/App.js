// src/App.js
import React, { useState, useEffect, useRef } from 'react';
import api from './services/api';
import LoginModal from './components/Auth/LoginModal';
import RegisterModal from './components/Auth/RegisterModal';
import MainApp from './MainApp';
import { generateSignedUrl, extractPathFromUrl } from './services/tokenService';

// ==================== Background Video Playlist Component ====================
const BackgroundPlaylistPlayer = () => {
  const [playlist, setPlaylist] = useState([]);
  const [signedPlaylist, setSignedPlaylist] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const videoRef = useRef(null);

  // Fetch playlist from database
  useEffect(() => {
    fetchPlaylist();
  }, []);

  const fetchPlaylist = async () => {
    try {
      const response = await api.get('/admin/background-videos/playlist');
      const rawPlaylist = response.data.playlist || [];
      console.log('Raw playlist:', rawPlaylist);
      
      // Convert each URL to signed URL with token
      const signed = rawPlaylist.map(url => {
        const path = extractPathFromUrl(url);
        const signedUrl = generateSignedUrl(path);
        console.log(`Original: ${url} -> Signed: ${signedUrl}`);
        return signedUrl;
      });
      
      setPlaylist(rawPlaylist);
      setSignedPlaylist(signed);
    } catch (error) {
      console.error('Error fetching playlist:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle video ended - go to next
  const handleVideoEnded = () => {
    if (signedPlaylist.length > 0) {
      const nextIndex = (currentIndex + 1) % signedPlaylist.length;
      console.log(`Video ended, moving to index ${nextIndex}`);
      setCurrentIndex(nextIndex);
    }
  };

  // Handle video error
  const handleVideoError = (e) => {
    console.error('Video error:', e);
    if (signedPlaylist.length > 0) {
      const nextIndex = (currentIndex + 1) % signedPlaylist.length;
      setCurrentIndex(nextIndex);
    }
  };

  // Play video when index changes
  useEffect(() => {
    if (videoRef.current && signedPlaylist.length > 0 && signedPlaylist[currentIndex]) {
      const video = videoRef.current;
      const videoUrl = signedPlaylist[currentIndex];
      
      console.log(`Playing video ${currentIndex + 1}/${signedPlaylist.length}:`, videoUrl);
      
      video.src = videoUrl;
      video.load();
      
      setTimeout(() => {
        video.play().catch(err => {
          console.warn('Play failed:', err);
          video.muted = true;
          video.play().catch(e => console.error('Muted play also failed:', e));
        });
      }, 100);
    }
  }, [currentIndex, signedPlaylist]);

  // Loading state
  if (loading) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-red-500 mb-4">🎬</h1>
          <p className="text-white text-lg">Loading background videos...</p>
        </div>
      </div>
    );
  }

  // No videos in playlist - show gradient background
  if (signedPlaylist.length === 0) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-gray-900 to-gray-800"></div>
    );
  }

  return (
    <video
      ref={videoRef}
      key={currentIndex}
      className="w-full h-full object-cover"
      autoPlay
      muted
      playsInline
      onEnded={handleVideoEnded}
      onError={handleVideoError}
    />
  );
};

// ==================== Main App Component ====================
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check user login status from localStorage
  useEffect(() => {
    try {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      
      if (userStr === 'undefined' || userStr === 'null') {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setIsLoggedIn(false);
      } else if (token && userStr) {
        const user = JSON.parse(userStr);
        if (user && user._id) {
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      } else {
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error('Error checking login:', error);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      setIsLoggedIn(false);
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    localStorage.setItem('token', userData.token);
    localStorage.setItem('user', JSON.stringify(userData));
    setIsLoggedIn(true);
    setShowLogin(false);
  };

  const handleRegister = (userData) => {
    localStorage.setItem('token', userData.token);
    localStorage.setItem('user', JSON.stringify(userData));
    setIsLoggedIn(true);
    setShowRegister(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // If logged in, show main app
  if (isLoggedIn) {
    return <MainApp onLogout={handleLogout} />;
  }

  // Landing page with background video playlist
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Video Background - Auto-playing playlist */}
      <div className="absolute inset-0 w-full h-full z-0">
        <BackgroundPlaylistPlayer />
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Navbar */}
        <nav className="bg-transparent backdrop-blur-md py-4 px-6">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold text-red-500">🎬 TV Series Platform</h1>
            <div className="space-x-4">
              <button 
                onClick={() => setShowLogin(true)}
                className="px-6 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition"
              >
                Sign In
              </button>
              <button 
                onClick={() => setShowRegister(true)}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Sign Up
              </button>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="flex-1 flex items-center justify-center text-center px-4">
          <div>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              Watch Your Favorite <span className="text-red-500">TV Series</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Unlimited streaming of thousands of TV series. Watch anywhere, anytime.
            </p>
            <button 
              onClick={() => setShowRegister(true)}
              className="px-8 py-4 bg-red-600 text-white text-lg rounded-lg hover:bg-red-700 transition transform hover:scale-105"
            >
              Get Started Free
            </button>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-black bg-opacity-50 py-4 text-center text-gray-400">
          <p>&copy; 2026 TV Series Platform. All rights reserved. Powered by Bunny CDN</p>
        </footer>
      </div>

      {/* Modals */}
      <LoginModal 
        isOpen={showLogin} 
        onClose={() => setShowLogin(false)}
        onLogin={handleLogin}
        onSwitchToRegister={() => {
          setShowLogin(false);
          setShowRegister(true);
        }}
      />
      <RegisterModal 
        isOpen={showRegister} 
        onClose={() => setShowRegister(false)}
        onRegister={handleRegister}
        onSwitchToLogin={() => {
          setShowRegister(false);
          setShowLogin(true);
        }}
      />
    </div>
  );
}

export default App;