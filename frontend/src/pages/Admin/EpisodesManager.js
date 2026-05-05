import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const EpisodesManager = () => {
  const [episodes, setEpisodes] = useState([]);
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    seriesId: '',
    season: 1,
    episodeNumber: 1,
    title: '',
    videoUrl: '',
    description: ''
  });

  useEffect(() => {
    fetchEpisodes();
    fetchSeries();
  }, []);

  const fetchEpisodes = async () => {
    try {
      const response = await api.get('/admin/episodes');
      setEpisodes(response.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSeries = async () => {
    try {
      const response = await api.get('/admin/series');
      setSeries(response.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/episodes', formData);
      fetchEpisodes();
      setShowModal(false);
      setFormData({
        seriesId: '',
        season: 1,
        episodeNumber: 1,
        title: '',
        videoUrl: '',
        description: ''
      });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      await api.delete(`/admin/episodes/${id}`);
      fetchEpisodes();
    }
  };

  if (loading) return <div className="text-white">Loading...</div>;

  return (
    <div>
      <div className="flex justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Episodes Management</h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          + Add Episode
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-white">
          <thead className="bg-gray-800">
            <tr>
              <th className="p-3 text-left">Series</th>
              <th className="p-3 text-left">Season</th>
              <th className="p-3 text-left">Episode</th>
              <th className="p-3 text-left">Title</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {episodes.map(ep => (
              <tr key={ep._id} className="border-b border-gray-700">
                <td className="p-3">{ep.seriesId?.title || 'N/A'}</td>
                <td className="p-3">S{ep.season}</td>
                <td className="p-3">E{ep.episodeNumber}</td>
                <td className="p-3">{ep.title}</td>
                <td className="p-3">
                  <button
                    onClick={() => handleDelete(ep._id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-8 max-w-2xl w-full mx-4">
            <h3 className="text-xl font-bold text-white mb-4">Add Episode</h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-300 mb-2">Series</label>
                <select
                  value={formData.seriesId}
                  onChange={(e) => setFormData({...formData, seriesId: e.target.value})}
                  className="w-full px-4 py-2 rounded bg-gray-700 text-white"
                  required
                >
                  <option value="">Select Series</option>
                  {series.map(s => (
                    <option key={s._id} value={s._id}>{s.title}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-300 mb-2">Season</label>
                  <input
                    type="number"
                    value={formData.season}
                    onChange={(e) => setFormData({...formData, season: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 rounded bg-gray-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">Episode Number</label>
                  <input
                    type="number"
                    value={formData.episodeNumber}
                    onChange={(e) => setFormData({...formData, episodeNumber: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 rounded bg-gray-700 text-white"
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-gray-300 mb-2">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-2 rounded bg-gray-700 text-white"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-300 mb-2">Video URL (Bunny CDN)</label>
                <input
                  type="text"
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({...formData, videoUrl: e.target.value})}
                  className="w-full px-4 py-2 rounded bg-gray-700 text-white"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EpisodesManager;