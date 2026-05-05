import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import SeriesManager from './SeriesManager';
import CategoryManager from './CategoryManager';
import UsersManager from './UsersManager';
import BackgroundPlaylistManager from './BackgroundPlaylistManager';

const Dashboard = () => {
  const [stats, setStats] = useState({ totalSeries: 0, totalEpisodes: 0, totalUsers: 0 });
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/admin/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: '📊' },
    { id: 'background', name: '🎬 Background Playlist', icon: '🎬' },
    { id: 'categories', name: 'Categories', icon: '🏷️' },
    { id: 'series', name: 'Series', icon: '🎬' },
    { id: 'users', name: 'Users', icon: '👥' },
  ];

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">Admin Dashboard</h1>
        
        <div className="flex flex-wrap space-x-2 mb-8 border-b border-gray-700">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-t-lg transition ${
                activeTab === tab.id
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </div>

        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="text-4xl mb-2">🎬</div>
              <div className="text-3xl font-bold text-white">{stats.totalSeries}</div>
              <div className="text-gray-400">Total Series</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="text-4xl mb-2">📺</div>
              <div className="text-3xl font-bold text-white">{stats.totalEpisodes}</div>
              <div className="text-gray-400">Total Episodes</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="text-4xl mb-2">👥</div>
              <div className="text-3xl font-bold text-white">{stats.totalUsers}</div>
              <div className="text-gray-400">Total Users</div>
            </div>
          </div>
        )}

        {activeTab === 'background' && <BackgroundPlaylistManager />}
        {activeTab === 'categories' && <CategoryManager />}
        {activeTab === 'series' && <SeriesManager />}
        {activeTab === 'users' && <UsersManager />}
      </div>
    </div>
  );
};

export default Dashboard;