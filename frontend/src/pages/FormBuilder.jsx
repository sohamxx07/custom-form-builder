import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';

const SUPPORTED_FIELD_TYPES = [
  { value: 'text', label: 'Single-line Text' },
  { value: 'email', label: 'Email Address' },
  { value: 'number', label: 'Number' },
  { value: 'textarea', label: 'Multi-line Paragraph (Textarea)' },
  { value: 'select', label: 'Dropdown' },
  { value: 'radio', label: 'Multiple Choice (Radio)' },
  { value: 'checkbox', label: 'Checkboxes' },
  { value: 'file', label: 'File Upload' },
];

const CHOICE_TYPES = ['select', 'radio', 'checkbox'];

const AVAILABLE_EXTENSIONS = [
  'PDF',
  'JPG',
  'JPEG',
  'PNG',
  'DOC',
  'DOCX',
  'XLS',
  'XLSX',
];

const PRESET_FILE_SIZES = [2, 5, 10, 20];

const FormBuilder = () => {
  const { formId } = useParams();

  const [form, setForm] = useState(null);
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Field Editor State
  const [editingFieldId, setEditingFieldId] = useState(null);
  const [label, setLabel] = useState('');
  const [type, setType] = useState('text');
  const [placeholder, setPlaceholder] = useState('');
  const [required, setRequired] = useState(false);
  const [options, setOptions] = useState(['Option 1', 'Option 2']);
  const [sortOrder, setSortOrder] = useState(0);

  // File Upload Specific Configuration State
  const [allowedExtensions, setAllowedExtensions] = useState(['PDF', 'JPG', 'PNG']);
  const [maxFileSizeMB, setMaxFileSizeMB] = useState(5);

  const [submittingField, setSubmittingField] = useState(false);
  const [fieldError, setFieldError] = useState('');

  // Load Form and Fields
  const loadFormData = async () => {
    setLoading(true);
    setError('');
    try {
      const [formRes, fieldsRes] = await Promise.all([
        api.get(`/forms/${formId}`),
        api.get(`/forms/${formId}/fields`),
      ]);
      setForm(formRes.data.data);
      const fetchedFields = fieldsRes.data.data || [];
      setFields(fetchedFields);
      setSortOrder(fetchedFields.length);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load form details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFormData();
  }, [formId]);

  // Reset form builder editor fields
  const resetFieldEditor = () => {
    setEditingFieldId(null);
    setLabel('');
    setType('text');
    setPlaceholder('');
    setRequired(false);
    setOptions(['Option 1', 'Option 2']);
    setAllowedExtensions(['PDF', 'JPG', 'PNG']);
    setMaxFileSizeMB(5);
    setSortOrder(fields.length);
    setFieldError('');
  };

  // Populate editor with existing field for update
  const startEditingField = (field) => {
    setEditingFieldId(field.id);
    setLabel(field.label);
    setType(field.type);
    setPlaceholder(field.placeholder || '');
    setRequired(Boolean(field.required));
    setSortOrder(field.sortOrder ?? 0);
    setFieldError('');

    if (field.type === 'file' && field.options && typeof field.options === 'object') {
      const exts = Array.isArray(field.options.allowedExtensions)
        ? field.options.allowedExtensions.map((e) => String(e).toUpperCase())
        : ['PDF', 'JPG', 'PNG'];
      setAllowedExtensions(exts);
      setMaxFileSizeMB(field.options.maxFileSizeMB || 5);
    } else if (CHOICE_TYPES.includes(field.type)) {
      setOptions(Array.isArray(field.options) ? field.options : ['Option 1', 'Option 2']);
    } else {
      setOptions(['Option 1', 'Option 2']);
      setAllowedExtensions(['PDF', 'JPG', 'PNG']);
      setMaxFileSizeMB(5);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Toggle allowed extension selection
  const toggleExtension = (ext) => {
    if (allowedExtensions.includes(ext)) {
      if (allowedExtensions.length === 1) {
        setFieldError('At least one file extension must remain selected.');
        return;
      }
      setFieldError('');
      setAllowedExtensions(allowedExtensions.filter((e) => e !== ext));
    } else {
      setFieldError('');
      setAllowedExtensions([...allowedExtensions, ext]);
    }
  };

  // Select all or clear extensions
  const selectAllExtensions = () => {
    setAllowedExtensions([...AVAILABLE_EXTENSIONS]);
    setFieldError('');
  };

  // Handle Option Changes for Choice Fields
  const handleOptionChange = (index, value) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  };

  const addOption = () => {
    setOptions([...options, `Option ${options.length + 1}`]);
  };

  const removeOption = (index) => {
    if (options.length <= 1) return;
    setOptions(options.filter((_, i) => i !== index));
  };

  // Submit Add / Update Field
  const handleSaveField = async (e) => {
    e.preventDefault();
    setFieldError('');

    if (!label.trim()) {
      setFieldError('Field label is required.');
      return;
    }

    let fieldOptions = null;

    if (type === 'file') {
      if (!allowedExtensions || allowedExtensions.length === 0) {
        setFieldError('Please select at least one allowed file extension.');
        return;
      }
      const size = Number(maxFileSizeMB);
      if (isNaN(size) || size <= 0) {
        setFieldError('Maximum file size must be a positive number in MB.');
        return;
      }
      fieldOptions = {
        allowedExtensions: allowedExtensions.map((e) => e.toLowerCase()),
        maxFileSizeMB: size,
      };
    } else if (CHOICE_TYPES.includes(type)) {
      fieldOptions = options.map((opt) => opt.trim()).filter(Boolean);
    }

    const payload = {
      label: label.trim(),
      type,
      placeholder: placeholder.trim() || null,
      required,
      sortOrder: Number(sortOrder) || 0,
      options: fieldOptions,
    };

    setSubmittingField(true);
    try {
      if (editingFieldId) {
        const res = await api.put(`/forms/${formId}/fields/${editingFieldId}`, payload);
        setFields((prev) =>
          prev
            .map((f) => (f.id === editingFieldId ? res.data.data : f))
            .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
        );
      } else {
        const res = await api.post(`/forms/${formId}/fields`, payload);
        setFields((prev) =>
          [...prev, res.data.data].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
        );
      }
      resetFieldEditor();
    } catch (err) {
      setFieldError(err.response?.data?.message || 'Failed to save field.');
    } finally {
      setSubmittingField(false);
    }
  };

  // Delete Field
  const handleDeleteField = async (fieldId) => {
    if (!window.confirm('Delete this field from your form?')) return;

    try {
      await api.delete(`/forms/${formId}/fields/${fieldId}`);
      setFields((prev) => prev.filter((f) => f.id !== fieldId));
      if (editingFieldId === fieldId) {
        resetFieldEditor();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete field.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Navigation & Breadcrumbs */}
      <div className="flex items-center justify-between mb-6">
        <Link to="/dashboard" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
          &larr; Back to Dashboard
        </Link>
        <div className="flex items-center space-x-3">
          <Link
            to={`/forms/${formId}/preview`}
            className="inline-flex items-center bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-1.5 rounded-lg text-sm font-medium shadow-sm transition"
          >
            <span className="mr-1.5">👁️</span> Preview / Test Mode
          </Link>
          <Link
            to={`/forms/${formId}/edit`}
            className="text-sm text-gray-600 hover:text-gray-900 font-medium px-2 py-1"
          >
            Edit Form Info &rarr;
          </Link>
        </div>
      </div>

      {/* Form Details Banner */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{form?.title}</h1>
        {form?.description && (
          <p className="text-gray-600 text-sm mt-1.5">{form.description}</p>
        )}
        <div className="flex items-center space-x-3 mt-4 text-xs text-gray-400">
          <span>Form ID: {form?.id}</span>
          <span>•</span>
          <span>Total Fields: {fields.length}</span>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Grid: Left = Field Editor Form, Right = Form Preview / Fields List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Field Creator / Editor */}
        <div className="lg:col-span-5">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm sticky top-24">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">
                {editingFieldId ? 'Edit Field' : 'Add New Field'}
              </h2>
              {editingFieldId && (
                <button
                  type="button"
                  onClick={resetFieldEditor}
                  className="text-xs text-gray-500 hover:text-gray-700 underline"
                >
                  Cancel Edit
                </button>
              )}
            </div>

            {fieldError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
                {fieldError}
              </div>
            )}

            <form onSubmit={handleSaveField} className="space-y-4 text-sm">
              <div>
                <label className="block font-medium text-gray-700 mb-1">
                  Field Label <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="e.g. Upload your passport photo or resume"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">
                  Field Type
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  {SUPPORTED_FIELD_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Placeholder: for text, email, number, textarea */}
              {!CHOICE_TYPES.includes(type) && type !== 'file' && (
                <div>
                  <label className="block font-medium text-gray-700 mb-1">
                    Placeholder (Optional)
                  </label>
                  <input
                    type="text"
                    value={placeholder}
                    onChange={(e) => setPlaceholder(e.target.value)}
                    placeholder="e.g. Enter your response here"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              {/* File Upload Configuration Section */}
              {type === 'file' && (
                <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="block font-semibold text-gray-800">
                      Allowed File Extensions <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={selectAllExtensions}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Select All
                    </button>
                  </div>

                  {/* Extension Badges */}
                  <div className="grid grid-cols-4 gap-2">
                    {AVAILABLE_EXTENSIONS.map((ext) => {
                      const isSelected = allowedExtensions.includes(ext);
                      return (
                        <button
                          key={ext}
                          type="button"
                          onClick={() => toggleExtension(ext)}
                          className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition text-center ${
                            isSelected
                              ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                          }`}
                        >
                          {isSelected && '✓ '}
                          .{ext.toLowerCase()}
                        </button>
                      );
                    })}
                  </div>

                  {/* Maximum File Size */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block font-semibold text-gray-800">
                        Max File Size (in MB) <span className="text-red-500">*</span>
                      </label>
                      <span className="text-xs text-gray-500">
                        Current: <strong>{maxFileSizeMB} MB</strong>
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      {PRESET_FILE_SIZES.map((sz) => (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => setMaxFileSizeMB(sz)}
                          className={`px-2.5 py-1 text-xs rounded-md border font-medium transition ${
                            Number(maxFileSizeMB) === sz
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {sz} MB
                        </button>
                      ))}
                      <div className="flex-1 flex items-center space-x-1">
                        <input
                          type="number"
                          min="1"
                          max="100"
                          value={maxFileSizeMB}
                          onChange={(e) => setMaxFileSizeMB(e.target.value)}
                          placeholder="Custom"
                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-center"
                        />
                        <span className="text-xs text-gray-500 font-medium">MB</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Options Management for Choice Fields */}
              {CHOICE_TYPES.includes(type) && (
                <div className="bg-gray-50 p-3.5 rounded-lg border border-gray-200">
                  <label className="block font-medium text-gray-700 mb-2">
                    Choices / Options
                  </label>
                  <div className="space-y-2 mb-2">
                    {options.map((opt, idx) => (
                      <div key={idx} className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => handleOptionChange(idx, e.target.value)}
                          placeholder={`Option ${idx + 1}`}
                          className="flex-1 px-2.5 py-1.5 border border-gray-300 rounded text-sm bg-white"
                          required
                        />
                        {options.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeOption(idx)}
                            className="text-red-500 hover:text-red-700 text-xs px-1.5 py-1"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={addOption}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                  >
                    + Add Another Choice
                  </button>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="requiredToggle"
                    checked={required}
                    onChange={(e) => setRequired(e.target.checked)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="requiredToggle" className="text-gray-700 select-none">
                    Required field
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <label className="text-gray-600 text-xs font-medium">Sort Order:</label>
                  <input
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="w-16 px-2 py-1 border border-gray-300 rounded text-center text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submittingField}
                className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg shadow-sm transition disabled:opacity-50"
              >
                {submittingField
                  ? 'Saving Field...'
                  : editingFieldId
                  ? 'Update Field'
                  : '+ Add Field to Form'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Fields List / Live Previews */}
        <div className="lg:col-span-7">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">
              Configured Fields ({fields.length})
            </h2>
          </div>

          {fields.length === 0 ? (
            <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
              <div className="text-gray-400 text-3xl mb-2">📋</div>
              <h3 className="font-semibold text-gray-900 mb-1">No fields added yet</h3>
              <p className="text-sm text-gray-500 max-w-sm mx-auto">
                Use the editor on the left to add your first field to this form.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {fields.map((field, idx) => (
                <div
                  key={field.id}
                  className={`bg-white rounded-xl border p-5 shadow-sm transition ${
                    editingFieldId === field.id
                      ? 'border-blue-500 ring-2 ring-blue-100'
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between pb-3 border-b border-gray-100 mb-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs bg-gray-100 text-gray-700 font-mono px-2 py-0.5 rounded">
                        #{field.sortOrder ?? idx}
                      </span>
                      <span className="text-xs bg-blue-50 text-blue-700 font-medium px-2 py-0.5 rounded capitalize">
                        {field.type === 'file' ? '📁 File Upload' : field.type}
                      </span>
                      {field.required && (
                        <span className="text-xs bg-red-50 text-red-600 font-medium px-2 py-0.5 rounded">
                          Required
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-3 text-xs">
                      <button
                        onClick={() => startEditingField(field)}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteField(field.id)}
                        className="text-red-600 hover:text-red-700 font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* Render Visual Preview of Field */}
                  <div>
                    <label className="block font-semibold text-gray-900 mb-2 text-sm">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </label>

                    {field.type === 'text' && (
                      <input
                        type="text"
                        disabled
                        placeholder={field.placeholder || 'Text input'}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-sm cursor-not-allowed text-gray-500"
                      />
                    )}

                    {field.type === 'email' && (
                      <input
                        type="email"
                        disabled
                        placeholder={field.placeholder || 'name@example.com'}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-sm cursor-not-allowed text-gray-500"
                      />
                    )}

                    {field.type === 'number' && (
                      <input
                        type="number"
                        disabled
                        placeholder={field.placeholder || '0'}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-sm cursor-not-allowed text-gray-500"
                      />
                    )}

                    {field.type === 'textarea' && (
                      <textarea
                        disabled
                        rows={2}
                        placeholder={field.placeholder || 'Write your paragraph answer...'}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-sm cursor-not-allowed text-gray-500"
                      />
                    )}

                    {field.type === 'select' && (
                      <select
                        disabled
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-sm cursor-not-allowed text-gray-500"
                      >
                        <option>{field.placeholder || 'Select an option'}</option>
                        {Array.isArray(field.options) &&
                          field.options.map((opt, i) => <option key={i}>{opt}</option>)}
                      </select>
                    )}

                    {field.type === 'radio' && (
                      <div className="space-y-1.5 mt-1">
                        {Array.isArray(field.options) && field.options.length > 0 ? (
                          field.options.map((opt, i) => (
                            <label key={i} className="flex items-center space-x-2 text-sm text-gray-600">
                              <input type="radio" disabled className="text-blue-600" />
                              <span>{opt}</span>
                            </label>
                          ))
                        ) : (
                          <span className="text-xs text-gray-400">No options defined</span>
                        )}
                      </div>
                    )}

                    {field.type === 'checkbox' && (
                      <div className="space-y-1.5 mt-1">
                        {Array.isArray(field.options) && field.options.length > 0 ? (
                          field.options.map((opt, i) => (
                            <label key={i} className="flex items-center space-x-2 text-sm text-gray-600">
                              <input type="checkbox" disabled className="rounded text-blue-600" />
                              <span>{opt}</span>
                            </label>
                          ))
                        ) : (
                          <span className="text-xs text-gray-400">No options defined</span>
                        )}
                      </div>
                    )}

                    {/* File Upload Preview */}
                    {field.type === 'file' && (
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-5 bg-gray-50/70 text-center">
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-lg">
                            📁
                          </div>
                          <div>
                            <span className="text-sm font-semibold text-blue-600 hover:underline cursor-not-allowed">
                              Choose a file
                            </span>
                            <span className="text-xs text-gray-500"> or drag and drop</span>
                          </div>

                          {/* Upload Restrictions & Security Rules */}
                          <div className="pt-2 border-t border-gray-200 w-full max-w-sm space-y-1 text-xs text-gray-500">
                            <div className="flex items-center justify-center space-x-1.5">
                              <span className="font-medium text-gray-700">Accepted Formats:</span>
                              <span className="uppercase text-blue-700 font-mono font-medium">
                                {field.options?.allowedExtensions && Array.isArray(field.options.allowedExtensions)
                                  ? field.options.allowedExtensions.join(', ')
                                  : 'Any'}
                              </span>
                            </div>
                            <div className="flex items-center justify-center space-x-1.5">
                              <span className="font-medium text-gray-700">Maximum File Size:</span>
                              <span className="font-semibold text-gray-800">
                                {field.options?.maxFileSizeMB || 5} MB
                              </span>
                            </div>
                            <div className="text-[11px] text-gray-400 italic">
                              🔒 Strict server-side extension & MIME type validation enabled
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FormBuilder;
