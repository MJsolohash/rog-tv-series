import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const UsersManager = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data);
      setError('');
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId, username) => {
    if (window.confirm(`Are you sure you want to delete user "${username}"?`)) {
      try {
        const token = localStorage.getItem('token');
        await api.delete(`/admin/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccess(`User "${username}" deleted successfully`);
        fetchUsers();
        setTimeout(() => setSuccess(''), 3000);
      } catch (error) {
        console.error('Error deleting user:', error);
        setError('Failed to delete user');
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  const handleMakeAdmin = async (userId, username, currentStatus) => {
    if (window.confirm(`Make "${username}" ${currentStatus ? 'a regular user?' : 'an admin?'}`)) {
      try {
        const token = localStorage.getItem('token');
        await api.put(`/admin/users/${userId}/role`, 
          { isAdmin: !currentStatus },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSuccess(`User "${username}" updated successfully`);
        fetchUsers();
        setTimeout(() => setSuccess(''), 3000);
      } catch (error) {
        console.error('Error updating user role:', error);
        setError('Failed to update user role');
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="text-white text-center">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">👥 Users Management</h2>
        <div className="text-sm text-gray-400">Total: {users.length} users</div>
      </div>

      {success && (
        <div className="bg-green-600 text-white p-3 rounded mb-4">
          {success}
        </div>
      )}
      {error && (
        <div className="bg-red-600 text-white p-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-white">
          <thead className="bg-gray-700">
            <tr>
              <th className="p-3 text-left">Username</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Role</th>
              <th className="p-3 text-left">Joined Date</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user._id} className="border-b border-gray-700 hover:bg-gray-700 transition">
                <td className="p-3 font-medium">
                  {user.username}
                  {user._id === currentUser._id && (
                    <span className="ml-2 text-xs bg-blue-600 px-2 py-1 rounded">You</span>
                  )}
                </td>
                <td className="p-3">{user.email}</td>
                <td className="p-3">
                  {user.isAdmin ? (
                    <span className="bg-red-600 px-2 py-1 rounded text-xs font-semibold">Admin</span>
                  ) : (
                    <span className="bg-gray-600 px-2 py-1 rounded text-xs">User</span>
                  )}
                </td>
                <td className="p-3 text-gray-400">
                  {new Date(user.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </td>
                <td className="p-3">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleMakeAdmin(user._id, user.username, user.isAdmin)}
                      className={`px-3 py-1 rounded text-sm transition ${
                        user.isAdmin
                          ? 'bg-yellow-600 hover:bg-yellow-700'
                          : 'bg-green-600 hover:bg-green-700'
                      }`}
                      disabled={user._id === currentUser._id}
                      title={user.isAdmin ? 'Remove Admin' : 'Make Admin'}
                    >
                      {user.isAdmin ? '👑 Remove Admin' : '⬆️ Make Admin'}
                    </button>

                    <button
                      onClick={() => handleDeleteUser(user._id, user.username)}
                      className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm transition"
                      disabled={user._id === currentUser._id}
                      title={user._id === currentUser._id ? "Can't delete yourself" : "Delete User"}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {users.length === 0 && (
        <div className="text-center text-gray-400 py-8">
          No users found.
        </div>
      )}
    </div>
  );
};

export default UsersManager;