import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Edit,
  Eye,
  Rocket,
  BarChart3,
  Copy,
  Check,
  ExternalLink,
  Layers,
  FileUp,
  Type,
  Mail,
  Hash,
  AlignLeft,
  ListFilter,
  CheckSquare,
  Radio,
  Calendar,
} from 'lucide-react';

const SUPPORTED_FIELD_TYPES = [
  { value: 'text', label: 'Single-line Text', icon: Type, desc: 'Short text' },
  { value: 'email', label: 'Email Address', icon: Mail, desc: 'name@mail.com' },
  { value: 'number', label: 'Number', icon: Hash, desc: 'Numeric values' },
  { value: 'date', label: 'Date', icon: Calendar, desc: 'Date picker' },
  { value: 'textarea', label: 'Paragraph (Textarea)', icon: AlignLeft, desc: 'Long answers' },
  { value: 'select', label: 'Dropdown Select', icon: ListFilter, desc: 'Single select' },
  { value: 'radio', label: 'Multiple Choice (Radio)', icon: Radio, desc: 'One choice' },
  { value: 'checkbox', label: 'Checkboxes (Multi-select)', icon: CheckSquare, desc: 'Multi-select' },
  { value: 'file', label: 'File / Image Upload', icon: FileUp, desc: 'Docs & images' },
];

const CHOICE_TYPES = ['select', 'radio', 'checkbox'];

