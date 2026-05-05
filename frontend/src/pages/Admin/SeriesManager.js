import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const SeriesManager = () => {
  const [series, setSeries] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [episodes, setEpisodes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSeries, setActiveSeries] = useState(null);
  const [activeSeason, setActiveSeason] = useState(null);
  const [showSeriesModal, setShowSeriesModal] = useState(false);
  const [showSeasonModal, setShowSeasonModal] = useState(false);
  const [showEpisodeModal, setShowEpisodeModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [view, setView] = useState('series');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingSeasonImage, setUploadingSeasonImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [seriesForm, setSeriesForm] = useState({
    title: '',
    alternativeName: '',
    description: '',
    coverImage: '',
    bannerImage: '',
    trailerVideo: '',
    categories: [],
    genre: [],
    releaseYear: new Date().getFullYear(),
    rating: 0
  });

  const [seasonForm, setSeasonForm] = useState({
    seasonNumber: 1,
    title: '',
    description: '',
    seasonImage: '',
    releaseDate: new Date().toISOString().split('T')[0]
  });

  const [episodeForm, setEpisodeForm] = useState({
    seasonNumber: 1,
    episodeNumber: 1,
    title: '',
    description: '',
    videoUrl: '',
    thumbnail: '',
    duration: 0,
    isFree: false
  });

  useEffect(() => {
    fetchSeries();
    fetchCategories();
  }, []);

  const fetchSeries = async () => {
    try {
      const response = await api.get('/admin/series');
      setSeries(response.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/admin/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchSeasons = async (seriesId) => {
    try {
      const response = await api.get(`/admin/seasons/${seriesId}`);
      setSeasons(response.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchEpisodes = async (seriesId, seasonNumber) => {
    try {
      const response = await api.get(`/admin/episodes/series/${seriesId}/season/${seasonNumber}`);
      setEpisodes(response.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Upload Image function (for cover, banner, season image)
  const handleImageUpload = async (e, field, type = 'series') => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    formData.append('folder', type === 'series' ? 'series' : 'seasons');
    
    if (type === 'series') setUploadingImage(true);
    else setUploadingSeasonImage(true);
    
    try {
      const response = await api.post('/admin/upload-image', formData, { 
        headers: { 'Content-Type': 'multipart/form-data' } 
      });
      
      if (type === 'series') {
        setSeriesForm({ ...seriesForm, [field]: response.data.imageUrl });
      } else {
        setSeasonForm({ ...seasonForm, [field]: response.data.imageUrl });
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Image upload failed');
    } finally {
      if (type === 'series') setUploadingImage(false);
      else setUploadingSeasonImage(false);
    }
  };

  // Upload Trailer Video function (to Bunny Storage)
  const handleTrailerVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('video', file);
    formData.append('folder', 'trailers');
    
    setUploadingVideo(true);
    try {
      const response = await api.post('/admin/upload-video', formData, { 
        headers: { 'Content-Type': 'multipart/form-data' } 
      });
      setSeriesForm({ ...seriesForm, trailerVideo: response.data.videoUrl });
    } catch (error) {
      console.error('Upload error:', error);
      alert('Trailer video upload failed');
    } finally {
      setUploadingVideo(false);
    }
  };

  // Upload Episode Video function (to Bunny Stream with Series ID)
  const handleEpisodeVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      alert('Please select a video file');
      return;
    }
    
    if (file.size > 2 * 1024 * 1024 * 1024) {
      alert('File too large. Max 2GB');
      return;
    }
    
    const formData = new FormData();
    formData.append('video', file);
    formData.append('seriesId', activeSeries._id);  // ← IMPORTANT: Send series ID
    formData.append('seasonNumber', activeSeason);
    formData.append('episodeNumber', episodeForm.episodeNumber);
    formData.append('title', episodeForm.title);
    
    setUploadingVideo(true);
    setUploadProgress(0);
    
    try {
      const response = await api.post('/admin/upload-episode-stream', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 10 * 60 * 1000,
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percent);
          console.log(`Upload progress: ${percent}%`);
        }
      });
      
      if (response.data.videoUrl) {
        setEpisodeForm({ ...episodeForm, videoUrl: response.data.videoUrl });
        alert(`✅ Episode uploaded successfully!\nTitle: ${response.data.title || 'Success'}`);
      } else {
        alert('Upload succeeded but no video URL returned');
      }
      
    } catch (error) {
      console.error('Upload error:', error);
      alert(error.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setUploadingVideo(false);
      setUploadProgress(0);
    }
  };

  const handleSeriesSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await api.put(`/admin/series/${editingItem._id}`, seriesForm);
      } else {
        await api.post('/admin/series', seriesForm);
      }
      fetchSeries();
      setShowSeriesModal(false);
      resetForms();
    } catch (error) {
      console.error('Error:', error);
      alert(error.response?.data?.message || 'Error saving series');
    }
  };

  const handleSeasonSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = { ...seasonForm, seriesId: activeSeries._id };
      if (editingItem) {
        await api.put(`/admin/seasons/${editingItem._id}`, data);
      } else {
        await api.post('/admin/seasons', data);
      }
      fetchSeasons(activeSeries._id);
      setShowSeasonModal(false);
      resetForms();
    } catch (error) {
      console.error('Error:', error);
      alert(error.response?.data?.message || 'Error saving season');
    }
  };

  const handleEpisodeSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...episodeForm,
        seriesId: activeSeries._id,
        seasonNumber: activeSeason
      };
      if (editingItem) {
        await api.put(`/admin/episodes/${editingItem._id}`, data);
      } else {
        await api.post('/admin/episodes', data);
      }
      fetchEpisodes(activeSeries._id, activeSeason);
      setShowEpisodeModal(false);
      resetForms();
    } catch (error) {
      console.error('Error:', error);
      alert(error.response?.data?.message || 'Error saving episode');
    }
  };

  const handleDelete = async (type, id) => {
    if (window.confirm('Are you sure you want to delete this?')) {
      try {
        await api.delete(`/admin/${type}/${id}`);
        if (type === 'series') {
          fetchSeries();
        } else if (type === 'seasons') {
          fetchSeasons(activeSeries._id);
        } else {
          fetchEpisodes(activeSeries._id, activeSeason);
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Error deleting');
      }
    }
  };

  const resetForms = () => {
    setSeriesForm({
      title: '',
      alternativeName: '',
      description: '',
      coverImage: '',
      bannerImage: '',
      trailerVideo: '',
      categories: [],
      genre: [],
      releaseYear: new Date().getFullYear(),
      rating: 0
    });
    setSeasonForm({
      seasonNumber: 1,
      title: '',
      description: '',
      seasonImage: '',
      releaseDate: new Date().toISOString().split('T')[0]
    });
    setEpisodeForm({
      seasonNumber: 1,
      episodeNumber: 1,
      title: '',
      description: '',
      videoUrl: '',
      thumbnail: '',
      duration: 0,
      isFree: false
    });
    setEditingItem(null);
  };

  if (loading) return <div className="text-white text-center py-8">Loading...</div>;

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      {/* Header with Navigation */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-4">
          <button
            onClick={() => { setView('series'); setActiveSeries(null); setActiveSeason(null); }}
            className={`px-4 py-2 rounded transition ${view === 'series' ? 'bg-red-600' : 'bg-gray-700 hover:bg-gray-600'}`}
          >
            📋 Series
          </button>
          {activeSeries && (
            <>
              <button
                onClick={() => { setView('seasons'); fetchSeasons(activeSeries._id); }}
                className={`px-4 py-2 rounded transition ${view === 'seasons' ? 'bg-red-600' : 'bg-gray-700 hover:bg-gray-600'}`}
              >
                🎬 Seasons
              </button>
              {activeSeason && (
                <button
                  onClick={() => { setView('episodes'); fetchEpisodes(activeSeries._id, activeSeason); }}
                  className={`px-4 py-2 rounded transition ${view === 'episodes' ? 'bg-red-600' : 'bg-gray-700 hover:bg-gray-600'}`}
                >
                  📺 Episodes
                </button>
              )}
            </>
          )}
        </div>
        
        {view === 'series' && (
          <button onClick={() => { resetForms(); setShowSeriesModal(true); }} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
            + Add Series
          </button>
        )}
        {view === 'seasons' && (
          <button onClick={() => { resetForms(); setShowSeasonModal(true); }} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
            + Add Season
          </button>
        )}
        {view === 'episodes' && (
          <button onClick={() => { resetForms(); setShowEpisodeModal(true); }} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
            + Add Episode
          </button>
        )}
      </div>

      {/* Categories Selection */}
      <div>
        <label className="block text-gray-300 mb-2">Categories</label>
        <select
          multiple
          value={seriesForm.categories || []}
          onChange={(e) => {
            const selectedValues = Array.from(e.target.selectedOptions, option => option.value);
            setSeriesForm({...seriesForm, categories: selectedValues});
          }}
          className="w-full px-3 py-2 rounded bg-gray-700 text-white h-32"
        >
          {categories.length === 0 && (
            <option value="" disabled>No categories available. Create one in Categories tab first.</option>
          )}
          {categories.map(cat => (
            <option key={cat._id} value={cat._id}>{cat.name}</option>
          ))}
        </select>
        <p className="text-gray-400 text-sm mt-1">Hold Ctrl (Windows) or Cmd (Mac) to select multiple categories</p>
        {categories.length === 0 && (
          <p className="text-yellow-500 text-sm mt-1">⚠️ No categories found. Please go to Categories tab and create some categories first.</p>
        )}
      </div>

      {/* ==================== SERIES LIST ==================== */}
      {view === 'series' && (
        <div className="grid grid-cols-1 gap-4">
          {series.length === 0 && (
            <div className="text-center text-gray-400 py-8">No series yet. Click "Add Series" to create one.</div>
          )}
          {series.map(s => (
            <div key={s._id} className="bg-gray-700 rounded-lg p-4 hover:bg-gray-650 transition">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-4">
                    {s.coverImage && <img src={s.coverImage} alt={s.title} className="w-16 h-24 object-cover rounded" />}
                    <div>
                      <h3 className="text-xl font-bold text-white">{s.title}</h3>
                      {s.alternativeName && <p className="text-gray-400 text-sm">{s.alternativeName}</p>}
                      <p className="text-gray-300 text-sm mt-1">{s.description?.substring(0, 100)}...</p>
                      {s.trailerVideo && <p className="text-blue-400 text-xs mt-1">🎬 Trailer available</p>}
                      <div className="flex flex-wrap gap-2 mt-2">
                        {s.categories?.map(c => <span key={c._id} className="bg-red-600 px-2 py-0.5 rounded text-xs">{c.name}</span>)}
                      </div>
                      <div className="flex space-x-4 mt-2 text-sm text-gray-400">
                        <span>⭐ {s.rating}</span>
                        <span>📅 {s.releaseYear}</span>
                        <span>🎬 {s.totalSeasons} Seasons</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button onClick={() => { setActiveSeries(s); setView('seasons'); fetchSeasons(s._id); }} className="bg-blue-600 px-3 py-1 rounded hover:bg-blue-700">Manage</button>
                  <button onClick={() => { setEditingItem(s); setSeriesForm(s); setShowSeriesModal(true); }} className="bg-yellow-600 px-3 py-1 rounded hover:bg-yellow-700">Edit</button>
                  <button onClick={() => handleDelete('series', s._id)} className="bg-red-600 px-3 py-1 rounded hover:bg-red-700">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ==================== SEASONS LIST ==================== */}
      {view === 'seasons' && (
        <div>
          <div className="mb-4">
            <button onClick={() => setView('series')} className="text-blue-400 hover:underline mb-4 block">← Back to {activeSeries?.title}</button>
          </div>
          {seasons.length === 0 && (
            <div className="text-center text-gray-400 py-8">No seasons yet. Click "Add Season" to create one.</div>
          )}
          <div className="space-y-3">
            {seasons.map(season => (
              <div key={season._id} className="bg-gray-700 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    {season.seasonImage && <img src={season.seasonImage} alt={season.title} className="w-12 h-16 object-cover rounded" />}
                    <div>
                      <h3 className="text-lg font-bold text-white">Season {season.seasonNumber}</h3>
                      {season.title && <p className="text-gray-300">{season.title}</p>}
                      <p className="text-gray-400 text-sm">{season.description}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button onClick={() => { setActiveSeason(season.seasonNumber); fetchEpisodes(activeSeries._id, season.seasonNumber); setView('episodes'); }} className="bg-blue-600 px-3 py-1 rounded hover:bg-blue-700">Episodes</button>
                    <button onClick={() => { setEditingItem(season); setSeasonForm(season); setShowSeasonModal(true); }} className="bg-yellow-600 px-3 py-1 rounded hover:bg-yellow-700">Edit</button>
                    <button onClick={() => handleDelete('seasons', season._id)} className="bg-red-600 px-3 py-1 rounded hover:bg-red-700">Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================== EPISODES LIST ==================== */}
      {view === 'episodes' && (
        <div>
          <div className="mb-4">
            <button onClick={() => { setActiveSeason(null); setView('seasons'); }} className="text-blue-400 hover:underline mb-4 block">← Back to Seasons</button>
            <h2 className="text-xl font-bold text-white">Season {activeSeason}</h2>
          </div>
          {episodes.length === 0 && (
            <div className="text-center text-gray-400 py-8">No episodes yet. Click "Add Episode" to create one.</div>
          )}
          <div className="space-y-2">
            {episodes.map(episode => (
              <div key={episode._id} className="bg-gray-700 rounded-lg p-3 flex justify-between items-center">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <span className="text-red-400 font-bold">E{episode.episodeNumber}</span>
                    <span className="text-white font-semibold">{episode.title}</span>
                    {episode.isFree && <span className="bg-green-600 px-2 py-0.5 rounded text-xs">FREE</span>}
                  </div>
                  <p className="text-gray-400 text-sm truncate max-w-md">{episode.description}</p>
                  {episode.videoUrl && <p className="text-xs text-gray-500 truncate mt-1">{episode.videoUrl}</p>}
                </div>
                <div className="flex space-x-2">
                  <button onClick={() => { setEditingItem(episode); setEpisodeForm(episode); setShowEpisodeModal(true); }} className="bg-yellow-600 px-3 py-1 rounded text-sm">Edit</button>
                  <button onClick={() => handleDelete('episodes', episode._id)} className="bg-red-600 px-3 py-1 rounded text-sm">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================== SERIES MODAL ==================== */}
      {showSeriesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-gray-800 rounded-lg p-8 max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
            <h2 className="text-2xl font-bold text-white mb-4">{editingItem ? 'Edit Series' : 'Add New Series'}</h2>
            <form onSubmit={handleSeriesSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-gray-300 mb-2">Title *</label><input type="text" value={seriesForm.title} onChange={(e) => setSeriesForm({...seriesForm, title: e.target.value})} className="w-full px-3 py-2 rounded bg-gray-700 text-white" required /></div>
                <div><label className="block text-gray-300 mb-2">Alternative Name</label><input type="text" value={seriesForm.alternativeName} onChange={(e) => setSeriesForm({...seriesForm, alternativeName: e.target.value})} className="w-full px-3 py-2 rounded bg-gray-700 text-white" /></div>
              </div>
              <div><label className="block text-gray-300 mb-2">Description *</label><textarea rows="4" value={seriesForm.description} onChange={(e) => setSeriesForm({...seriesForm, description: e.target.value})} className="w-full px-3 py-2 rounded bg-gray-700 text-white" required /></div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 mb-2">Cover Image</label>
                  <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'coverImage', 'series')} disabled={uploadingImage} className="w-full px-3 py-2 rounded bg-gray-700 text-white" />
                  {uploadingImage && <p className="text-gray-400 text-sm mt-1">Uploading...</p>}
                  <input type="text" value={seriesForm.coverImage} onChange={(e) => setSeriesForm({...seriesForm, coverImage: e.target.value})} placeholder="Or enter image URL" className="w-full mt-2 px-3 py-2 rounded bg-gray-700 text-white" />
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">Banner Image</label>
                  <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'bannerImage', 'series')} disabled={uploadingImage} className="w-full px-3 py-2 rounded bg-gray-700 text-white" />
                  <input type="text" value={seriesForm.bannerImage} onChange={(e) => setSeriesForm({...seriesForm, bannerImage: e.target.value})} placeholder="Or enter image URL" className="w-full mt-2 px-3 py-2 rounded bg-gray-700 text-white" />
                </div>
              </div>
              
              {/* Trailer Video - with Upload Option */}
              <div>
                <label className="block text-gray-300 mb-2">Trailer Video (Bunny CDN)</label>
                <input type="file" accept="video/*" onChange={handleTrailerVideoUpload} disabled={uploadingVideo} className="w-full px-3 py-2 rounded bg-gray-700 text-white" />
                {uploadingVideo && <p className="text-gray-400 text-sm mt-1">Uploading video to Bunny CDN...</p>}
                <input type="text" value={seriesForm.trailerVideo} onChange={(e) => setSeriesForm({...seriesForm, trailerVideo: e.target.value})} placeholder="Or enter video URL" className="w-full mt-2 px-3 py-2 rounded bg-gray-700 text-white" />
              </div>
              
              <div>
                <label className="block text-gray-300 mb-2">Categories</label>
                <select multiple value={seriesForm.categories} onChange={(e) => setSeriesForm({...seriesForm, categories: Array.from(e.target.selectedOptions, option => option.value)})} className="w-full px-3 py-2 rounded bg-gray-700 text-white h-24">
                  {categories.map(cat => (<option key={cat._id} value={cat._id}>{cat.name}</option>))}
                </select>
                <p className="text-gray-400 text-sm mt-1">Hold Ctrl/Cmd to select multiple</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-gray-300 mb-2">Release Year</label><input type="number" value={seriesForm.releaseYear} onChange={(e) => setSeriesForm({...seriesForm, releaseYear: parseInt(e.target.value)})} className="w-full px-3 py-2 rounded bg-gray-700 text-white" /></div>
                <div><label className="block text-gray-300 mb-2">Rating (0-10)</label><input type="number" step="0.1" max="10" value={seriesForm.rating} onChange={(e) => setSeriesForm({...seriesForm, rating: parseFloat(e.target.value)})} className="w-full px-3 py-2 rounded bg-gray-700 text-white" /></div>
              </div>
              <div className="flex justify-end space-x-3"><button type="button" onClick={() => setShowSeriesModal(false)} className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-700">Cancel</button><button type="submit" className="px-4 py-2 bg-red-600 rounded hover:bg-red-700">Save</button></div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== SEASON MODAL ==================== */}
      {showSeasonModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-white mb-4">{editingItem ? 'Edit Season' : 'Add Season'}</h2>
            <form onSubmit={handleSeasonSubmit} className="space-y-4">
              <div><label className="block text-gray-300 mb-2">Season Number *</label><input type="number" value={seasonForm.seasonNumber} onChange={(e) => setSeasonForm({...seasonForm, seasonNumber: parseInt(e.target.value)})} className="w-full px-3 py-2 rounded bg-gray-700 text-white" required /></div>
              <div><label className="block text-gray-300 mb-2">Title</label><input type="text" value={seasonForm.title} onChange={(e) => setSeasonForm({...seasonForm, title: e.target.value})} className="w-full px-3 py-2 rounded bg-gray-700 text-white" /></div>
              <div><label className="block text-gray-300 mb-2">Description</label><textarea rows="3" value={seasonForm.description} onChange={(e) => setSeasonForm({...seasonForm, description: e.target.value})} className="w-full px-3 py-2 rounded bg-gray-700 text-white" /></div>
              
              {/* Season Image - with Upload Option */}
              <div>
                <label className="block text-gray-300 mb-2">Season Image</label>
                <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'seasonImage', 'season')} disabled={uploadingSeasonImage} className="w-full px-3 py-2 rounded bg-gray-700 text-white" />
                {uploadingSeasonImage && <p className="text-gray-400 text-sm mt-1">Uploading image...</p>}
                <input type="text" value={seasonForm.seasonImage} onChange={(e) => setSeasonForm({...seasonForm, seasonImage: e.target.value})} placeholder="Or enter image URL" className="w-full mt-2 px-3 py-2 rounded bg-gray-700 text-white" />
                {seasonForm.seasonImage && <img src={seasonForm.seasonImage} alt="Season preview" className="mt-2 w-32 h-24 object-cover rounded" />}
              </div>
              
              <div className="flex justify-end space-x-3"><button type="button" onClick={() => setShowSeasonModal(false)} className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-700">Cancel</button><button type="submit" className="px-4 py-2 bg-red-600 rounded hover:bg-red-700">Save</button></div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== EPISODE MODAL ==================== */}
      {showEpisodeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-white mb-4">{editingItem ? 'Edit Episode' : 'Add Episode'}</h2>
            <form onSubmit={handleEpisodeSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-gray-300 mb-2">Episode Number *</label><input type="number" value={episodeForm.episodeNumber} onChange={(e) => setEpisodeForm({...episodeForm, episodeNumber: parseInt(e.target.value)})} className="w-full px-3 py-2 rounded bg-gray-700 text-white" required /></div>
                <div><label className="block text-gray-300 mb-2">Duration (seconds)</label><input type="number" value={episodeForm.duration} onChange={(e) => setEpisodeForm({...episodeForm, duration: parseInt(e.target.value)})} className="w-full px-3 py-2 rounded bg-gray-700 text-white" /></div>
              </div>
              <div><label className="block text-gray-300 mb-2">Title *</label><input type="text" value={episodeForm.title} onChange={(e) => setEpisodeForm({...episodeForm, title: e.target.value})} className="w-full px-3 py-2 rounded bg-gray-700 text-white" required /></div>
              <div><label className="block text-gray-300 mb-2">Description</label><textarea rows="3" value={episodeForm.description} onChange={(e) => setEpisodeForm({...episodeForm, description: e.target.value})} className="w-full px-3 py-2 rounded bg-gray-700 text-white" /></div>
              
              <div>
                <label className="block text-gray-300 mb-2">Episode Video (Bunny Stream)</label>
                <input type="file" accept="video/*" onChange={handleEpisodeVideoUpload} disabled={uploadingVideo} className="w-full px-3 py-2 rounded bg-gray-700 text-white" />
                {uploadingVideo && (
                  <div className="mt-2">
                    <p className="text-gray-400 text-sm">Uploading... {uploadProgress}%</p>
                    <div className="w-full bg-gray-600 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
                    </div>
                  </div>
                )}
                {episodeForm.videoUrl && (
                  <div className="mt-2 p-2 bg-gray-600 rounded">
                    <p className="text-green-400 text-xs">✅ Uploaded to Bunny Stream</p>
                    <p className="text-gray-400 text-xs truncate">{episodeForm.videoUrl}</p>
                  </div>
                )}
              </div>
              
              <div><label className="block text-gray-300 mb-2">Thumbnail URL</label><input type="text" value={episodeForm.thumbnail} onChange={(e) => setEpisodeForm({...episodeForm, thumbnail: e.target.value})} className="w-full px-3 py-2 rounded bg-gray-700 text-white" /></div>
              <div className="flex items-center"><input type="checkbox" checked={episodeForm.isFree} onChange={(e) => setEpisodeForm({...episodeForm, isFree: e.target.checked})} className="mr-2" /><label className="text-gray-300">Free Episode (no login required)</label></div>
              <div className="flex justify-end space-x-3"><button type="button" onClick={() => setShowEpisodeModal(false)} className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-700">Cancel</button><button type="submit" className="px-4 py-2 bg-red-600 rounded hover:bg-red-700">Save</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeriesManager;