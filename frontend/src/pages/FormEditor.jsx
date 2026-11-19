import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../api/axios';

const FormEditor = () => {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditing);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditing) {
      const fetchForm = async () => {
        try {
          const response = await api.get(`/forms/${id}`);
          const form = response.data.data;
          setTitle(form.title || '');
          setDescription(form.description || '');
        } catch (err) {
          setError(err.response?.data?.message || 'Failed to load form details.');
        } finally {
          setFetching(false);
        }
      };
      fetchForm();
    }
  }, [id, isEditing]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Form title is required.');
      return;
    }

    setLoading(true);
    try {
      if (isEditing) {
        await api.put(`/forms/${id}`, { title, description });
        navigate('/dashboard');
      } else {
        const response = await api.post('/forms', { title, description });
        const createdForm = response.data.data;
        // Promptly redirect directly into the field builder for smooth UX
        navigate(`/forms/${createdForm.id}/builder`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save form.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-6">
        <Link to="/dashboard" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
          &larr; Back to Dashboard
        </Link>
      </div>

      <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Edit Form Information' : 'Create New Form'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {isEditing
              ? 'Update the title and general description of your form.'
              : 'Provide basic details to start building your custom form.'}
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Form Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Customer Satisfaction Survey"
              required
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (Optional)
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell respondents the purpose of this form..."
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-100">
            <Link
              to="/dashboard"
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded-lg shadow-sm text-sm transition disabled:opacity-50"
            >
              {loading ? 'Saving...' : isEditing ? 'Save Changes' : 'Create & Add Fields'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormEditor;
