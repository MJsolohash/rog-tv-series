import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = ({ onLogout, user }) => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSupportDropdownOpen, setIsSupportDropdownOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (onLogout) onLogout();
    navigate('/');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    setIsSupportDropdownOpen(false);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10 transition-all duration-300">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo - ROG Style */}
            <Link to="/" className="group relative flex items-center space-x-2 z-10" onClick={closeMobileMenu}>
              <div className="absolute -inset-1 bg-gradient-to-r from-red-600/20 to-red-800/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative">
                <span className="text-2xl font-black bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent">
                  ROG
                </span>
              </div>
              <div className="w-px h-5 bg-gradient-to-b from-transparent via-red-500/50 to-transparent"></div>
              <span className="text-sm font-medium text-white/80 tracking-wider hidden sm:inline">
                TV SERIES
              </span>
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            </Link>

            {/* Desktop Navigation Links - Hidden on mobile */}
            <div className="hidden md:flex space-x-1">
              {/* HOME Link */}
              <Link to="/" className="relative group px-4 py-2 overflow-hidden">
                <span className="absolute inset-0 bg-gradient-to-r from-red-600/0 via-red-600/10 to-red-600/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></span>
                <span className="relative text-sm font-medium tracking-wider text-gray-300 group-hover:text-white transition-colors duration-300">
                  HOME
                </span>
                <span className="absolute bottom-0 left-1/2 w-0 h-px bg-red-500 group-hover:w-full group-hover:left-0 transition-all duration-300"></span>
              </Link>

              {/* TV SHOWS Link */}
              <Link to="/tv-shows" className="relative group px-4 py-2 overflow-hidden">
                <span className="absolute inset-0 bg-gradient-to-r from-red-600/0 via-red-600/10 to-red-600/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></span>
                <span className="relative text-sm font-medium tracking-wider text-gray-300 group-hover:text-white transition-colors duration-300">
                  TV SHOWS
                </span>
                <span className="absolute bottom-0 left-1/2 w-0 h-px bg-red-500 group-hover:w-full group-hover:left-0 transition-all duration-300"></span>
              </Link>

              {/* SUPPORT Dropdown - Desktop */}
              <div className="relative group px-4 py-2">
                <button className="relative flex items-center gap-1 overflow-hidden">
                  <span className="absolute inset-0 bg-gradient-to-r from-red-600/0 via-red-600/10 to-red-600/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></span>
                  <span className="relative text-sm font-medium tracking-wider text-gray-300 group-hover:text-white transition-colors duration-300">
                    SUPPORT
                  </span>
                  <svg className="relative w-3 h-3 text-gray-300 group-hover:text-white transition-colors duration-300 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  <span className="absolute bottom-0 left-1/2 w-0 h-px bg-red-500 group-hover:w-full group-hover:left-0 transition-all duration-300"></span>
                </button>

                <div className="absolute left-0 mt-2 w-56 bg-black/90 backdrop-blur-xl rounded-lg border border-white/10 shadow-2xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                  <button onClick={() => console.log('Help Center clicked')} className="block w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-white/10 hover:text-red-500 transition-colors duration-300">
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Help Center
                    </span>
                  </button>
                  <Link to="/terms" className="block w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-white/10 hover:text-red-500 transition-colors duration-300">
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Terms of Service
                    </span>
                  </Link>
                  <Link to="/privacy" className="block w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-white/10 hover:text-red-500 transition-colors duration-300">
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Privacy Policy
                    </span>
                  </Link>
                  <hr className="border-white/10 my-1" />
                  <button onClick={() => console.log('Contact Us clicked')} className="block w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-white/10 hover:text-red-500 transition-colors duration-300">
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Contact Us
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right side - Profile Dropdown & Mobile Menu Button */}
            <div className="flex items-center space-x-4">
              {/* Profile Section - Desktop & Mobile */}
              {user ? (
                <div className="relative group">
                  <button className="relative flex items-center space-x-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all duration-300">
                    <div className="relative w-7 h-7 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center">
                      <span className="text-xs font-bold text-white">{user.username?.charAt(0).toUpperCase()}</span>
                    </div>
                    <span className="text-sm font-medium text-white/80 hidden sm:inline">{user.username}</span>
                    <svg className="w-3 h-3 text-white/60 group-hover:rotate-180 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  <div className="absolute right-0 mt-2 w-48 bg-black/90 backdrop-blur-xl rounded-lg border border-white/10 shadow-2xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                    <Link to="/profile" className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors">
                      Profile
                    </Link>
                    {user.isAdmin && (
                      <Link to="/admin" className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors">
                        Admin Dashboard
                      </Link>
                    )}
                    <hr className="border-white/10 my-1" />
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-white/10 hover:text-red-400 transition-colors">
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
                <div className="hidden sm:flex space-x-3">
                  <Link to="/login" className="relative px-4 py-1.5 text-sm font-medium tracking-wider text-gray-300 hover:text-white transition-colors overflow-hidden group">
                    <span className="relative z-10">SIGN IN</span>
                    <span className="absolute inset-0 bg-gradient-to-r from-red-600/0 via-red-600/10 to-red-600/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></span>
                  </Link>
                  <Link to="/register" className="relative px-4 py-1.5 text-sm font-medium tracking-wider text-white bg-gradient-to-r from-red-600 to-red-700 rounded-full hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-lg shadow-red-500/25 overflow-hidden group">
                    <span className="relative z-10">SIGN UP</span>
                    <span className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></span>
                  </Link>
                </div>
              )}

              {/* Mobile Menu Button (Hamburger) */}
              <button
                onClick={toggleMobileMenu}
                className="md:hidden relative w-8 h-8 flex flex-col items-center justify-center gap-1.5 z-20"
              >
                <span className={`w-6 h-0.5 bg-white transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
                <span className={`w-6 h-0.5 bg-white transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''}`}></span>
                <span className={`w-6 h-0.5 bg-white transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 bg-black/95 backdrop-blur-xl z-40 transition-all duration-300 md:hidden ${
          isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        style={{ top: '64px' }}
      >
        <div className="flex flex-col p-6 space-y-4">
          {/* Mobile Navigation Links */}
          <Link
            to="/"
            onClick={closeMobileMenu}
            className="text-gray-300 hover:text-white text-lg font-medium py-3 border-b border-white/10 transition-colors"
          >
            HOME
          </Link>
          
          <Link
            to="/tv-shows"
            onClick={closeMobileMenu}
            className="text-gray-300 hover:text-white text-lg font-medium py-3 border-b border-white/10 transition-colors"
          >
            TV SHOWS
          </Link>

          {/* Mobile Support Dropdown */}
          <div className="border-b border-white/10">
            <button
              onClick={() => setIsSupportDropdownOpen(!isSupportDropdownOpen)}
              className="flex items-center justify-between w-full text-gray-300 hover:text-white text-lg font-medium py-3 transition-colors"
            >
              SUPPORT
              <svg className={`w-4 h-4 transition-transform duration-300 ${isSupportDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {isSupportDropdownOpen && (
              <div className="pl-4 pb-3 space-y-3">
                <button onClick={() => { console.log('Help Center clicked'); closeMobileMenu(); }} className="block text-gray-400 hover:text-red-500 text-sm py-2 transition-colors">
                  Help Center
                </button>
                <Link to="/terms" onClick={closeMobileMenu} className="block text-gray-400 hover:text-red-500 text-sm py-2 transition-colors">
                  Terms of Service
                </Link>
                <Link to="/privacy" onClick={closeMobileMenu} className="block text-gray-400 hover:text-red-500 text-sm py-2 transition-colors">
                  Privacy Policy
                </Link>
                <button onClick={() => { console.log('Contact Us clicked'); closeMobileMenu(); }} className="block text-gray-400 hover:text-red-500 text-sm py-2 transition-colors">
                  Contact Us
                </button>
              </div>
            )}
          </div>

          {/* Mobile Auth Buttons (when not logged in) */}
          {!user && (
            <div className="flex flex-col gap-3 pt-4">
              <Link
                to="/login"
                onClick={closeMobileMenu}
                className="text-center px-4 py-2 text-sm font-medium text-white border border-white/20 rounded-full hover:bg-white/10 transition-colors"
              >
                SIGN IN
              </Link>
              <Link
                to="/register"
                onClick={closeMobileMenu}
                className="text-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-600 to-red-700 rounded-full hover:from-red-700 hover:to-red-800 transition-all duration-300"
              >
                SIGN UP
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Navbar;