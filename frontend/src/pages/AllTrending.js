// src/pages/AllTrending.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { generateSignedUrl, extractPathFromUrl } from '../services/tokenService';

const AllTrending = () => {
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTrendingSeries();
  }, []);

  const fetchTrendingSeries = async () => {
    try {
      // line ~16 දිගේ
          const response = await fetch('https://video.menakajanith.site/api/direct-series');
      const data = await response.json();
      
      if (data.success && data.series) {
        let allSeries = data.series.filter(s => (s.rating || 0) > 0);
        // Filter trending (rating >= 7)
        const trending = allSeries.filter(s => (s.rating || 0) >= 7);
        setSeries(trending);
      } else {
        setSeries([]);
      }
    } catch (error) {
      console.error('Error fetching trending series:', error);
      setError('Failed to load trending series');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-400 text-sm tracking-wider">LOADING TRENDING SERIES...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500">{error}</p>
          <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-red-600 text-white rounded">Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-24 px-4">
      <div className="container mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link to="/" className="text-gray-400 hover:text-red-500 text-sm mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-white">Trending Now</h1>
          <div className="w-16 h-0.5 bg-red-500 mt-2 rounded-full"></div>
          <p className="text-gray-400 mt-2">{series.length} trending series available</p>
        </div>

        {/* Series Grid */}
        {series.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No trending series available</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
            {series.map((item, idx) => (
              <TrendingCard key={item._id} series={item} index={idx} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Trending Card Component
const TrendingCard = ({ series, index = 0 }) => {
  const [imageSrc, setImageSrc] = useState('/placeholder.jpg');
  const [loading, setLoading] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const loadSignedImage = async () => {
      if (!series.coverImage) {
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
        transform: isHovered ? 'translateY(-8px)' : 'translateY(0)',
        boxShadow: isHovered 
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

export default AllTrending;