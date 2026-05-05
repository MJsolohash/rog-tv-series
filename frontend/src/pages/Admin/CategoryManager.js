import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const CategoryManager = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    isActive: true
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/admin/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Image upload to Bunny CDN
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);
    formData.append('folder', 'categories');

    setUploading(true);
    try {
      const response = await api.post('/admin/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFormData({ ...formData, image: response.data.imageUrl });
    } catch (error) {
      console.error('Upload error:', error);
      alert('Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await api.put(`/admin/categories/${editingCategory._id}`, formData);
      } else {
        await api.post('/admin/categories', formData);
      }
      fetchCategories();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error:', error);
      alert(error.response?.data?.message || 'Error saving category');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      await api.delete(`/admin/categories/${id}`);
      fetchCategories();
    }
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', image: '', isActive: true });
    setEditingCategory(null);
  };

  if (loading) return <div className="text-white text-center py-8">Loading categories...</div>;

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">🏷️ Categories Management</h2>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          + Add Category
        </button>
      </div>

      {categories.length === 0 && (
        <div className="text-center text-gray-400 py-8">No categories yet. Click "Add Category" to create one.</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map(cat => (
          <div key={cat._id} className="bg-gray-700 rounded-lg p-4 hover:bg-gray-650 transition">
            {cat.image && <img src={cat.image} alt={cat.name} className="w-full h-40 object-cover rounded mb-3" />}
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-white">{cat.name}</h3>
                <p className="text-gray-400 text-sm">{cat.description || 'No description'}</p>
                <span className={`text-xs px-2 py-1 rounded mt-2 inline-block ${cat.isActive ? 'bg-green-600' : 'bg-gray-600'}`}>
                  {cat.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="flex space-x-2">
                <button onClick={() => { setEditingCategory(cat); setFormData(cat); setShowModal(true); }} className="text-yellow-400 hover:text-yellow-300">Edit</button>
                <button onClick={() => handleDelete(cat._id)} className="text-red-400 hover:text-red-300">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-white mb-4">{editingCategory ? 'Edit Category' : 'Add Category'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Description</label>
                <textarea
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              
              {/* Category Image - with Upload Option */}
              <div>
                <label className="block text-gray-300 mb-2">Category Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="w-full px-3 py-2 rounded bg-gray-700 text-white"
                />
                {uploading && <p className="text-gray-400 text-sm mt-1">Uploading to Bunny CDN...</p>}
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData({...formData, image: e.target.value})}
                  placeholder="Or enter image URL"
                  className="w-full mt-2 px-3 py-2 rounded bg-gray-700 text-white"
                />
                {formData.image && (
                  <img src={formData.image} alt="Category preview" className="mt-2 w-32 h-32 object-cover rounded" />
                )}
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                  className="mr-2 w-4 h-4"
                />
                <label className="text-gray-300">Active (show on website)</label>
              </div>
              <div className="flex justify-end space-x-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-700">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-red-600 rounded hover:bg-red-700">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryManager;