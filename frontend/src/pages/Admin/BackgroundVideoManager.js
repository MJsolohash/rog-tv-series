import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const BackgroundVideoManager = () => {
  const [backgroundVideoUrl, setBackgroundVideoUrl] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBackgroundVideo();
  }, []);

  const fetchBackgroundVideo = async () => {
    try {
      const response = await api.get('/admin/settings/background-video');
      setBackgroundVideoUrl(response.data.videoUrl);
    } catch (error) {
      console.error('Error fetching background video:', error);
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
      
      const videoUrl = response.data.videoUrl;
      
      // Save as background video
      await api.post('/admin/settings/background-video', { videoUrl });
      setBackgroundVideoUrl(videoUrl);
      setMessage('✅ Background video uploaded and saved successfully!');
      setFile(null);
      
    } catch (error) {
      console.error('Upload error:', error);
      setMessage(`❌ Upload failed: ${error.response?.data?.message || error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleSetExistingVideo = async () => {
    const url = prompt('Enter the Bunny CDN video URL (from backgrounds folder):');
    if (url) {
      try {
        await api.post('/admin/settings/background-video', { videoUrl: url });
        setBackgroundVideoUrl(url);
        setMessage('✅ Background video updated successfully!');
      } catch (error) {
        setMessage('❌ Failed to update background video');
      }
    }
  };

  const handleRemove = async () => {
    if (window.confirm('Are you sure you want to remove the background video?')) {
      try {
        await api.post('/admin/settings/background-video', { videoUrl: '' });
        setBackgroundVideoUrl('');
        setMessage('✅ Background video removed');
      } catch (error) {
        setMessage('❌ Failed to remove background video');
      }
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="text-white text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-2xl font-bold text-white mb-6">🎬 Landing Page Background Video</h2>
      
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
              <p className="text-gray-400 text-sm mt-1">Supported: MP4, WebM (Max 100MB)</p>
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
              {uploading ? `Uploading... ${progress}%` : '🎬 Upload & Set as Background'}
            </button>
          </form>

          <div className="mt-4">
            <button
              onClick={handleSetExistingVideo}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
            >
              🔗 Use Existing Video URL
            </button>
          </div>
        </div>

        {/* Preview Section */}
        <div className="bg-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">🎥 Current Background Video</h3>
          
          {backgroundVideoUrl ? (
            <div>
              <div className="relative rounded-lg overflow-hidden bg-black">
                <video
                  src={backgroundVideoUrl}
                  className="w-full aspect-video object-cover"
                  autoPlay
                  loop
                  muted
                  playsInline
                  controls
                />
              </div>
              <div className="mt-4 space-y-3">
                <p className="text-gray-300 text-sm break-all">
                  <span className="text-gray-400">URL:</span><br />
                  {backgroundVideoUrl}
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={() => window.open(backgroundVideoUrl, '_blank')}
                    className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                  >
                    🔗 Open in Browser
                  </button>
                  <button
                    onClick={handleRemove}
                    className="flex-1 bg-red-600 text-white py-2 rounded hover:bg-red-700"
                  >
                    🗑️ Remove
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎬</div>
              <p className="text-gray-400">No background video set</p>
              <p className="text-gray-500 text-sm mt-2">Upload a video or use existing URL</p>
            </div>
          )}
        </div>
      </div>

      {/* Existing Videos in Backgrounds Folder */}
      <div className="bg-gray-700 rounded-lg p-6 mt-6">
        <h3 className="text-lg font-semibold text-white mb-3">📂 Existing Videos in Backgrounds Folder</h3>
        <p className="text-gray-400 text-sm mb-3">
          These videos are already uploaded. Click "Use as Background" to set them.
        </p>
        <div className="space-y-2">
          <div className="bg-gray-600 rounded p-3 flex justify-between items-center">
            <div>
              <p className="text-white text-sm">1777744595386-Bullet For My Valentine - P.O.W. (Official Video).mp4</p>
              <p className="text-gray-400 text-xs">https://rogtvseriespro.b-cdn.net/backgrounds/1777744595386-Bullet%20For%20My%20Valentine%20-%20P.O.W.%20(Official%20Video).mp4</p>
            </div>
            <button
              onClick={() => {
                const url = "https://rogtvseriespro.b-cdn.net/backgrounds/1777744595386-Bullet%20For%20My%20Valentine%20-%20P.O.W.%20(Official%20Video).mp4";
                api.post('/admin/settings/background-video', { videoUrl: url })
                  .then(() => {
                    setBackgroundVideoUrl(url);
                    setMessage('✅ Background video updated!');
                  })
                  .catch(() => setMessage('❌ Failed to update'));
              }}
              className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
            >
              Use as Background
            </button>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-gray-700 rounded-lg p-6 mt-6">
        <h3 className="text-lg font-semibold text-white mb-3">📝 How it works</h3>
        <ul className="text-gray-300 text-sm space-y-2 list-disc list-inside">
          <li>Background video will play automatically on the <strong>Login/Signup page</strong></li>
          <li>Video will be <strong>muted</strong> and <strong>loop continuously</strong> (auto-play requirements)</li>
          <li>Uploaded videos are stored in <strong>Bunny CDN (backgrounds folder)</strong></li>
          <li>Recommended resolution: <strong>1920x1080 (16:9)</strong></li>
          <li>File size: <strong>Under 50MB</strong> for fast loading</li>
        </ul>
      </div>
    </div>
  );
};

export default BackgroundVideoManager;