const AVAILABLE_EXTENSIONS = [
  'PDF',
  'JPG',
  'JPEG',
  'PNG',
  'WEBP',
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

  // Publishing State
  const [publishing, setPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState('');
  const [publishError, setPublishError] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  // Delete Field Modal
  const [fieldToDelete, setFieldToDelete] = useState(null);

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

  // Handle Form Publishing
  const handlePublishForm = async () => {
    if (fields.length === 0) {
      setPublishError('Cannot publish an empty form. Please add at least one field first.');
      return;
    }

    setPublishing(true);
    setPublishError('');
    setPublishSuccess('');

    try {
      const response = await api.post(`/forms/${formId}/publish`);
      setForm(response.data.data);
      setPublishSuccess(response.data.message || 'Form published successfully!');
    } catch (err) {
      setPublishError(err.response?.data?.message || 'Failed to publish form. Please try again.');
    } finally {
      setPublishing(false);
    }
  };

  // Copy public link
  const copyPublicLink = () => {
    if (!form?.slug) return;
    const publicUrl = `${window.location.origin}/public/forms/${form.slug}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(publicUrl).then(() => {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2500);
      });
    }
  };

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

    window.scrollTo({ top: 120, behavior: 'smooth' });
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

  const selectAllExtensions = () => {
    setAllowedExtensions([...AVAILABLE_EXTENSIONS]);
    setFieldError('');
  };

  const selectImagesOnly = () => {
    setAllowedExtensions(['JPG', 'JPEG', 'PNG', 'WEBP']);
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
      if (fieldOptions.length === 0) {
        setFieldError('Please provide at least one valid option.');
        return;
      }
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
  const confirmDeleteField = async () => {
    if (!fieldToDelete) return;

    try {
      await api.delete(`/forms/${formId}/fields/${fieldToDelete.id}`);
      setFields((prev) => prev.filter((f) => f.id !== fieldToDelete.id));
      if (editingFieldId === fieldToDelete.id) {
        resetFieldEditor();
      }
      setFieldToDelete(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete field.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col justify-center items-center px-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-3" />
        <p className="text-gray-500 text-sm font-medium">Loading form studio...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EEF2FF]/40 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/dashboard"
            className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back to Dashboard
          </Link>
          <div className="flex items-center space-x-2.5">
            <Link to={`/forms/${formId}/responses`}>
              <Button variant="outline" size="sm" className="font-medium bg-white">
                <BarChart3 className="h-4 w-4 mr-1.5 text-indigo-600" />
                Responses
              </Button>
            </Link>
            <Link to={`/forms/${formId}/preview`}>
              <Button variant="outline" size="sm" className="font-medium bg-white">
                <Eye className="h-4 w-4 mr-1.5 text-blue-600" />
                Test Preview
              </Button>
            </Link>
            <Button
              size="sm"
              onClick={handlePublishForm}
              disabled={publishing || fields.length === 0}
              className={`font-semibold shadow-sm ${
                form?.status === 'published'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {publishing ? (
                <>
                  <span className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white mr-1.5" />
                  Publishing...
                </>
              ) : form?.status === 'published' ? (
                <>
                  <Rocket className="h-4 w-4 mr-1.5" />
                  Republish
                </>
              ) : (
                <>
                  <Rocket className="h-4 w-4 mr-1.5" />
                  Publish Form
                </>
              )}
            </Button>
            <Link to={`/forms/${formId}/edit`}>
              <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-900">
                Edit Info &rarr;
              </Button>
            </Link>
          </div>
        </div>

        {/* Publish Alerts */}
        {publishSuccess && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-sm flex items-center justify-between shadow-sm">
            <div className="flex items-center space-x-2">
              <Check className="h-5 w-5 text-emerald-600" />
              <span className="font-medium">{publishSuccess}</span>
            </div>
            <button
              onClick={() => setPublishSuccess('')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 ml-4"
            >
              Dismiss
            </button>
          </div>
        )}

        {publishError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-sm flex items-center justify-between shadow-sm">
            <span>⚠️ {publishError}</span>
            <button
              onClick={() => setPublishError('')}
              className="text-xs font-semibold text-red-600 hover:text-red-800 ml-4"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Form Details Banner Card */}
        <Card className="border-border/80 shadow-sm mb-8 overflow-hidden bg-white">
          <CardHeader className="p-6 sm:p-8 pb-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <CardTitle className="text-2xl font-extrabold text-gray-900">
                  {form?.title}
                </CardTitle>
                {form?.status === 'published' ? (
                  <Badge variant="success">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
                    Published
                  </Badge>
                ) : (
                  <Badge variant="warning">Draft</Badge>
                )}
              </div>
            </div>

            {form?.description && (
              <CardDescription className="text-sm text-gray-600 mt-2 whitespace-pre-line">
                {form.description}
              </CardDescription>
            )}

            <div className="flex items-center space-x-4 mt-4 text-xs text-gray-400">
              <span>Form ID: {form?.id}</span>
              <span>•</span>
              <span>Total Fields: {fields.length}</span>
              {form?.publishedAt && (
                <>
                  <span>•</span>
                  <span>Published {new Date(form.publishedAt).toLocaleString()}</span>
                </>
              )}
            </div>
          </CardHeader>

          {/* Public Sharing Bar */}
          {form?.status === 'published' && form?.slug && (
            <div className="border-t border-emerald-100 bg-emerald-50/50 px-6 sm:px-8 py-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 block mb-1">
                    Public Share Link
                  </span>
                  <div className="bg-white border border-emerald-200 rounded-lg px-3 py-1.5 text-xs font-mono text-gray-700 truncate select-all">
                    {`${window.location.origin}/public/forms/${form.slug}`}
                  </div>
                </div>
                <div className="flex items-center space-x-2 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyPublicLink}
                    className="bg-white text-emerald-700 border-emerald-300 hover:bg-emerald-50 text-xs h-8"
                  >
                    {copiedLink ? (
                      <>
                        <Check className="h-3.5 w-3.5 mr-1 text-emerald-600" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5 mr-1" />
                        Copy Link
                      </>
                    )}
                  </Button>
                  <a
                    href={`/public/forms/${form.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 text-xs h-8 shadow-xs"
                    >
                      <ExternalLink className="h-3.5 w-3.5 mr-1" />
                      View Live ↗
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* 2-Column Studio Grid: Left = Field Editor, Right = Fields List / Live Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Field Editor */}
          <div className="lg:col-span-5">
            <Card className="border-border/80 shadow-md sticky top-24">
              <CardHeader className="p-6 pb-4 border-b border-gray-100 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold text-gray-900">
                    {editingFieldId ? 'Edit Field' : 'Add New Field'}
                  </CardTitle>
                  <CardDescription className="text-xs text-gray-500 mt-0.5">
                    Configure question label, input type and options
                  </CardDescription>
                </div>
                {editingFieldId && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetFieldEditor}
                    className="text-xs text-gray-500 hover:text-gray-900 h-7"
                  >
                    Cancel Edit
                  </Button>
                )}
              </CardHeader>

              <CardContent className="p-6 pt-5">
                {fieldError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start space-x-2">
                    <span>⚠️</span>
                    <span>{fieldError}</span>
                  </div>
                )}

                <form onSubmit={handleSaveField} className="space-y-4">
                  {/* Field Label */}
                  <div className="space-y-1.5">
                    <Label htmlFor="field-label" className="text-xs font-semibold text-gray-800">
                      Field Label <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="field-label"
                      type="text"
                      value={label}
                      onChange={(e) => setLabel(e.target.value)}
                      placeholder="e.g. Full Legal Name or Upload Resume"
                      required
                      className="h-9 rounded-xl text-sm"
                    />
                  </div>

                  {/* Field Type Select - Visual Interactive Grid */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="field-type" className="text-xs font-semibold text-slate-800">
                        Field Input Type
                      </Label>
                      <span className="text-[11px] text-[#4F46E5] font-semibold">
                        {SUPPORTED_FIELD_TYPES.find((t) => t.value === type)?.label}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5 pt-0.5">
                      {SUPPORTED_FIELD_TYPES.map((t) => {
                        const Icon = t.icon;
                        const isSelected = type === t.value;
                        return (
                          <button
                            key={t.value}
                            type="button"
                            onClick={() => setType(t.value)}
                            className={`p-2 rounded-xl border text-left transition-all duration-150 flex flex-col justify-between ${
                              isSelected
                                ? 'border-[#4F46E5] bg-[#EEF2FF] text-[#3730A3] shadow-xs ring-1 ring-[#4F46E5]'
                                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-center justify-between w-full mb-1">
                              <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-[#4F46E5]' : 'text-slate-400'}`} />
                              {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-[#4F46E5]" />}
                            </div>
                            <span className="text-[11px] font-bold leading-tight block truncate">
                              {t.label}
                            </span>
                            <span className="text-[9px] text-slate-400 leading-none mt-0.5 block truncate">
                              {t.desc}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Placeholder for non-choice & non-file fields */}
                  {!CHOICE_TYPES.includes(type) && type !== 'file' && (
                    <div className="space-y-1.5">
                      <Label htmlFor="field-placeholder" className="text-xs font-semibold text-gray-800">
                        {type === 'date' ? 'Help Text / Description (Optional)' : 'Placeholder (Optional)'}
                      </Label>
                      <Input
                        id="field-placeholder"
                        type="text"
                        value={placeholder}
                        onChange={(e) => setPlaceholder(e.target.value)}
                        placeholder={type === 'date' ? 'e.g. Choose your date of birth' : 'e.g. Enter your response...'}
                        className="h-9 rounded-xl text-sm"
                      />
                    </div>
                  )}

                  {/* Choice Options Configuration */}
                  {CHOICE_TYPES.includes(type) && (
                    <div className="space-y-2 bg-slate-50/80 p-3.5 rounded-xl border border-gray-200">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-semibold text-gray-800">
                          Options List <span className="text-red-500">*</span>
                        </Label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={addOption}
                          className="h-7 text-xs text-blue-600 hover:text-blue-800 px-2 font-semibold"
                        >
                          <Plus className="h-3 w-3 mr-1" /> Add Option
                        </Button>
                      </div>

                      <div className="space-y-2">
                        {options.map((opt, optIdx) => (
                          <div key={optIdx} className="flex items-center space-x-2">
                            <span className="text-xs font-mono text-gray-400 w-4">
                              {optIdx + 1}.
                            </span>
                            <Input
                              type="text"
                              value={opt}
                              onChange={(e) => handleOptionChange(optIdx, e.target.value)}
                              placeholder={`Option ${optIdx + 1}`}
                              className="h-8 rounded-lg text-xs"
                            />
                            {options.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeOption(optIdx)}
                                className="text-gray-400 hover:text-red-500 p-1 transition"
                                title="Remove Option"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* File Upload Configuration */}
                  {type === 'file' && (
                    <div className="space-y-3 bg-[#EEF2FF]/60 p-4 rounded-xl border border-indigo-200">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-semibold text-slate-900">
                          Allowed File Extensions <span className="text-red-500">*</span>
                        </Label>
                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={selectImagesOnly}
                            className="text-[11px] font-semibold text-[#4F46E5] hover:text-[#3730A3] underline"
                          >
                            Images Only
                          </button>
                          <span className="text-slate-300">•</span>
                          <button
                            type="button"
                            onClick={selectAllExtensions}
                            className="text-[11px] font-semibold text-slate-600 hover:text-slate-800 underline"
                          >
                            Select All
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                        {AVAILABLE_EXTENSIONS.map((ext) => {
                          const isSelected = allowedExtensions.includes(ext);
                          return (
                            <button
                              key={ext}
                              type="button"
                              onClick={() => toggleExtension(ext)}
                              className={`py-1 px-1.5 rounded-lg text-xs font-bold border transition text-center ${
                                isSelected
                                  ? 'bg-[#4F46E5] text-white border-[#4F46E5] shadow-xs'
                                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                              }`}
                            >
                              {isSelected ? '✓ ' : ''}.{ext.toLowerCase()}
                            </button>
                          );
                        })}
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <Label className="text-xs font-semibold text-blue-900">
                            Max File Size (in MB)
                          </Label>
                          <span className="text-xs font-bold text-blue-700">
                            {maxFileSizeMB} MB
                          </span>
                        </div>
                        <div className="flex items-center space-x-1.5">
                          {PRESET_FILE_SIZES.map((sz) => (
                            <button
                              key={sz}
                              type="button"
                              onClick={() => setMaxFileSizeMB(sz)}
                              className={`flex-1 py-1 text-xs rounded-lg border font-semibold transition ${
                                Number(maxFileSizeMB) === sz
                                  ? 'bg-blue-600 text-white border-blue-600'
                                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                              }`}
                            >
                              {sz} MB
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Required Field Checkbox */}
                  <div className="flex items-center space-x-2 pt-2">
                    <Checkbox
                      id="required-toggle"
                      checked={required}
                      onChange={(e) => setRequired(e.target.checked)}
                    />
                    <Label
                      htmlFor="required-toggle"
                      className="text-xs font-medium text-gray-700 cursor-pointer"
                    >
                      Mandatory / Required field
                    </Label>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={submittingField}
                    className="w-full h-10 rounded-xl font-semibold shadow-sm mt-3"
                  >
                    {submittingField ? (
                      'Saving Field...'
                    ) : editingFieldId ? (
                      <>
                        <Check className="h-4 w-4 mr-1.5" />
                        Update Field
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-1.5" />
                        Add Field to Form
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Configured Fields List / Studio Preview */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between pb-1">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Configured Fields ({fields.length})
                </h2>
                <p className="text-xs text-gray-500">
                  Review, edit, and inspect inputs configured for respondents
                </p>
              </div>
            </div>

            {fields.length === 0 ? (
              <Card className="border-dashed border-2 border-border/80 bg-white/60 p-12 text-center">
                <div className="w-14 h-14 bg-gray-100 text-gray-400 rounded-2xl flex items-center justify-center mx-auto mb-3 text-2xl">
                  <Layers className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-gray-900 text-base mb-1">
                  No Fields Added Yet
                </h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  Use the field editor on the left to add your first question or input field.
                </p>
              </Card>
            ) : (
              <div className="space-y-4">
                {fields.map((field, idx) => {
                  const isCurrentEditing = editingFieldId === field.id;

                  return (
                    <Card
                      key={field.id}
                      className={`border transition-all bg-white ${
                        isCurrentEditing
                          ? 'border-blue-500 ring-2 ring-blue-100 shadow-md'
                          : 'border-border/80 hover:shadow-sm'
                      }`}
                    >
                      <CardHeader className="p-4 sm:p-5 pb-3 border-b border-gray-100 flex flex-row items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-mono font-bold bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md">
                            #{idx + 1}
                          </span>
                          <Badge variant="secondary" className="capitalize text-[11px] font-semibold">
                            {field.type}
                          </Badge>
                          {field.required && (
                            <Badge variant="destructive" className="text-[10px] py-0 px-2 font-medium">
                              Required
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => startEditingField(field)}
                            className="h-8 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2.5 font-medium"
                          >
                            <Edit className="h-3.5 w-3.5 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setFieldToDelete(field)}
                            className="h-8 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 px-2.5 font-medium"
                          >
                            <Trash2 className="h-3.5 w-3.5 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </CardHeader>

                      <CardContent className="p-4 sm:p-5 pt-3">
                        <p className="text-sm font-bold text-gray-900 mb-2">
                          {field.label}
                          {field.required && <span className="text-red-500 ml-1">*</span>}
                        </p>

                        {/* Visual field preview */}
                        <div className="bg-slate-50/80 p-3.5 rounded-xl border border-gray-200/80">
                          {field.type === 'text' && (
                            <Input
                              disabled
                              placeholder={field.placeholder || 'Text input'}
                              className="h-8 text-xs bg-white text-gray-400 cursor-not-allowed"
                            />
                          )}

                          {field.type === 'email' && (
                            <Input
                              disabled
                              placeholder={field.placeholder || 'name@example.com'}
                              className="h-8 text-xs bg-white text-gray-400 cursor-not-allowed"
                            />
                          )}

                          {field.type === 'number' && (
                            <Input
                              disabled
                              placeholder={field.placeholder || '0'}
                              className="h-8 text-xs bg-white text-gray-400 cursor-not-allowed"
                            />
                          )}

                          {field.type === 'date' && (
                            <div className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-400 cursor-not-allowed">
                              <Calendar className="w-3.5 h-3.5 text-[#4F46E5]" />
                              <span>{field.placeholder || 'YYYY-MM-DD (Date Input)'}</span>
                            </div>
                          )}

                          {field.type === 'textarea' && (
                            <Textarea
                              disabled
                              rows={2}
                              placeholder={field.placeholder || 'Multi-line answer...'}
                              className="text-xs bg-white text-gray-400 cursor-not-allowed"
                            />
                          )}

                          {field.type === 'select' && (
                            <Select disabled className="h-8 text-xs bg-white text-gray-400 cursor-not-allowed">
                              <option>-- Select an option --</option>
                              {Array.isArray(field.options) &&
                                field.options.map((opt, i) => (
                                  <option key={i}>{opt}</option>
                                ))}
                            </Select>
                          )}

                          {field.type === 'radio' && (
                            <div className="space-y-1.5">
                              {Array.isArray(field.options) &&
                                field.options.map((opt, i) => (
                                  <div key={i} className="flex items-center space-x-2 text-xs text-gray-500">
                                    <div className="h-3.5 w-3.5 rounded-full border border-gray-300" />
                                    <span>{opt}</span>
                                  </div>
                                ))}
                            </div>
                          )}

                          {field.type === 'checkbox' && (
                            <div className="space-y-1.5">
                              {Array.isArray(field.options) &&
                                field.options.map((opt, i) => (
                                  <div key={i} className="flex items-center space-x-2 text-xs text-gray-500">
                                    <div className="h-3.5 w-3.5 rounded border border-gray-300" />
                                    <span>{opt}</span>
                                  </div>
                                ))}
                            </div>
                          )}

                          {field.type === 'file' && (
                            <div className="border border-dashed border-gray-300 rounded-lg p-3 text-center bg-white">
                              <FileUp className="h-5 w-5 text-gray-400 mx-auto mb-1" />
                              <p className="text-[11px] text-gray-500 font-medium">
                                Allowed: {field.options?.allowedExtensions?.join(', ') || 'All'} • Max:{' '}
                                {field.options?.maxFileSizeMB || 5} MB
                              </p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Delete Field Confirmation Dialog */}
        <Dialog open={Boolean(fieldToDelete)} onOpenChange={(open) => !open && setFieldToDelete(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-red-600 flex items-center">
                <Trash2 className="h-5 w-5 mr-2" />
                Delete Field
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to remove{' '}
                <strong className="text-gray-900 font-semibold">
                  "{fieldToDelete?.label}"
                </strong>{' '}
                from this form?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFieldToDelete(null)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={confirmDeleteField}
              >
                Delete Field
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default FormBuilder;
