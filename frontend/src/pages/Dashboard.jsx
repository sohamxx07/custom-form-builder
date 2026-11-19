import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const Dashboard = () => {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const fetchForms = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/forms');
      setForms(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch forms.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForms();
  }, []);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) {
      return;
    }

    setDeletingId(id);
    try {
      await api.delete(`/forms/${id}`);
      setForms((prev) => prev.filter((form) => form.id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete form.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Your Forms</h1>
          <p className="text-sm text-gray-500 mt-1">
            Create, manage and configure your custom forms
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            to="/forms/new"
            className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg shadow-sm text-sm transition"
          >
            <span className="mr-1.5 text-lg leading-none">+</span> Create New Form
          </Link>
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={fetchForms}
            className="text-red-700 font-semibold underline hover:text-red-800"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="flex justify-center items-center py-24">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : forms.length === 0 ? (
        /* Empty State */
        <div className="text-center py-16 px-4 bg-white rounded-xl border border-gray-200 shadow-sm max-w-xl mx-auto mt-6">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
            📝
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">No forms created yet</h3>
          <p className="text-sm text-gray-500 max-w-sm mx-auto mb-6">
            Get started by creating your very first custom form. Add fields, configure options, and prepare it for submissions.
          </p>
          <Link
            to="/forms/new"
            className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg shadow-sm text-sm transition"
          >
            + Create Your First Form
          </Link>
        </div>
      ) : (
        /* Forms Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {forms.map((form) => (
            <div
              key={form.id}
              className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition flex flex-col justify-between overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-gray-900 text-lg line-clamp-1">
                    {form.title}
                  </h3>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-mono">
                    ID: {form.id}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-2 line-clamp-2 min-h-[2.5rem]">
                  {form.description || 'No description provided.'}
                </p>
                <div className="text-xs text-gray-400 mt-4">
                  Created {new Date(form.createdAt).toLocaleDateString()}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 flex items-center justify-between text-sm">
                <Link
                  to={`/forms/${form.id}/builder`}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  ⚙️ Manage Fields
                </Link>
                <div className="flex items-center space-x-3">
                  <Link
                    to={`/forms/${form.id}/edit`}
                    className="text-gray-600 hover:text-gray-900 font-medium"
                  >
                    Edit Info
                  </Link>
                  <button
                    onClick={() => handleDelete(form.id, form.title)}
                    disabled={deletingId === form.id}
                    className="text-red-600 hover:text-red-700 font-medium disabled:opacity-50"
                  >
                    {deletingId === form.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
