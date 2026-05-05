import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative bg-black/90 backdrop-blur-md border-t border-white/10 mt-20 overflow-hidden">
      {/* Cinematic gradient line at top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent"></div>
      
      {/* Subtle background glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-red-600/5 to-transparent pointer-events-none"></div>
      
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <span className="text-xl font-black bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent">
                ROG
              </span>
              <div className="w-px h-4 bg-gradient-to-b from-transparent via-red-500/50 to-transparent"></div>
              <span className="text-xs font-medium text-white/60 tracking-wider">TV SERIES</span>
            </div>
            <p className="text-gray-400 text-xs leading-relaxed">
              Experience the ultimate cinematic journey with premium TV series collection.
            </p>
            <div className="flex space-x-3">
              {['Facebook', 'Twitter', 'Instagram'].map((social) => (
                <button
                  key={social}
                  onClick={() => console.log(`Navigate to ${social}`)}
                  className="text-gray-500 hover:text-red-500 transition-colors duration-300 text-xs"
                >
                  {social}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white text-sm font-semibold tracking-wider mb-3 relative inline-block">
              QUICK LINKS
              <div className="absolute -bottom-1 left-0 w-full h-px bg-gradient-to-r from-red-500 to-transparent"></div>
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-red-500 text-xs transition-colors duration-300">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/tv-shows" className="text-gray-400 hover:text-red-500 text-xs transition-colors duration-300">
                  TV Shows
                </Link>
              </li>
            </ul>
          </div>

          {/* Support - Updated with Links */}
          <div>
            <h3 className="text-white text-sm font-semibold tracking-wider mb-3 relative inline-block">
              SUPPORT
              <div className="absolute -bottom-1 left-0 w-full h-px bg-gradient-to-r from-red-500 to-transparent"></div>
            </h3>
            <ul className="space-y-2">
              {/* Help Center - Button (console.log) */}
              <li>
                <button
                  onClick={() => console.log('Help Center clicked')}
                  className="text-gray-400 hover:text-red-500 text-xs transition-colors duration-300"
                >
                  Help Center
                </button>
              </li>
              
              {/* Terms of Service - Link to /terms */}
              <li>
                <Link
                  to="/terms"
                  className="text-gray-400 hover:text-red-500 text-xs transition-colors duration-300"
                >
                  Terms of Service
                </Link>
              </li>
              
              {/* Privacy Policy - Link to /privacy */}
              <li>
                <Link
                  to="/privacy"
                  className="text-gray-400 hover:text-red-500 text-xs transition-colors duration-300"
                >
                  Privacy Policy
                </Link>
              </li>
              
              {/* Contact Us - Button (console.log) */}
              <li>
                <button
                  onClick={() => console.log('Contact Us clicked')}
                  className="text-gray-400 hover:text-red-500 text-xs transition-colors duration-300"
                >
                  Contact Us
                </button>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-white text-sm font-semibold tracking-wider mb-3 relative inline-block">
              NEWSLETTER
              <div className="absolute -bottom-1 left-0 w-full h-px bg-gradient-to-r from-red-500 to-transparent"></div>
            </h3>
            <p className="text-gray-400 text-xs mb-3">
              Subscribe for updates on new series.
            </p>
            <div className="flex">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 bg-white/5 border border-white/10 rounded-l-full px-3 py-1.5 text-white text-xs placeholder:text-gray-500 focus:outline-none focus:border-red-500/50 transition-colors"
              />
              <button className="bg-gradient-to-r from-red-600 to-red-700 px-3 py-1.5 rounded-r-full text-white text-xs font-medium hover:from-red-700 hover:to-red-800 transition-all duration-300">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 mt-6 border-t border-white/10 text-center">
          <p className="text-gray-500 text-[10px] tracking-wider">
            &copy; {new Date().getFullYear()} ROG TV SERIES. All rights reserved.
          </p>
          
          {/* Cinematic scroll to top button */}
          <button
            onClick={scrollToTop}
            className="absolute right-8 bottom-8 w-8 h-8 rounded-full border border-white/20 bg-black/50 backdrop-blur flex items-center justify-center hover:border-red-500/50 hover:bg-red-500/10 transition-all duration-300 group"
            aria-label="Scroll to top"
          >
            <svg className="w-3 h-3 text-white/60 group-hover:text-red-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Animated bottom glow line */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-red-500/30 to-transparent animate-pulse"></div>
    </footer>
  );
};

export default Footer;