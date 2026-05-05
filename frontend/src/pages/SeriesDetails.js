import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { generateSignedUrl, extractPathFromUrl } from '../services/tokenService';

// ==================== API BASE URL ====================
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://video.menakajanith.site/api';

const SeriesDetails = () => {
  const { id } = useParams();
  const [series, setSeries] = useState(null);
  const [seasons, setSeasons] = useState([]);
  const [episodes, setEpisodes] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoriesList, setCategoriesList] = useState([]);
  const [activeTab, setActiveTab] = useState('episodes');
  const [showTrailer, setShowTrailer] = useState(false);
  const [signedCoverImage, setSignedCoverImage] = useState('');
  const [signedBannerImage, setSignedBannerImage] = useState('');
  const [signedTrailerUrl, setSignedTrailerUrl] = useState('');
  const videoRef = useRef(null);

  useEffect(() => {
    fetchCategories();
    fetchSeriesDetails();
  }, [id]);

  useEffect(() => {
    if (showTrailer && videoRef.current && signedTrailerUrl) {
      videoRef.current.play().catch(err => console.log('Trailer play error:', err));
    }
  }, [showTrailer, signedTrailerUrl]);

  const getSignedImageUrl = (imageUrl) => {
    if (!imageUrl || imageUrl.includes('placeholder')) return imageUrl;
    try {
      const path = extractPathFromUrl(imageUrl);
      return generateSignedUrl(path);
    } catch (error) {
      console.error('Error signing image URL:', error);
      return imageUrl;
    }
  };

  // ==================== FETCH CATEGORIES (UPDATED URL) ====================
  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await fetch(`${API_BASE_URL}/admin/categories`, { headers });
      const data = await response.json();
      if (Array.isArray(data)) setCategoriesList(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  // ==================== FETCH SERIES DETAILS (UPDATED URL) ====================
  const fetchSeriesDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/direct-series`);
      const data = await response.json();
      
      if (data.success && data.series) {
        const foundSeries = data.series.find(s => s._id === id);
        if (foundSeries) {
          // Sign cover image
          if (foundSeries.coverImage) {
            const signedUrl = getSignedImageUrl(foundSeries.coverImage);
            foundSeries.coverImage = signedUrl;
            setSignedCoverImage(signedUrl);
          }
          // Sign banner image
          if (foundSeries.bannerImage) {
            const signedUrl = getSignedImageUrl(foundSeries.bannerImage);
            foundSeries.bannerImage = signedUrl;
            setSignedBannerImage(signedUrl);
          }
          // Sign trailer video
          if (foundSeries.trailerVideo) {
            const path = extractPathFromUrl(foundSeries.trailerVideo);
            const signedUrl = generateSignedUrl(path);
            foundSeries.trailerVideo = signedUrl;
            setSignedTrailerUrl(signedUrl);
          }
          
          setSeries(foundSeries);
          
          // Create seasons array
          const totalSeasons = foundSeries.totalSeasons || 1;
          const seasonsArray = [];
          for (let i = 1; i <= totalSeasons; i++) {
            seasonsArray.push({ seasonNumber: i });
          }
          setSeasons(seasonsArray);
          
          // Load first season episodes
          if (seasonsArray.length > 0) {
            setSelectedSeason(seasonsArray[0].seasonNumber);
            await fetchEpisodes(foundSeries._id, seasonsArray[0].seasonNumber);
          }
        } else {
          setError('Series not found');
        }
      } else {
        setError('Failed to load series data');
      }
    } catch (error) {
      console.error('Error fetching series:', error);
      setError('Failed to load series');
    } finally {
      setLoading(false);
    }
  };

  // ==================== FETCH EPISODES (UPDATED URL) ====================
  const fetchEpisodes = async (seriesId, seasonNumber) => {
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await fetch(`${API_BASE_URL}/admin/episodes/series/${seriesId}/season/${seasonNumber}`, { headers });
      const data = await response.json();
      setEpisodes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching episodes:', error);
      setEpisodes([]);
    }
  };

  // ==================== HANDLE SEASON CHANGE ====================
  const handleSeasonSelect = async (seasonNumber) => {
    setSelectedSeason(seasonNumber);
    if (series) await fetchEpisodes(series._id, seasonNumber);
  };

  // ==================== GET CATEGORY NAME ====================
  const getCategoryName = (categoryId) => {
    const category = categoriesList.find(cat => cat._id === categoryId);
    return category ? category.name : categoryId?.substring(0, 8) || 'Unknown';
  };

  // ==================== TRAILER HANDLERS ====================
  const handleTrailerClick = () => setShowTrailer(true);
  const closeTrailer = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
    setShowTrailer(false);
  };

  // ==================== LOADING STATE ====================
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading series...</p>
        </div>
      </div>
    );
  }

  // ==================== ERROR STATE ====================
  if (error || !series) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🎬</div>
          <h2 className="text-2xl font-bold text-white mb-2">Series not found</h2>
          <p className="text-gray-400 mb-4">{error || 'The series you are looking for does not exist'}</p>
          <Link to="/tv-shows" className="mt-4 inline-block px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
            Back to TV Shows
          </Link>
        </div>
      </div>
    );
  }

  // ==================== MAIN RENDER ====================
  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section - Full Background Trailer */}
      <div className="relative min-h-[85vh] flex items-center justify-center">
        {/* Background Video/Image */}
        <div className="absolute inset-0 z-0">
          {showTrailer && signedTrailerUrl ? (
            <>
              <video
                ref={videoRef}
                src={signedTrailerUrl}
                className="w-full h-full object-cover"
                autoPlay
                muted={false}
                controls={false}
                loop={false}
                onError={(e) => console.error('Trailer video error:', e)}
              />
              <div className="absolute inset-0 bg-black/60"></div>
            </>
          ) : (
            <div 
              className="w-full h-full bg-cover bg-center bg-no-repeat"
              style={{ 
                backgroundImage: `url(${signedBannerImage || signedCoverImage || 'https://via.placeholder.com/1920x1080?text=ROG+TV+SERIES'})`,
              }}
            />
          )}
          {/* Dark Overlays for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/30"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-transparent"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12">
            
            {/* Poster Image - Hide when trailer plays */}
            {!showTrailer && (
              <div className="w-64 md:w-72 lg:w-80 flex-shrink-0">
                <div className="relative group">
                  <img
                    src={signedCoverImage || 'https://via.placeholder.com/300x450?text=No+Image'}
                    alt={series.title}
                    className="w-full rounded-xl shadow-2xl"
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/300x450?text=No+Image'; }}
                  />
                </div>
              </div>
            )}

            {/* Info Section */}
            <div className="flex-1 max-w-2xl text-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-2">
                {series.title}
              </h1>
              {series.alternativeName && (
                <p className="text-gray-300 text-base md:text-lg mb-4">{series.alternativeName}</p>
              )}

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-4 mb-6 justify-start">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-white font-semibold">{series.rating || 'N/A'}</span>
                </div>
                <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
                <span className="text-gray-300">{series.releaseYear}</span>
                <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
                <span className="text-gray-300">{series.totalSeasons || 0} {series.totalSeasons === 1 ? 'Season' : 'Seasons'}</span>
              </div>

              {/* Description */}
              <p className="text-gray-300 text-base md:text-lg leading-relaxed mb-6">
                {series.description}
              </p>

              {/* Categories */}
              {series.categories && series.categories.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6 justify-start">
                  {series.categories.map((cat, i) => (
                    <span key={i} className="px-3 py-1 bg-gray-800/80 text-gray-300 rounded-full text-sm">
                      {getCategoryName(cat)}
                    </span>
                  ))}
                </div>
              )}

              {/* Buttons */}
              <div className="flex flex-wrap gap-4 justify-start">
                {signedTrailerUrl && (
                  <button
                    onClick={showTrailer ? closeTrailer : handleTrailerClick}
                    className={`px-6 py-2.5 rounded-lg font-semibold transition flex items-center gap-2 ${
                      showTrailer 
                        ? 'bg-gray-700 text-white hover:bg-gray-600'
                        : 'bg-red-600 text-white hover:bg-red-700'
                    }`}
                  >
                    {showTrailer ? (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Close Trailer
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Play Trailer
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        {!showTrailer && (
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce z-10">
            <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
              <div className="w-1 h-2 bg-white/50 rounded-full mt-2 animate-scroll"></div>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-800 sticky top-0 bg-black/95 backdrop-blur z-40">
        <div className="container mx-auto px-4">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('episodes')}
              className={`py-4 text-lg font-semibold transition relative ${
                activeTab === 'episodes' ? 'text-red-500' : 'text-gray-400 hover:text-white'
              }`}
            >
              Episodes
              {activeTab === 'episodes' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('details')}
              className={`py-4 text-lg font-semibold transition relative ${
                activeTab === 'details' ? 'text-red-500' : 'text-gray-400 hover:text-white'
              }`}
            >
              Details
              {activeTab === 'details' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500"></div>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Episodes Tab */}
        {activeTab === 'episodes' && (
          <div>
            {/* Season Selector */}
            {seasons.length > 0 && (
              <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
                {seasons.map((season) => (
                  <button
                    key={season.seasonNumber}
                    onClick={() => handleSeasonSelect(season.seasonNumber)}
                    className={`px-5 py-2 rounded-full font-medium transition whitespace-nowrap ${
                      selectedSeason === season.seasonNumber
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    Season {season.seasonNumber}
                  </button>
                ))}
              </div>
            )}

            {/* Season Title */}
            <h2 className="text-2xl font-bold text-white mb-4">
              Season {selectedSeason}
            </h2>

            {/* Episodes List */}
            {episodes.length === 0 ? (
              <div className="text-center py-12 bg-gray-900/30 rounded-xl">
                <div className="text-5xl mb-3">📺</div>
                <p className="text-gray-400">No episodes available for this season yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {episodes.map((episode) => (
                  <Link
                    key={episode._id}
                    to={`/watch/${episode._id}`}
                    className="block bg-gray-900/50 rounded-lg p-4 hover:bg-gray-800/70 transition group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-lg">{episode.episodeNumber}</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-semibold group-hover:text-red-400 transition">
                          {episode.title}
                        </h3>
                        <p className="text-gray-400 text-sm line-clamp-1">
                          {episode.description || 'No description'}
                        </p>
                      </div>
                      <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M5 3l14 9-14 9V3z" />
                        </svg>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Details Tab */}
        {activeTab === 'details' && (
          <div className="max-w-3xl">
            <h3 className="text-xl font-semibold text-white mb-4">About {series.title}</h3>
            <p className="text-gray-300 leading-relaxed mb-8">
              {series.description || 'No description available'}
            </p>

            <div className="space-y-4">
              <div className="flex py-3 border-b border-gray-800">
                <span className="w-32 text-gray-400">Original Title:</span>
                <span className="text-white">{series.title}</span>
              </div>
              <div className="flex py-3 border-b border-gray-800">
                <span className="w-32 text-gray-400">Release Year:</span>
                <span className="text-white">{series.releaseYear}</span>
              </div>
              <div className="flex py-3 border-b border-gray-800">
                <span className="w-32 text-gray-400">Seasons:</span>
                <span className="text-white">{series.totalSeasons || 0}</span>
              </div>
              <div className="flex py-3 border-b border-gray-800">
                <span className="w-32 text-gray-400">Rating:</span>
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-white">{series.rating || 'N/A'}</span>
                </div>
              </div>
              {series.categories && series.categories.length > 0 && (
                <div className="flex py-3 border-b border-gray-800">
                  <span className="w-32 text-gray-400">Genres:</span>
                  <div className="flex flex-wrap gap-2">
                    {series.categories.map((cat, i) => (
                      <span key={i} className="text-white text-sm">
                        {getCategoryName(cat)}{i < series.categories.length - 1 ? ',' : ''}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Back Button */}
      <div className="container mx-auto px-4 pb-12">
        <Link 
          to="/tv-shows" 
          className="inline-flex items-center text-gray-500 hover:text-red-500 transition"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to TV Shows
        </Link>
      </div>
    </div>
  );
};

export default SeriesDetails;