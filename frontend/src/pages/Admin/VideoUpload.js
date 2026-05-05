import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const VideoUpload = () => {
  const [uploadType, setUploadType] = useState('video');
  const [selectedFolder, setSelectedFolder] = useState('videos');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [uploadedUrl, setUploadedUrl] = useState('');
  const [backgroundVideoUrl, setBackgroundVideoUrl] = useState('');
  const [updatingBg, setUpdatingBg] = useState(false);
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' or 'background'

  // Load current background video
  useEffect(() => {
    fetchBackgroundVideo();
  }, []);

  const fetchBackgroundVideo = async () => {
    try {
      const response = await api.get('/admin/settings/background-video');
      setBackgroundVideoUrl(response.data.videoUrl);
    } catch (error) {
      console.error('Error fetching background video:', error);
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setMessage('');
    setUploadedUrl('');
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage('Please select a file');
      return;
    }

    const formData = new FormData();
    formData.append(uploadType === 'video' ? 'video' : 'image', file);
    formData.append('folder', selectedFolder);

    setUploading(true);
    setProgress(0);

    try {
      const endpoint = uploadType === 'video' ? '/admin/upload-video' : '/admin/upload-image';
      const response = await api.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(percent);
        }
      });
      
      const newUrl = response.data.videoUrl || response.data.imageUrl;
      setUploadedUrl(newUrl);
      setMessage(`✅ ${uploadType === 'video' ? 'Video' : 'Image'} uploaded successfully!`);
      setFile(null);
      
      // If this is a background video upload (selectedFolder is 'backgrounds'), ask to set it as background
      if (selectedFolder === 'backgrounds' && uploadType === 'video') {
        const setAsBg = window.confirm('This video was uploaded to backgrounds folder. Set it as landing page background video?');
        if (setAsBg) {
          await setAsBackgroundVideo(newUrl);
        }
      }
    } catch (error) {
      setMessage(`❌ Upload failed: ${error.response?.data?.message || error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const setAsBackgroundVideo = async (videoUrl) => {
    setUpdatingBg(true);
    try {
      await api.post('/admin/settings/background-video', { videoUrl });
      setBackgroundVideoUrl(videoUrl);
      setMessage('✅ Background video updated successfully! Refresh homepage to see changes.');
    } catch (error) {
      setMessage('❌ Failed to update background video');
    } finally {
      setUpdatingBg(false);
    }
  };

  const updateBackgroundFromExisting = async (url) => {
    if (!url) return;
    if (window.confirm('Set this video as landing page background?')) {
      await setAsBackgroundVideo(url);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(uploadedUrl);
    alert('URL copied to clipboard!');
  };

  const folders = [
    { value: 'backgrounds', label: '🎬 backgrounds/ (Landing Page Background)', type: 'video' },
    { value: 'videos', label: '📁 videos/ (Regular Videos)', type: 'video' },
    { value: 'trailers', label: '🎥 trailers/ (Series Trailers)', type: 'video' },
    { value: 'series', label: '📺 series/ (Series Content)', type: 'video' },
    { value: 'categories', label: '🏷️ categories/ (Category Images)', type: 'image' },
    { value: 'images', label: '🖼️ images/ (General Images)', type: 'image' },
  ];

  const availableFolders = folders.filter(f => 
    (uploadType === 'video' && f.type === 'video') || 
    (uploadType === 'image' && f.type === 'image')
  );

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      {/* Tab Switcher */}
      <div className="flex space-x-4 mb-6 border-b border-gray-700">
        <button
          onClick={() => setActiveTab('upload')}
          className={`px-4 py-2 transition ${activeTab === 'upload' ? 'text-red-500 border-b-2 border-red-500' : 'text-gray-400'}`}
        >
          📤 Upload Files
        </button>
        <button
          onClick={() => setActiveTab('background')}
          className={`px-4 py-2 transition ${activeTab === 'background' ? 'text-red-500 border-b-2 border-red-500' : 'text-gray-400'}`}
        >
          🎬 Background Video Settings
        </button>
      </div>

      {/* Upload Tab */}
      {activeTab === 'upload' && (
        <>
          <h2 className="text-2xl font-bold text-white mb-6">📤 Upload to Bunny CDN</h2>
          
          <div className="flex space-x-4 mb-6">
            <button onClick={() => setUploadType('video')} className={`px-4 py-2 rounded transition ${uploadType === 'video' ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>🎬 Video Upload</button>
            <button onClick={() => setUploadType('image')} className={`px-4 py-2 rounded transition ${uploadType === 'image' ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>🖼️ Image Upload</button>
          </div>

          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <label className="block text-gray-300 mb-2">Select Folder</label>
              <select
                value={selectedFolder}
                onChange={(e) => setSelectedFolder(e.target.value)}
                className="w-full px-4 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                {availableFolders.map(folder => (
                  <option key={folder.value} value={folder.value}>{folder.label}</option>
                ))}
              </select>
              <p className="text-gray-400 text-sm mt-1">
                {selectedFolder === 'backgrounds' && '🎬 This video will auto-play on the landing page (muted, loop)'}
                {selectedFolder === 'videos' && '📁 Regular videos that users can play with sound'}
                {selectedFolder === 'trailers' && '🎥 Short preview videos for series'}
                {selectedFolder === 'categories' && '🏷️ Images for categories'}
              </p>
            </div>

            <div>
              <label className="block text-gray-300 mb-2">Select {uploadType === 'video' ? 'Video' : 'Image'} File</label>
              <input 
                type="file" 
                onChange={handleFileChange} 
                accept={uploadType === 'video' ? 'video/mp4,video/webm' : 'image/jpeg,image/png,image/webp'} 
                className="w-full px-4 py-2 rounded bg-gray-700 text-white border border-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-red-600 file:text-white hover:file:bg-red-700" 
                required 
              />
              <p className="text-gray-400 text-sm mt-1">Supported: {uploadType === 'video' ? 'MP4, WebM (Max 500MB)' : 'JPG, PNG, WebP (Max 50MB)'}</p>
            </div>

            {uploading && (
              <div className="mt-4">
                <div className="bg-gray-700 rounded-full h-4 overflow-hidden">
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

            {uploadedUrl && (
              <div className="bg-gray-700 rounded p-3">
                <p className="text-gray-300 text-sm mb-2">File URL:</p>
                <div className="flex space-x-2">
                  <input type="text" value={uploadedUrl} readOnly className="flex-1 px-3 py-2 rounded bg-gray-600 text-white text-sm" />
                  <button type="button" onClick={copyToClipboard} className="px-3 py-2 bg-blue-600 rounded hover:bg-blue-700">Copy</button>
                </div>
                {selectedFolder === 'backgrounds' && uploadedUrl && (
                  <button
                    type="button"
                    onClick={() => updateBackgroundFromExisting(uploadedUrl)}
                    className="mt-2 w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700"
                  >
                    🎬 Set as Landing Page Background
                  </button>
                )}
              </div>
            )}

            <button 
              type="submit" 
              disabled={uploading || !file} 
              className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? `Uploading... ${progress}%` : `Upload to Bunny CDN`}
            </button>
          </form>
        </>
      )}

      {/* Background Video Settings Tab */}
      {activeTab === 'background' && (
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">🎬 Landing Page Background Video</h2>
          
          <div className="bg-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-3">Current Background Video</h3>
            
            {backgroundVideoUrl ? (
              <div>
                <p className="text-gray-300 text-sm mb-2 break-all">{backgroundVideoUrl}</p>
                <video 
                  src={backgroundVideoUrl} 
                  className="w-full max-h-64 object-contain rounded mb-3" 
                  controls 
                  autoPlay 
                  loop 
                  muted 
                />
                <div className="flex space-x-3">
                  <button 
                    onClick={() => window.open(backgroundVideoUrl, '_blank')}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    🔗 Preview in Browser
                  </button>
                  <button 
                    onClick={async () => {
                      if (window.confirm('Remove background video?')) {
                        await setAsBackgroundVideo('');
                      }
                    }}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                  >
                    🗑️ Remove
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400 mb-4">No background video set</p>
                <p className="text-gray-500 text-sm">Go to Upload tab and upload a video to <strong>"backgrounds/"</strong> folder</p>
              </div>
            )}
          </div>

          <div className="bg-gray-700 rounded-lg p-6 mt-4">
            <h3 className="text-lg font-semibold text-white mb-3">📝 Instructions</h3>
            <ul className="text-gray-300 text-sm space-y-2 list-disc list-inside">
              <li>Go to <strong>Upload Tab</strong></li>
              <li>Select <strong>Video Upload</strong></li>
              <li>Choose Folder: <strong>backgrounds/ (Landing Page Background)</strong></li>
              <li>Upload your video (MP4 format recommended)</li>
              <li>The video will auto-play on the login/signup page</li>
              <li>Video will be muted and loop continuously</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoUpload;