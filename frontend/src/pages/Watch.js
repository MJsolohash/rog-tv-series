import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { generateSignedUrl, extractPathFromUrl } from '../services/tokenService';

const Watch = () => {
  const { episodeId } = useParams();
  const [episode, setEpisode] = useState(null);
  const [series, setSeries] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showControls, setShowControls] = useState(true);
  
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const iframeRef = useRef(null);

  const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];

  // Helper function to check if video is from Bunny Stream
  const isBunnyStreamVideo = (videoUrl) => {
    return videoUrl && videoUrl.includes('player.mediadelivery.net');
  };

  // Convert player URL to embed URL
  const getEmbedUrl = (videoUrl) => {
    if (!videoUrl) return null;
    if (videoUrl.includes('player.mediadelivery.net')) {
      const match = videoUrl.match(/\/play\/(\d+)\/([a-f0-9-]+)/);
      if (match) {
        const libraryId = match[1];
        const videoId = match[2];
        return `https://iframe.mediadelivery.net/embed/${libraryId}/${videoId}`;
      }
    }
    return videoUrl;
  };

  // Get signed URL for Pull Zone videos
  const getSignedVideoUrl = (videoUrl) => {
    if (!videoUrl) return null;
    if (isBunnyStreamVideo(videoUrl)) return videoUrl;
    try {
      const path = extractPathFromUrl(videoUrl);
      return generateSignedUrl(path);
    } catch (error) {
      console.error('Error signing video URL:', error);
      return videoUrl;
    }
  };

  useEffect(() => {
    fetchEpisodeDetails();
  }, [episodeId]);

  // Handle video controls for MP4 player
  useEffect(() => {
    const video = videoRef.current;
    if (!video || isBunnyStreamVideo(episode?.videoUrl)) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleDurationChange = () => setDuration(video.duration);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('durationchange', handleDurationChange);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
    };
  }, [episode]);

  // Handle playback speed for MP4 player
  useEffect(() => {
    if (videoRef.current && !isBunnyStreamVideo(episode?.videoUrl)) {
      videoRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed, episode]);

  // Handle volume for MP4 player
  useEffect(() => {
    if (videoRef.current && !isBunnyStreamVideo(episode?.videoUrl)) {
      videoRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted, episode]);

  const fetchEpisodeDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching episode:', episodeId);
      
      // Use api instance - it already has token interceptor
      const episodeRes = await api.get(`/admin/episodes/${episodeId}`);
      console.log('Episode data:', episodeRes.data);
      
      if (episodeRes.data && episodeRes.data._id) {
        setEpisode(episodeRes.data);
        
        if (episodeRes.data.seriesId) {
          try {
            // line ~105 දිගේ
            const seriesRes = await fetch('https://video.menakajanith.site/api/direct-series');
            const seriesData = await seriesRes.json();
            if (seriesData.success && seriesData.series) {
              const foundSeries = seriesData.series.find(s => s._id === episodeRes.data.seriesId);
              setSeries(foundSeries);
            }
          } catch (err) {
            console.error('Series fetch error:', err);
          }
        }
      } else {
        setError('Episode not found');
      }
    } catch (apiError) {
      console.error('API error:', apiError);
      if (apiError.response?.status === 401) {
        setError('Please login to watch this episode');
      } else if (apiError.response?.status === 404) {
        setError('Episode not found');
      } else {
        setError('Failed to load episode');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePlayPause = () => {
    if (isBunnyStreamVideo(episode?.videoUrl)) return;
    const video = videoRef.current;
    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  };

  const handleSeek = (e) => {
    if (isBunnyStreamVideo(episode?.videoUrl)) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * duration;
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e) => {
    if (isBunnyStreamVideo(episode?.videoUrl)) return;
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const handleSpeedChange = (speed) => {
    if (isBunnyStreamVideo(episode?.videoUrl)) return;
    setPlaybackSpeed(speed);
  };

  const handleFullscreen = () => {
    if (playerRef.current) {
      if (!document.fullscreenElement) {
        playerRef.current.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    }
  };

  const handleMouseMove = () => {
    if (isBunnyStreamVideo(episode?.videoUrl)) return;
    setShowControls(true);
    if (window.controlsTimeout) clearTimeout(window.controlsTimeout);
    window.controlsTimeout = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '0:00';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Keyboard shortcuts (only for MP4 player)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isBunnyStreamVideo(episode?.videoUrl)) return;
      const video = videoRef.current;
      if (!video) return;

      switch(e.key) {
        case ' ':
        case 'Space':
          e.preventDefault();
          handlePlayPause();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          video.currentTime = Math.max(0, video.currentTime - 10);
          break;
        case 'ArrowRight':
          e.preventDefault();
          video.currentTime = Math.min(duration, video.currentTime + 10);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setVolume(Math.min(1, volume + 0.1));
          setIsMuted(false);
          break;
        case 'ArrowDown':
          e.preventDefault();
          setVolume(Math.max(0, volume - 0.1));
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          handleFullscreen();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, duration, volume, episode]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-400 mt-4">Loading episode...</p>
      </div>
    );
  }

  if (!episode) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🎬</div>
          <h2 className="text-2xl font-bold text-white mb-2">Episode not found</h2>
          <p className="text-gray-400 mb-6">The episode you are looking for does not exist</p>
          <Link to="/tv-shows" className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
            Back to TV Shows
          </Link>
        </div>
      </div>
    );
  }

  const isStream = isBunnyStreamVideo(episode.videoUrl);
  const signedVideoUrl = !isStream ? getSignedVideoUrl(episode.videoUrl) : null;
  const embedUrl = isStream ? getEmbedUrl(episode.videoUrl) : null;

  return (
    <div className="min-h-screen bg-black">
      {error && (
        <div className="bg-red-600/20 border-b border-red-600/30 py-2 px-4 text-center">
          <p className="text-red-400 text-xs">{error}</p>
          {error === 'Please login to watch this episode' && (
            <Link to="/" className="ml-2 text-red-400 underline">Go to Login</Link>
          )}
        </div>
      )}

      {/* Video Player Section */}
      <div 
        ref={playerRef}
        className="relative bg-black"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setShowControls(true)}
      >
        {isStream && embedUrl ? (
          <iframe
            ref={iframeRef}
            src={`${embedUrl}?autoplay=true&responsive=true&loop=false&muted=false&preload=true`}
            className="w-full h-[70vh]"
            allowFullScreen
            allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
            title={episode.title}
          />
        ) : signedVideoUrl ? (
          // Custom MP4 player with token
          <>
            <video
              ref={videoRef}
              src={signedVideoUrl}
              className="w-full h-[70vh] object-contain"
              autoPlay
              onClick={handlePlayPause}
              poster={episode.thumbnail}
            />
            
            {/* Video Controls */}
            <div 
              className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 transition-opacity duration-300 ${
                showControls ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div 
                className="w-full h-1 bg-gray-600 rounded-full cursor-pointer mb-4 group"
                onClick={handleSeek}
              >
                <div 
                  className="h-full bg-red-600 rounded-full relative"
                  style={{ width: `${(currentTime / duration) * 100}%` }}
                >
                  <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-red-600 rounded-full opacity-0 group-hover:opacity-100 transition"></div>
                </div>
              </div>

              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center space-x-4">
                  <button onClick={handlePlayPause} className="text-white hover:text-red-500 transition">
                    {isPlaying ? (
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M5 3l14 9-14 9V3z" />
                      </svg>
                    )}
                  </button>

                  <div className="flex items-center space-x-2">
                    <button onClick={() => setIsMuted(!isMuted)} className="text-white hover:text-red-500 transition">
                      {isMuted ? (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                        </svg>
                      )}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="w-20 h-1 bg-gray-600 rounded-lg cursor-pointer accent-red-600"
                    />
                  </div>

                  <div className="text-white text-sm">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="relative group">
                    <button className="text-white hover:text-red-500 transition text-sm px-2 py-1 rounded bg-gray-800/50">
                      {playbackSpeed}x
                    </button>
                    <div className="absolute bottom-full right-0 mb-2 bg-gray-800 rounded-lg shadow-lg overflow-hidden hidden group-hover:block">
                      {speeds.map((speed) => (
                        <button
                          key={speed}
                          onClick={() => handleSpeedChange(speed)}
                          className={`block w-full px-4 py-2 text-sm text-left hover:bg-gray-700 transition ${
                            playbackSpeed === speed ? 'text-red-500' : 'text-white'
                          }`}
                        >
                          {speed}x
                        </button>
                      ))}
                    </div>
                  </div>

                  <button onClick={handleFullscreen} className="text-white hover:text-red-500 transition">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {!isPlaying && !showControls && (
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  onClick={handlePlayPause}
                  className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700 transition transform hover:scale-110"
                >
                  <svg className="w-10 h-10 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M5 3l14 9-14 9V3z" />
                  </svg>
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-[70vh] bg-gray-900 flex items-center justify-center">
            <p className="text-gray-500">No video source available</p>
          </div>
        )}
      </div>

      {/* Episode Info */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl">
          <Link 
            to={`/series/${episode.seriesId}`} 
            className="text-red-500 hover:text-red-400 transition inline-flex items-center mb-4"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Series
          </Link>
          
          <h1 className="text-3xl font-bold text-white mb-2">
            {episode.title}
          </h1>
          
          <div className="flex items-center gap-4 text-gray-400 mb-4">
            {series && <span>{series.title}</span>}
            {series && <span>•</span>}
            <span>Season {episode.seasonNumber}</span>
            <span>•</span>
            <span>Episode {episode.episodeNumber}</span>
            {isStream && <span className="text-green-500 text-xs">🎬 Bunny Stream HD</span>}
          </div>
          
          {episode.description && (
            <p className="text-gray-300 leading-relaxed">
              {episode.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Watch;