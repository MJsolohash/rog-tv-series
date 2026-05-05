import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      {/* Animated background bubbles */}
      <ul className="absolute inset-0 overflow-hidden z-0">
        {[...Array(7)].map((_, i) => (
          <li
            key={i}
            className="absolute bg-white/5 rounded-full bottom-[-160px] animate-float-bubble"
            style={{
              left: `${[10, 20, 35, 50, 65, 80, 90][i]}%`,
              width: `${[80, 120, 60, 100, 50, 140, 70][i]}px`,
              height: `${[80, 120, 60, 100, 50, 140, 70][i]}px`,
              animationDelay: `${[0, 2, 4, 0, 3, 1, 5][i]}s`,
              animationDuration: `${[12, 17, 13, 15, 11, 18, 14][i]}s`
            }}
          ></li>
        ))}
      </ul>

      <div className="relative z-10 text-center max-w-2xl w-full flex flex-col min-h-[500px] md:min-h-[600px]">
        {/* Content wrapper */}
        <div className="flex-1 flex flex-col justify-center">
          {/* Glitch 404 */}
          <div className="mb-6 relative">
            <h1 className="text-7xl md:text-8xl font-bold text-white relative inline-block glitch-text">
              404
              <span className="absolute top-0 left-0 text-white opacity-80 glitch-span-1">404</span>
              <span className="absolute top-0 left-0 text-white opacity-80 glitch-span-2">404</span>
            </h1>
          </div>

          {/* Error Title */}
          <h1 className="text-xl md:text-2xl font-semibold text-white/90 uppercase tracking-wider mb-4">
            PAGE NOT FOUND
          </h1>

          {/* Error Message */}
          <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-4 md:p-6 mb-4 relative overflow-hidden">
            <p className="text-gray-300 text-base md:text-lg">
              <i className="fas fa-exclamation-circle text-red-500 mr-2"></i>
              The page you are looking for doesn't exist or has been moved.
            </p>
          </div>

          {/* Error Code */}
          <div className="text-left bg-black/20 rounded-lg p-3 mb-6 border-l-4 border-red-500">
            <code className="text-gray-400 text-sm font-mono">
              <i className="fas fa-code-branch text-red-500 mr-2"></i>
              ERROR CODE: 404 - Resource Not Found
            </code>
          </div>
        </div>

        {/* Button Section */}
        <div className="mt-4 mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 md:px-8 md:py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-full font-semibold text-base md:text-lg hover:from-red-700 hover:to-red-800 transition-all duration-300 transform hover:-translate-y-1 shadow-lg shadow-red-500/40"
          >
            <i className="fas fa-home"></i>
            BACK TO HOME
          </Link>
        </div>

        {/* Footer hint */}
        <div className="text-gray-500/30 text-xs tracking-wider mt-4">
          <i className="fas fa-skull-crosswalk mr-1"></i>
          SYSTEM ERROR • 404
        </div>
      </div>

      {/* Add custom animation styles */}
      <style>{`
        @keyframes floatBubble {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 0.5;
            border-radius: 50%;
          }
          100% {
            transform: translateY(-1000px) rotate(720deg);
            opacity: 0;
            border-radius: 40%;
          }
        }

        .animate-float-bubble {
          animation: floatBubble 20s infinite linear;
        }

        /* Glitch effect */
        .glitch-text {
          text-shadow: 0.05em 0 0 rgba(255, 0, 0, 0.75),
                       -0.05em -0.025em 0 rgba(0, 255, 255, 0.75),
                       0.025em 0.05em 0 rgba(0, 255, 0, 0.75);
          animation: glitch 500ms infinite;
        }

        .glitch-span-1 {
          clip-path: polygon(0 0, 100% 0, 100% 45%, 0 45%);
          transform: translate(-0.04em, -0.03em);
          opacity: 0.8;
          animation: glitch 650ms infinite;
        }

        .glitch-span-2 {
          clip-path: polygon(0 80%, 100% 20%, 100% 100%, 0 100%);
          transform: translate(0.04em, 0.03em);
          opacity: 0.8;
          animation: glitch 375ms infinite;
        }

        @keyframes glitch {
          0% {
            text-shadow: 0.05em 0 0 rgba(255, 0, 0, 0.75),
                        -0.05em -0.025em 0 rgba(0, 255, 255, 0.75),
                        0.025em 0.05em 0 rgba(0, 255, 0, 0.75);
          }
          14% {
            text-shadow: 0.05em 0 0 rgba(255, 0, 0, 0.75),
                        -0.05em -0.025em 0 rgba(0, 255, 255, 0.75),
                        0.025em 0.05em 0 rgba(0, 255, 0, 0.75);
          }
          15% {
            text-shadow: -0.05em -0.025em 0 rgba(255, 0, 0, 0.75),
                        0.025em 0.025em 0 rgba(0, 255, 255, 0.75),
                        -0.05em -0.05em 0 rgba(0, 255, 0, 0.75);
          }
          49% {
            text-shadow: -0.05em -0.025em 0 rgba(255, 0, 0, 0.75),
                        0.025em 0.025em 0 rgba(0, 255, 255, 0.75),
                        -0.05em -0.05em 0 rgba(0, 255, 0, 0.75);
          }
          50% {
            text-shadow: 0.025em 0.05em 0 rgba(255, 0, 0, 0.75),
                        0.05em 0 0 rgba(0, 255, 255, 0.75),
                        0 -0.05em 0 rgba(0, 255, 0, 0.75);
          }
          99% {
            text-shadow: 0.025em 0.05em 0 rgba(255, 0, 0, 0.75),
                        0.05em 0 0 rgba(0, 255, 255, 0.75),
                        0 -0.05em 0 rgba(0, 255, 0, 0.75);
          }
          100% {
            text-shadow: -0.025em 0 0 rgba(255, 0, 0, 0.75),
                        -0.025em -0.025em 0 rgba(0, 255, 255, 0.75),
                        -0.025em -0.05em 0 rgba(0, 255, 0, 0.75);
          }
        }

        /* Scan line animation */
        .backdrop-blur-md::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent);
          animation: scan 3s infinite;
        }

        .backdrop-blur-md {
          position: relative;
          overflow: hidden;
        }

        @keyframes scan {
          0% { left: -100%; }
          20% { left: 100%; }
          100% { left: 100%; }
        }
      `}</style>
    </div>
  );
};

export default NotFound;