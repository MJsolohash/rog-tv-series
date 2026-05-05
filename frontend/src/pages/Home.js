// src/pages/Home.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { generateSignedUrl, extractPathFromUrl } from '../services/tokenService';

const Home = () => {
  const [trendingSeries, setTrendingSeries] = useState([]);
  const [recentSeries, setRecentSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [heroVideoUrl, setHeroVideoUrl] = useState('');
  const [animationComplete, setAnimationComplete] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    fetchData();
    fetchHeroVideo();
    
    const timer = setTimeout(() => {
      setAnimationComplete(true);
      setTimeout(() => setShowContent(true), 500);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  const fetchHeroVideo = async () => {
    try {
      const response = await api.get('/admin/background-videos/playlist');
      if (response.data.playlist && response.data.playlist.length > 0) {
        const rawUrl = response.data.playlist[0];
        const path = extractPathFromUrl(rawUrl);
        const signedUrl = generateSignedUrl(path);
        setHeroVideoUrl(signedUrl);
      }
    } catch (error) {
      console.error('Error fetching hero video:', error);
    }
  };

  const fetchData = async () => {
    try {
      // line ~30 දිගේ fetchData function එකේ
              const response = await fetch('https://video.menakajanith.site/api/direct-series');
      const data = await response.json();
      
      if (data.success && data.series) {
        let allSeries = data.series.filter(s => (s.rating || 0) > 0);
        setTrendingSeries(allSeries.filter(s => (s.rating || 0) >= 7));
        setRecentSeries(allSeries);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (videoRef.current && heroVideoUrl) {
      videoRef.current.play().catch(e => console.log('Autoplay prevented:', e));
    }
  }, [heroVideoUrl]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-400 text-sm tracking-wider">LOADING EXPERIENCE...</p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black overflow-x-hidden">
      {/* Hero Section */}
      <div className="relative h-screen overflow-hidden">
        {heroVideoUrl && (
          <video
            ref={videoRef}
            src={heroVideoUrl}
            className="absolute inset-0 w-full h-full object-cover scale-110 animate-slowZoom"
            autoPlay
            loop
            muted
            playsInline
          />
        )}
        
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/70"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/30"></div>
        
        <div className="absolute inset-0 overflow-hidden opacity-30">
          <div className="absolute top-0 left-1/4 w-1 h-full bg-gradient-to-b from-red-500/50 to-transparent animate-lightRay"></div>
          <div className="absolute top-0 left-2/4 w-1 h-full bg-gradient-to-b from-red-500/30 to-transparent animate-lightRay delay-500"></div>
          <div className="absolute top-0 left-3/4 w-1 h-full bg-gradient-to-b from-red-500/20 to-transparent animate-lightRay delay-1000"></div>
        </div>

        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-px h-px bg-white/20 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 4}s`
              }}
            ></div>
          ))}
        </div>

        <div className="relative z-10 container mx-auto px-4 h-full flex flex-col justify-center items-center text-center">
          <div className={`transform transition-all duration-1000 ${animationComplete ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
            <div className="space-y-4">
              <h1 className="text-6xl md:text-8xl font-black tracking-tighter">
                <span className="relative inline-block">
                  <span className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-800 blur-2xl opacity-50 animate-pulse"></span>
                  <span className="relative bg-gradient-to-r from-red-500 via-red-600 to-red-700 bg-clip-text text-transparent animate-gradient">
                    ROG
                  </span>
                </span>
                <span className="relative inline-block ml-4">
                  <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                    TV SERIES
                  </span>
                </span>
              </h1>
              
              <div className="flex justify-center">
                <div className="h-px w-0 bg-gradient-to-r from-transparent via-red-500 to-transparent rounded-full animate-expandWidth"></div>
              </div>
              
              <p className="text-gray-400 text-center text-sm tracking-wider animate-fadeInUp opacity-0" style={{ animationFillMode: 'forwards' }}>
                EXPERIENCE THE ULTIMATE CINEMATIC JOURNEY
              </p>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce-slow cursor-pointer z-20">
          <div className="w-6 h-10 border border-white/30 rounded-full flex justify-center">
            <div className="w-0.5 h-1.5 bg-white/50 rounded-full mt-2 animate-scroll"></div>
          </div>
        </div>
      </div>

      {/* Manual Scroll Carousels - Fixed Buttons with proper View All links */}
      {showContent && (
        <div className="container mx-auto px-4 py-12">
          <ManualCarousel title="Trending Now" items={trendingSeries} viewAllLink="/trending" />
          <ManualCarousel title="Recently Added" items={recentSeries} viewAllLink="/recent" />
        </div>
      )}
    </div>
  );
};

// ==================== Manual Carousel - Fixed Next/Prev Buttons ====================
const ManualCarousel = ({ title, items, viewAllLink }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isButtonScrolling, setIsButtonScrolling] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const scrollContainerRef = useRef(null);
  const cardWidthRef = useRef(220);

  // Update card width on resize
  useEffect(() => {
    const updateCardWidth = () => {
      const width = window.innerWidth;
      if (width < 640) cardWidthRef.current = 160;
      else if (width < 768) cardWidthRef.current = 180;
      else if (width < 1024) cardWidthRef.current = 200;
      else cardWidthRef.current = 220;
    };
    updateCardWidth();
    window.addEventListener('resize', updateCardWidth);
    return () => window.removeEventListener('resize', updateCardWidth);
  }, []);

  // Scroll to specific index with loop support
  const scrollToIndex = useCallback((index) => {
    let targetIndex = index;
    const totalItems = items.length;
    
    // Loop around
    if (targetIndex < 0) targetIndex = totalItems - 1;
    if (targetIndex >= totalItems) targetIndex = 0;
    
    setIsButtonScrolling(true);
    setCurrentIndex(targetIndex);
    
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        left: targetIndex * cardWidthRef.current,
        behavior: 'smooth'
      });
    }
    
    // Reset button scrolling flag after animation
    setTimeout(() => {
      setIsButtonScrolling(false);
    }, 500);
  }, [items.length]);

  const nextSlide = () => scrollToIndex(currentIndex + 1);
  const prevSlide = () => scrollToIndex(currentIndex - 1);

  // Snap to nearest card on scroll end (for drag only, not for buttons)
  const snapToNearestCard = useCallback(() => {
    // Don't snap if button is scrolling
    if (isButtonScrolling || isDragging) return;
    
    const container = scrollContainerRef.current;
    if (!container) return;
    
    const scrollPosition = container.scrollLeft;
    const cardWidth = cardWidthRef.current;
    let newIndex = Math.round(scrollPosition / cardWidth);
    
    // Boundaries
    if (newIndex < 0) newIndex = 0;
    if (newIndex >= items.length) newIndex = items.length - 1;
    
    if (newIndex !== currentIndex) {
      setCurrentIndex(newIndex);
    }
  }, [currentIndex, items.length, isButtonScrolling, isDragging]);

  // Manual drag scroll (mouse + touch)
  const handleDragStart = (e) => {
    setIsDragging(true);
    const pageX = e.type === 'mousedown' ? e.pageX : e.touches[0].pageX;
    setStartX(pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleDragMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const pageX = e.type === 'mousemove' ? e.pageX : e.touches[0].pageX;
    const x = pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 1.2;
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    snapToNearestCard();
  };

  // Listen to scroll events for snap
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    
    let scrollTimeout;
    const handleScroll = () => {
      // Don't auto-snap during button scrolling
      if (isButtonScrolling) return;
      
      if (scrollTimeout) clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(snapToNearestCard, 150);
    };
    
    container.addEventListener('scroll', handleScroll);
    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (scrollTimeout) clearTimeout(scrollTimeout);
    };
  }, [isButtonScrolling, snapToNearestCard]);

  if (!items || items.length === 0) {
    return (
      <div className="mb-16">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">{title}</h2>
        </div>
        <div className="text-center py-8 text-gray-500 text-sm">No {title.toLowerCase()} available</div>
      </div>
    );
  }

  return (
    <div className="mb-16">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">{title}</h2>
          <div className="w-12 h-0.5 bg-red-500 mt-1 rounded-full"></div>
        </div>
        {viewAllLink && (
          <Link to={viewAllLink} className="text-sm text-gray-400 hover:text-red-500 transition-colors duration-300 flex items-center gap-1 group">
            View All 
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        )}
      </div>

      {/* Carousel Container */}
      <div className="relative group">
        {/* Gradient Overlays */}
        <div className="absolute left-0 top-0 bottom-0 w-20 z-10 bg-gradient-to-r from-black to-transparent pointer-events-none"></div>
        <div className="absolute right-0 top-0 bottom-0 w-20 z-10 bg-gradient-to-l from-black to-transparent pointer-events-none"></div>

        {/* Previous Button */}
        <button
          onClick={prevSlide}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-black/60 hover:bg-red-600 text-white rounded-full p-2 backdrop-blur-sm transition-all duration-300 opacity-0 group-hover:opacity-100"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Next Button */}
        <button
          onClick={nextSlide}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-black/60 hover:bg-red-600 text-white rounded-full p-2 backdrop-blur-sm transition-all duration-300 opacity-0 group-hover:opacity-100"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Scrollable Container */}
        <div
          ref={scrollContainerRef}
          className="overflow-x-auto overflow-y-hidden pb-4 cursor-grab active:cursor-grabbing"
          style={{
            scrollBehavior: 'smooth',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
          onMouseDown={handleDragStart}
          onMouseMove={handleDragMove}
          onMouseUp={handleDragEnd}
          onMouseLeave={handleDragEnd}
          onTouchStart={handleDragStart}
          onTouchMove={handleDragMove}
          onTouchEnd={handleDragEnd}
        >
          <div className="flex gap-5" style={{ paddingLeft: 'calc(50% - 110px)', paddingRight: 'calc(50% - 110px)' }}>
            {items.map((item, idx) => (
              <div
                key={item._id}
                className="flex-shrink-0 transition-all duration-300"
                style={{
                  width: `${cardWidthRef.current}px`,
                  scrollSnapAlign: 'center',
                  transform: currentIndex === idx ? 'scale(1.02)' : 'scale(0.95)',
                  opacity: currentIndex === idx ? 1 : 0.7
                }}
              >
                <SeriesCard series={item} index={idx} isActive={currentIndex === idx} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Page Indicator */}
      <div className="flex justify-center gap-1 mt-4">
        <span className="text-xs text-gray-500">
          {currentIndex + 1} / {items.length}
        </span>
      </div>
    </div>
  );
};

// ==================== Series Card Component ====================
const SeriesCard = ({ series, index = 0, isActive = false }) => {
  const [imageSrc, setImageSrc] = useState('/placeholder.jpg');
  const [loading, setLoading] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  
  useEffect(() => {
    const loadSignedImage = async () => {
      if (!series.coverImage || series.coverImage === '/placeholder.jpg') {
        setImageSrc('/placeholder.jpg');
        setLoading(false);
        return;
      }
      
      try {
        const path = extractPathFromUrl(series.coverImage);
        const signedUrl = generateSignedUrl(path);
        setImageSrc(signedUrl);
      } catch (error) {
        console.error('Error signing image:', error);
        setImageSrc(series.coverImage);
      } finally {
        setLoading(false);
      }
    };
    
    loadSignedImage();
  }, [series.coverImage]);
  
  const rating = series.rating || 0;
  const totalSeasons = series.totalSeasons || 0;
  
  return (
    <Link 
      to={`/series/${series._id}`} 
      className="block transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="rounded-xl overflow-hidden transition-all duration-300" style={{
        backgroundColor: 'rgba(31, 41, 55, 0.4)',
        transform: isHovered || isActive ? 'translateY(-8px)' : 'translateY(0)',
        boxShadow: isHovered || isActive 
          ? '0 25px 30px -12px rgba(0,0,0,0.5), 0 0 0 2px rgba(239,68,68,0.4)' 
          : '0 10px 15px -3px rgba(0,0,0,0.3)'
      }}>
        <div className="relative overflow-hidden" style={{ aspectRatio: '2/3' }}>
          {loading ? (
            <div className="w-full h-full bg-gray-800 animate-pulse"></div>
          ) : (
            <img 
              src={imageSrc}
              alt={series.title}
              className="w-full h-full object-cover transition-transform duration-700"
              style={{ transform: isHovered ? 'scale(1.1)' : 'scale(1)' }}
              onError={(e) => { e.target.src = '/placeholder.jpg'; }}
            />
          )}
          
          <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm rounded-full px-2 py-0.5 text-[11px] font-semibold text-yellow-400 flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            {rating}
          </div>
          
          <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm rounded-full px-2 py-0.5 text-[10px] text-white">
            {totalSeasons} {totalSeasons === 1 ? 'Season' : 'Seasons'}
          </div>
          
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 transition-all duration-400" style={{ opacity: isHovered ? 1 : 0 }}>
            <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center transition-all duration-300" style={{ transform: isHovered ? 'scale(1)' : 'scale(0.5)' }}>
              <svg className="w-6 h-6 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M5 3l14 9-14 9V3z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="p-3">
          <h3 className="text-white font-semibold text-sm truncate transition-colors duration-300" style={{ color: isHovered ? '#ef4444' : 'white' }}>
            {series.title}
          </h3>
          <p className="text-gray-500 text-xs mt-1">{series.releaseYear}</p>
        </div>
      </div>
    </Link>
  );
};

export default Home;