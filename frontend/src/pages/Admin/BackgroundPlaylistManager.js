import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';

const BackgroundPlaylistManager = () => {
  const [videos, setVideos] = useState([]);
  const [playlist, setPlaylist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [file, setFile] = useState(null);

  useEffect(() => {
    fetchVideos();
    fetchPlaylist();
  }, []);

  const fetchVideos = async () => {
    try {
      const response = await api.get('/admin/background-videos/list');
      // Decode URLs when displaying
      const decodedVideos = response.data.map(video => ({
        ...video,
        name: decodeURIComponent(video.name),
        url: decodeURIComponent(video.url)
      }));
      setVideos(decodedVideos);
    } catch (error) {
      console.error('Error fetching videos:', error);
    }
  };

  const fetchPlaylist = async () => {
    try {
      const response = await api.get('/admin/background-videos/playlist');
      // Decode playlist URLs
      const decodedPlaylist = response.data.playlist.map(url => {
        try {
          return decodeURIComponent(url);
        } catch {
          return url;
        }
      });
      setPlaylist(decodedPlaylist);
    } catch (error) {
      console.error('Error fetching playlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setMessage('');
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage('Please select a video file');
      return;
    }

    const formData = new FormData();
    formData.append('video', file);
    formData.append('folder', 'backgrounds');

    setUploading(true);
    setProgress(0);

    try {
      const response = await api.post('/admin/upload-video', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(percent);
        }
      });
      
      setMessage('✅ Video uploaded successfully!');
      setFile(null);
      fetchVideos(); // Refresh video list
      
    } catch (error) {
      setMessage(`❌ Upload failed: ${error.response?.data?.message || error.message}`);
    } finally {
      setUploading(false);
    }
  };

  // Fix URL encoding when adding to playlist
  const addToPlaylist = (videoUrl) => {
    // Ensure URL is properly decoded
    const decodedUrl = decodeURIComponent(videoUrl);
    
    if (!playlist.includes(decodedUrl)) {
      const newPlaylist = [...playlist, decodedUrl];
      setPlaylist(newPlaylist);
      savePlaylistOrder(newPlaylist);
      setMessage(`✅ Added to playlist`);
    } else {
      setMessage(`⚠️ Already in playlist`);
    }
  };

  const removeFromPlaylist = (videoUrl) => {
    const newPlaylist = playlist.filter(url => url !== videoUrl);
    setPlaylist(newPlaylist);
    savePlaylistOrder(newPlaylist);
    setMessage(`✅ Removed from playlist`);
  };

  const savePlaylistOrder = async (newPlaylist) => {
    try {
      // Save with proper encoding
      await api.post('/admin/background-videos/order', { videoUrls: newPlaylist });
    } catch (error) {
      console.error('Error saving order:', error);
    }
  };

  const moveUp = (index) => {
    if (index > 0) {
      const newPlaylist = [...playlist];
      [newPlaylist[index], newPlaylist[index - 1]] = [newPlaylist[index - 1], newPlaylist[index]];
      setPlaylist(newPlaylist);
      savePlaylistOrder(newPlaylist);
    }
  };

  const moveDown = (index) => {
    if (index < playlist.length - 1) {
      const newPlaylist = [...playlist];
      [newPlaylist[index], newPlaylist[index + 1]] = [newPlaylist[index + 1], newPlaylist[index]];
      setPlaylist(newPlaylist);
      savePlaylistOrder(newPlaylist);
    }
  };

  const deleteVideo = async (videoName) => {
    if (window.confirm(`Delete "${videoName}" from Bunny CDN?`)) {
      try {
        // Encode filename for API call
        const encodedName = encodeURIComponent(videoName);
        await api.delete(`/admin/background-video/${encodedName}`);
        setMessage(`✅ Video deleted`);
        fetchVideos();
        // Remove from playlist if present
        const video = videos.find(v => v.name === videoName);
        if (video && playlist.includes(video.url)) {
          removeFromPlaylist(video.url);
        }
      } catch (error) {
        setMessage(`❌ Delete failed`);
      }
    }
  };

  // Helper function to get video name from URL
  const getVideoNameFromUrl = (url) => {
    try {
      const decoded = decodeURIComponent(url);
      return decoded.split('/').pop();
    } catch {
      return url.split('/').pop();
    }
  };

  if (loading) return <div className="text-white text-center py-8">Loading...</div>;

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-2xl font-bold text-white mb-6">🎬 Background Video Playlist</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Section */}
        <div className="bg-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">📤 Upload New Background Video</h3>
          
          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <label className="block text-gray-300 mb-2">Select Video File</label>
              <input
                type="file"
                onChange={handleFileChange}
                accept="video/mp4,video/webm"
                className="w-full px-4 py-2 rounded bg-gray-600 text-white border border-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-red-600 file:text-white hover:file:bg-red-700"
                required
              />
              <p className="text-gray-400 text-sm mt-1">MP4, WebM (Max 100MB) - Will be added to backgrounds folder</p>
            </div>

            {uploading && (
              <div className="mt-4">
                <div className="bg-gray-600 rounded-full h-4 overflow-hidden">
                  <div className="bg-red-600 h-4 transition-all duration-300" style={{ width: `${progress}%` }}></div>
                </div>
                <p className="text-gray-300 text-sm mt-1">{progress}% uploaded to Bunny CDN...</p>
              </div>
            )}

            {message && (
              <div className={`p-3 rounded ${message.includes('✅') ? 'bg-green-600' : 'bg-red-600'} text-white`}>
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={uploading || !file}
              className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? `Uploading... ${progress}%` : '📤 Upload to Bunny CDN'}
            </button>
          </form>
        </div>

        {/* Available Videos */}
        <div className="bg-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">📂 Available Videos</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {videos.length === 0 && (
              <p className="text-gray-400 text-center py-4">No videos found. Upload some videos first.</p>
            )}
            {videos.map((video) => (
              <div key={video.name} className="bg-gray-600 rounded p-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium truncate">{video.name}</p>
                    <p className="text-gray-400 text-xs">{(video.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => addToPlaylist(video.url)}
                      className="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700"
                    >
                      ➕ Add
                    </button>
                    <button
                      onClick={() => deleteVideo(video.name)}
                      className="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Playlist Section */}
      <div className="bg-gray-700 rounded-lg p-6 mt-6">
        <h3 className="text-lg font-semibold text-white mb-4">🎬 Playlist Order (Top to Bottom)</h3>
        <p className="text-gray-400 text-sm mb-3">Videos will play in this order, looping continuously</p>
        
        {playlist.length === 0 && (
          <div className="text-center py-8 bg-gray-600 rounded-lg">
            <p className="text-gray-400">No videos in playlist. Add videos from the list above.</p>
          </div>
        )}
        
        <div className="space-y-2">
          {playlist.map((videoUrl, index) => {
            const videoName = getVideoNameFromUrl(videoUrl);
            return (
              <div key={index} className="bg-gray-600 rounded p-3 flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <span className="text-red-400 font-bold w-8">{index + 1}</span>
                  <div className="flex-1">
                    <p className="text-white text-sm">{videoName}</p>
                    <p className="text-gray-400 text-xs truncate max-w-md">{videoUrl}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => moveUp(index)}
                    disabled={index === 0}
                    className="bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700 disabled:opacity-50"
                  >
                    ↑ Up
                  </button>
                  <button
                    onClick={() => moveDown(index)}
                    disabled={index === playlist.length - 1}
                    className="bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700 disabled:opacity-50"
                  >
                    ↓ Down
                  </button>
                  <button
                    onClick={() => removeFromPlaylist(videoUrl)}
                    className="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700"
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        
        {playlist.length > 0 && (
          <div className="mt-4 p-3 bg-green-900 rounded">
            <p className="text-green-300 text-sm">
              ✅ {playlist.length} video(s) in playlist. They will play in sequence on the landing page!
            </p>
          </div>
        )}
      </div>

      {/* Preview Section */}
      <div className="bg-gray-700 rounded-lg p-6 mt-6">
        <h3 className="text-lg font-semibold text-white mb-4">🎥 Live Preview</h3>
        <p className="text-gray-400 text-sm mb-3">This is how it will look on the landing page</p>
        <div className="relative rounded-lg overflow-hidden bg-black aspect-video">
          {playlist.length > 0 ? (
            <BackgroundVideoPlayer videos={playlist} />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <p className="text-gray-400">No videos in playlist</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Background Video Player Component with Playlist
const BackgroundVideoPlayer = ({ videos }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (videos.length === 0) return;
    
    const video = videoRef.current;
    if (!video) return;
    
    const handleEnded = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % videos.length);
      }, 100);
    };
    
    video.addEventListener('ended', handleEnded);
    return () => {
      video.removeEventListener('ended', handleEnded);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [videos.length]);

  useEffect(() => {
    if (videoRef.current && videos[currentIndex]) {
      const video = videoRef.current;
      const videoUrl = decodeURIComponent(videos[currentIndex]);
      
      video.src = videoUrl;
      video.load();
      
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch(error => console.warn('Playback prevented:', error.message));
      }
    }
  }, [currentIndex, videos]);

  if (videos.length === 0) return null;

  return (
    <video
      ref={videoRef}
      key={currentIndex}
      className="w-full h-full object-cover"
      autoPlay
      muted
      playsInline
    />
  );
};

export default BackgroundPlaylistManager;