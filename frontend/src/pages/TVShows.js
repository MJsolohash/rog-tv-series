import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { generateSignedUrl, extractPathFromUrl } from '../services/tokenService';

const TVShows = () => {
  const [series, setSeries] = useState([]);
  const [filteredSeries, setFilteredSeries] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [error, setError] = useState(null);
  const [signedImages, setSignedImages] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    let filtered = series;
    
    if (searchTerm) {
      filtered = filtered.filter(s =>
        s.title?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(s =>
        s.categories?.includes(selectedCategory) || s.category === selectedCategory
      );
    }
    
    setFilteredSeries(filtered);
  }, [searchTerm, selectedCategory, series]);

  const getSignedImageUrl = (imageUrl) => {
    if (!imageUrl || imageUrl.includes('placeholder')) return imageUrl;
    if (signedImages[imageUrl]) return signedImages[imageUrl];
    
    try {
      const path = extractPathFromUrl(imageUrl);
      const signedUrl = generateSignedUrl(path);
      setSignedImages(prev => ({ ...prev, [imageUrl]: signedUrl }));
      return signedUrl;
    } catch (error) {
      console.error('Error signing image URL:', error);
      return imageUrl;
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // line ~48 දිගේ
         const response = await fetch('https://video.menakajanith.site/api/direct-series');
      const data = await response.json();
      
      if (data.success && data.series) {
        setSeries(data.series);
        setFilteredSeries(data.series);
      } else {
        setSeries([]);
        setFilteredSeries([]);
      }
      
      try {
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const catRes = await api.get('/admin/categories', { headers });
        let categoriesData = [];
        if (Array.isArray(catRes.data)) {
          categoriesData = catRes.data;
        } else if (catRes.data?.categories) {
          categoriesData = catRes.data.categories;
        }
        setCategories(categoriesData);
      } catch (catError) {
        console.error('Categories error:', catError);
      }
      
    } catch (error) {
      console.error('=== ERROR ===', error);
      setError('Failed to load TV shows: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center">
        <div className="text-center space-y-4 animate-pulse">
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter">
            <span className="relative inline-block">
              <span className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-800 blur-2xl opacity-50"></span>
              <span className="relative bg-gradient-to-r from-red-500 via-red-600 to-red-700 bg-clip-text text-transparent">
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
            <div className="h-px w-24 bg-gradient-to-r from-transparent via-red-500 to-transparent rounded-full animate-pulse"></div>
          </div>
          <p className="text-gray-400 text-center text-sm tracking-wider">LOADING TV SHOWS...</p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Navigation Bar - Categories link removed */}
      <nav className="bg-black/90 backdrop-blur-md border-b border-gray-800 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Link to="/" className="flex items-center space-x-2 group">
              <span className="text-2xl font-black">
                <span className="text-red-500">ROG</span>
                <span className="text-white text-sm ml-1">TV SERIES</span>
              </span>
            </Link>

            <div className="hidden md:flex items-center space-x-6">
              <Link to="/" className="text-gray-300 hover:text-red-500 transition text-sm font-medium">HOME</Link>
              <Link to="/tv-shows" className="text-red-500 transition text-sm font-medium border-b-2 border-red-500 pb-1">TV SHOWS</Link>
              
            </div>

            <div className="flex-1 max-w-md">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search TV shows..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 pl-9 rounded-full bg-gray-800/50 text-white text-sm border border-gray-700 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                />
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            <button className="md:hidden text-white p-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {error && (
        <div className="bg-red-600/20 border-b border-red-600/30 py-2 px-4 text-center">
          <p className="text-red-400 text-xs">{error}</p>
          <button onClick={() => fetchData()} className="ml-4 text-red-400 text-xs underline hover:text-red-300">Retry</button>
        </div>
      )}

      <div className="relative h-[30vh] md:h-[40vh] bg-gradient-to-r from-black via-gray-900 to-black overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-500/30 via-transparent to-transparent"></div>
        </div>
        <div className="relative z-10 container mx-auto px-4 h-full flex flex-col justify-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-4">
            <span className="text-red-500">TV</span> Shows
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl">Browse our complete collection of premium TV series</p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black to-transparent"></div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {categories.length > 0 && (
          <div className="mb-6 overflow-x-auto">
            <div className="flex gap-2 pb-2">
              <button onClick={() => setSelectedCategory('all')} className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-all duration-300 ${selectedCategory === 'all' ? 'bg-red-600 text-white shadow-lg shadow-red-500/30' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>All</button>
              {categories.map(cat => (
                <button key={cat._id} onClick={() => setSelectedCategory(cat._id)} className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-all duration-300 ${selectedCategory === cat._id ? 'bg-red-600 text-white shadow-lg shadow-red-500/30' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>{cat.name}</button>
              ))}
            </div>
          </div>
        )}

        <div className="mb-4">
          <p className="text-gray-400 text-sm">Found <span className="text-red-500 font-semibold">{filteredSeries.length}</span> TV shows</p>
        </div>

        {filteredSeries.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-gray-500 text-6xl mb-4">🎬</div>
            <h3 className="text-xl font-semibold text-white mb-2">No TV shows found</h3>
            <p className="text-gray-400">{searchTerm ? `No results found for "${searchTerm}"` : 'No TV shows available at the moment'}</p>
            {searchTerm && <button onClick={() => setSearchTerm('')} className="mt-4 px-4 py-2 text-red-500 hover:text-red-400 transition">Clear search</button>}
            <button onClick={() => fetchData()} className="mt-4 ml-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">Refresh Data</button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredSeries.map((seriesItem, index) => (
              <SeriesCard key={seriesItem._id} series={seriesItem} index={index} getSignedImageUrl={getSignedImageUrl} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Series Card Component with Signed Images
const SeriesCard = ({ series, index = 0, getSignedImageUrl }) => {
  const rating = series.rating || 0;
  const [imageSrc, setImageSrc] = useState('/placeholder.jpg');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (series.coverImage && series.coverImage !== '/placeholder.jpg') {
      const signedUrl = getSignedImageUrl(series.coverImage);
      setImageSrc(signedUrl);
    }
    setLoading(false);
  }, [series.coverImage, getSignedImageUrl]);

  return (
    <Link to={`/series/${series._id}`} className="group" style={{ animationDelay: `${index * 0.05}s` }}>
      <div className="bg-gray-800/30 rounded-lg overflow-hidden transition-all duration-300 hover:transform hover:scale-105 hover:shadow-lg hover:shadow-red-500/20">
        <div className="relative overflow-hidden">
          {!loading && (
            <img src={imageSrc} alt={series.title} className="w-full aspect-[2/3] object-cover transition-transform duration-500 group-hover:scale-110" onError={(e) => { e.target.src = '/placeholder.jpg'; }} />
          )}
          {loading && <div className="w-full aspect-[2/3] bg-gray-800 animate-pulse"></div>}
          
          {rating > 0 && (
            <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm rounded-full px-1.5 py-0.5 text-[10px] text-yellow-400">⭐ {typeof rating === 'number' ? rating.toFixed(1) : rating}</div>
          )}
          
          {series.totalSeasons > 0 && (
            <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm rounded-full px-1.5 py-0.5 text-[10px] text-white">{series.totalSeasons}S</div>
          )}
          
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/50">
            <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center transform scale-0 group-hover:scale-100 transition-transform duration-300">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M5 3l14 9-14 9V3z" /></svg>
            </div>
          </div>
        </div>
        <div className="p-2">
          <h3 className="text-white font-medium text-xs truncate group-hover:text-red-400 transition-colors">{series.title}</h3>
          <p className="text-gray-500 text-[10px] mt-0.5">{series.releaseYear}</p>
        </div>
      </div>
    </Link>
  );
};

export default TVShows;