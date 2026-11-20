import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  CheckCircle2,
  AlertCircle,
  FileUp,
  X,
  FileText,
  Loader2,
  Send,
  HelpCircle,
  ShieldCheck,
  RotateCcw,
  Image as ImageIcon,
  Check,
  Sparkles,
} from 'lucide-react';
import { DEFAULT_THEME, sanitizeTheme } from '../lib/themePresets';
import { getFieldIconComponent } from '../lib/fieldIcons';

const PublicForm = () => {
  const { slug } = useParams();

  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notFound, setNotFound] = useState(false);

  // Field values in state so respondents can interact with inputs
  const [answers, setAnswers] = useState({});
  const [uploadingFields, setUploadingFields] = useState({});

  // Theme configuration state loaded from published form
  const [theme, setTheme] = useState(DEFAULT_THEME);

  // Submission State
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submissionMessage, setSubmissionMessage] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [submitError, setSubmitError] = useState('');

  const initializeAnswers = (formData) => {
    const initialAnswers = {};
    if (formData?.fields) {
      formData.fields.forEach((field) => {
        if (field.type === 'checkbox') {
          initialAnswers[field.id] = [];
        } else {
          initialAnswers[field.id] = '';
        }
      });
    }
    setAnswers(initialAnswers);
  };

  useEffect(() => {
    const fetchPublicForm = async () => {
      setLoading(true);
      setError('');
      setNotFound(false);

      try {
        const response = await api.get(`/public/forms/${slug}`);
        const formData = response.data.data;
        setForm(formData);

        // Apply saved theme configuration if published, otherwise use DEFAULT_THEME
        if (formData?.theme) {
          setTheme(sanitizeTheme(formData.theme));
        } else {
          setTheme(DEFAULT_THEME);
        }

        initializeAnswers(formData);
      } catch (err) {
        if (err.response?.status === 404) {
          setNotFound(true);
        } else {
          setError(
            err.response?.data?.message || 'Unable to load this form. Please check the URL and try again.'
          );
        }
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchPublicForm();
    }
  }, [slug]);

  const clearFieldError = (fieldId) => {
    if (validationErrors[fieldId]) {
      setValidationErrors((prev) => {
        const updated = { ...prev };
        delete updated[fieldId];
        return updated;
      });
    }
  };

  const handleInputChange = (fieldId, value) => {
    setAnswers((prev) => ({
      ...prev,
      [fieldId]: value,
    }));
    clearFieldError(fieldId);
  };

  const handleCheckboxToggle = (fieldId, optionValue) => {
    setAnswers((prev) => {
      const current = Array.isArray(prev[fieldId]) ? prev[fieldId] : [];
      const updated = current.includes(optionValue)
        ? current.filter((v) => v !== optionValue)
        : [...current, optionValue];

      return {
        ...prev,
        [fieldId]: updated,
      };
    });
    clearFieldError(fieldId);
  };

  // Upload an actual file/image to the backend Multer endpoint
  const handleFileSelect = async (fieldId, file, maxMB, allowedExts) => {
    if (!file) return;

    if (maxMB && file.size > maxMB * 1024 * 1024) {
      alert(`File size exceeds the limit of ${maxMB} MB.`);
      return;
    }

    const ext = file.name.split('.').pop()?.toLowerCase();
    if (Array.isArray(allowedExts) && allowedExts.length > 0) {
      const lowerExts = allowedExts.map((e) => String(e).toLowerCase().replace(/^\./, ''));
      if (!lowerExts.includes(ext)) {
        alert(`Invalid file extension (.${ext}). Allowed: ${allowedExts.join(', ')}`);
        return;
      }
    }

    setUploadingFields((prev) => ({ ...prev, [fieldId]: true }));
    clearFieldError(fieldId);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fieldId', fieldId);

      const res = await api.post(`/public/forms/${slug}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const fileData = res.data.data;
      setAnswers((prev) => ({
        ...prev,
        [fieldId]: fileData,
      }));
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to upload file. Please try again.';
      alert(msg);
    } finally {
      setUploadingFields((prev) => ({ ...prev, [fieldId]: false }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setSubmitError('');
    setValidationErrors({});

    try {
      const response = await api.post(`/public/forms/${slug}/submit`, {
        answers,
      });

      setSubmitted(true);
      setSubmissionMessage(
        response.data?.message || 'Response submitted successfully! Thank you for your feedback.'
      );
    } catch (err) {
      const respData = err.response?.data;
      if (respData?.data?.errors) {
        setValidationErrors(respData.data.errors);
      }
      setSubmitError(
        respData?.message || 'Failed to submit response. Please verify the highlighted fields.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetForm = () => {
    initializeAnswers(form);
    setValidationErrors({});
    setSubmitError('');
    setSubmitted(false);
  };

  // Helper to get image preview url
  const getFilePreviewUrl = (val) => {
    if (!val) return '';
    const apiBase = import.meta.env.VITE_BACKEND_URL || '';
    if (typeof val === 'object' && val.url) {
      if (val.url.startsWith('http')) return val.url;
      const cleanPath = val.url.startsWith('/') ? val.url : '/' + val.url;
      return `${apiBase}${cleanPath}`;
    }
    if (typeof val === 'string') {
      if (val.startsWith('http')) return val;
      if (val.startsWith('/uploads/')) return `${apiBase}${val}`;
    }
    return '';
  };

  const currentRadius = theme.cardRadius || '12px';
  const currentShadow = theme.cardShadow || 'sm';
  const isDark =
    theme.preset === 'dark' ||
    theme.preset === 'modern' ||
    theme.backgroundColor === '#090D16' ||
    theme.backgroundColor === '#0F172A';

  const getShadowClass = () => {
    switch (currentShadow) {
      case 'none':
        return 'shadow-none';
      case 'sm':
        return 'shadow-xs';
      case 'md':
        return 'shadow-md';
      case 'xl':
        return 'shadow-xl shadow-black/10';
      default:
        return 'shadow-xs';
    }
  };

  const cardStyle = {
    backgroundColor: theme.cardColor,
    color: theme.textColor,
    borderRadius: currentRadius,
    fontFamily: theme.fontFamily,
  };

  // Theme-adaptive input styles
  const inputStyle = {
    borderRadius: currentRadius,
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(255, 255, 255, 0.95)',
    borderColor: isDark ? 'rgba(255, 255, 255, 0.14)' : 'rgba(0, 0, 0, 0.12)',
    color: theme.textColor,
    fontFamily: theme.fontFamily,
  };

  // Determine submit button styling matching theme configuration
  const renderSubmitButton = () => {
    let styleProps = {};
    let customClassName = 'w-full sm:w-auto font-semibold shadow-sm min-w-[180px] transition-all px-8 py-3 h-12 text-sm';

    if (theme.buttonStyle === 'solid') {
      styleProps = {
        backgroundColor: theme.primaryColor,
        color: '#ffffff',
        borderRadius: currentRadius,
      };
    } else if (theme.buttonStyle === 'gradient') {
      styleProps = {
        background: `linear-gradient(135deg, ${theme.primaryColor}, #8B5CF6)`,
        color: '#ffffff',
        borderRadius: currentRadius,
      };
    } else if (theme.buttonStyle === 'pill') {
      styleProps = {
        backgroundColor: theme.primaryColor,
        color: '#ffffff',
        borderRadius: '9999px',
      };
      customClassName += ' px-9';
    } else if (theme.buttonStyle === 'outline') {
      styleProps = {
        borderColor: theme.primaryColor,
        color: theme.primaryColor,
        backgroundColor: 'transparent',
        borderWidth: '2px',
        borderRadius: currentRadius,
      };
      customClassName += ' hover:bg-slate-100/30';
    }

    return (
      <Button
        type="submit"
        disabled={submitting}
        size="lg"
        style={styleProps}
        className={customClassName}
      >
        {submitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            <Send className="w-4 h-4 mr-2" />
            Submit Response
          </>
        )}
      </Button>
    );
  };

  // 1. Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
          <p className="text-sm font-medium text-slate-500">Loading form...</p>
        </div>
      </div>
    );
  }

  // 2. 404 Not Found State
  if (notFound) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 py-12">
        <Card className="max-w-md w-full shadow-lg border-border text-center">
          <CardHeader className="pb-4">
            <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="w-8 h-8" />
            </div>
            <CardTitle className="text-2xl font-bold">Form Not Found</CardTitle>
            <CardDescription className="text-sm mt-2 leading-relaxed">
              The form you are looking for does not exist, has been unpublished by its author, or the link contains a typo.
            </CardDescription>
          </CardHeader>
          <CardFooter className="pt-2">
            <Button asChild className="w-full">
              <Link to="/">Go to FormCraft Home</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // 3. Generic Loading Error State
  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 py-12">
        <Card className="max-w-md w-full shadow-lg border-destructive/30 text-center">
          <CardHeader className="pb-4">
            <div className="w-14 h-14 bg-red-50 text-destructive rounded-full flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="w-8 h-8" />
            </div>
            <CardTitle className="text-xl font-bold">Unable to Load Form</CardTitle>
            <CardDescription className="text-sm mt-2 text-destructive font-medium">
              {error}
            </CardDescription>
          </CardHeader>
          <CardFooter className="pt-2">
            <Button onClick={() => window.location.reload()} variant="outline" className="w-full">
              Try Again
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // 4. Submission Success State
  if (submitted) {
    return (
      <div
        className="min-h-screen flex flex-col justify-center items-center px-4 py-12"
        style={{
          backgroundColor: theme.backgroundColor,
          fontFamily: theme.fontFamily,
        }}
      >
        <Card
          className={`max-w-lg w-full overflow-hidden border border-black/5 animate-in fade-in-50 zoom-in-95 duration-200 ${getShadowClass()}`}
          style={cardStyle}
        >
          <div
            className="h-2.5"
            style={{
              background: `linear-gradient(90deg, #16A34A, ${theme.primaryColor}, #3730A3)`,
            }}
          />
          <CardContent className="pt-10 pb-8 px-6 sm:px-10 text-center">
            <div className="w-16 h-16 bg-emerald-50 text-[#16A34A] rounded-full flex items-center justify-center mx-auto mb-5 ring-8 ring-emerald-50/60 shadow-sm">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Thank You!
            </h2>
            <p
              className="text-base font-semibold mt-1"
              style={{ color: theme.primaryColor }}
            >
              {form?.title}
            </p>
            <p className="text-sm opacity-75 mt-3 leading-relaxed max-w-sm mx-auto">
              {submissionMessage}
            </p>

            <Separator className="my-6 opacity-20" />

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                type="button"
                onClick={handleResetForm}
                variant="outline"
                className="w-full sm:w-auto font-medium"
                style={{ borderRadius: currentRadius }}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Submit Another Response
              </Button>
            </div>
          </CardContent>
          <div className="px-6 py-3 border-t border-black/5 flex items-center justify-center gap-1.5 text-xs opacity-60">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Form submitted securely via FormCraft</span>
          </div>
        </Card>
      </div>
    );
  }

  const fields = form?.fields || [];

  return (
    <div
      className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 transition-colors duration-200"
      style={{
        backgroundColor: theme.backgroundColor,
        fontFamily: theme.fontFamily,
      }}
    >
      <div className="max-w-2xl mx-auto space-y-5">
        {/* HEADER IMAGE BANNER IF CONFIGURED */}
        {theme.headerImage?.url && (
          <div
            className="w-full h-40 sm:h-52 md:h-60 overflow-hidden relative shadow-sm border border-black/5 transition-all"
            style={{ borderRadius: currentRadius }}
          >
            <img
              src={theme.headerImage.url}
              alt="Form Header Banner"
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Form Title & Description Header Card (SECTION HEADER) */}
        <Card
          className={`border overflow-hidden transition-all ${getShadowClass()}`}
          style={{
            ...cardStyle,
            borderTop: `6px solid ${theme.primaryColor}`,
            borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
          }}
        >
          <CardHeader className="space-y-3 pb-6">
            <div className="flex items-center justify-between gap-4">
              <Badge
                variant="outline"
                className="text-xs px-2.5 py-0.5 font-semibold"
                style={{
                  borderColor: `${theme.primaryColor}30`,
                  backgroundColor: `${theme.primaryColor}15`,
                  color: theme.primaryColor,
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full mr-1.5 animate-pulse"
                  style={{ backgroundColor: theme.primaryColor }}
                />
                Published Form
              </Badge>
              {form?.publishedAt && (
                <span className="text-xs opacity-60">
                  Published {new Date(form.publishedAt).toLocaleDateString()}
                </span>
              )}
            </div>

            <div>
              <h1
                className="font-black tracking-tight leading-tight transition-all"
                style={{
                  fontSize: theme.headerFontSize,
                  color: theme.textColor,
                  fontFamily: theme.fontFamily,
                }}
              >
                {form?.title}
              </h1>
              {form?.description && (
                <p
                  className="mt-2.5 whitespace-pre-line leading-relaxed transition-all"
                  style={{
                    fontSize: theme.descriptionFontSize,
                    color: theme.textColor,
                    opacity: 0.85,
                    fontFamily: theme.fontFamily,
                  }}
                >
                  {form.description}
                </p>
              )}
            </div>

            <div
              className="flex items-center justify-between text-xs pt-3 border-t"
              style={{
                borderColor: `${theme.textColor}15`,
                color: theme.textColor,
                opacity: 0.7,
              }}
            >
              <span className="font-medium">
                {fields.length} {fields.length === 1 ? 'Question' : 'Questions'}
              </span>
              <span className="text-red-500 font-semibold flex items-center gap-1">
                <span>*</span> Required questions marked
              </span>
            </div>
          </CardHeader>
        </Card>

        {/* Global Submission Error Banner */}
        {submitError && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-950 rounded-xl text-sm flex items-start gap-3 shadow-sm animate-in fade-in duration-200">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
            <div className="flex-1">
              <p className="font-semibold text-sm">{submitError}</p>
              {Object.keys(validationErrors).length > 0 && (
                <p className="text-xs text-red-700 mt-1">
                  Please review the required or invalid fields highlighted below.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Interactive Fields Form */}
        {fields.length === 0 ? (
          <Card
            className="border-dashed p-10 text-center text-sm"
            style={cardStyle}
          >
            <HelpCircle className="w-10 h-10 mx-auto opacity-40 mb-2" />
            <p className="opacity-70">This form has no configured fields yet.</p>
          </Card>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map((field, idx) => {
              const fieldAnswer = answers[field.id];
              const fieldError = validationErrors[field.id];
              const fileOpts = field.options || {};
              const allowedExts = fileOpts.allowedExtensions || [];
              const maxMB = fileOpts.maxFileSizeMB || 5;
              const isUploading = Boolean(uploadingFields[field.id]);
              const FieldIcon = getFieldIconComponent(field);

              return (
                <Card
                  key={field.id}
                  className={`transition-all border p-6 sm:p-7 ${getShadowClass()} ${
                    fieldError ? 'ring-2 ring-red-400' : ''
                  }`}
                  style={{
                    ...cardStyle,
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
                  }}
                >
                  <CardContent className="p-0 space-y-3">
                    {/* ICON-BASED FIELD LABEL */}
                    <div className="flex items-center justify-between mb-2">
                      <Label
                        className="flex items-center gap-2.5 font-bold tracking-tight text-sm leading-snug cursor-pointer"
                        style={{
                          fontSize: theme.questionFontSize,
                          color: theme.textColor,
                          fontFamily: theme.fontFamily,
                        }}
                      >
                        {FieldIcon && (
                          <span
                            className="inline-flex items-center justify-center w-7 h-7 rounded-lg transition-transform shrink-0 shadow-2xs"
                            style={{
                              backgroundColor: `${theme.primaryColor}14`,
                              color: theme.primaryColor,
                            }}
                          >
                            <FieldIcon className="w-3.5 h-3.5" />
                          </span>
                        )}
                        <span>
                          {field.label}
                          {field.required && (
                            <span className="text-red-500 ml-1 font-bold" title="Required field">*</span>
                          )}
                        </span>
                      </Label>

                      {field.required && (
                        <span
                          className="text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full border"
                          style={{
                            borderColor: `${theme.textColor}20`,
                            color: theme.textColor,
                            opacity: 0.65,
                          }}
                        >
                          Required
                        </span>
                      )}
                    </div>

                    {/* 1. Single-line Text */}
                    {field.type === 'text' && (
                      <Input
                        type="text"
                        value={fieldAnswer || ''}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                        placeholder={field.placeholder || 'Enter your response...'}
                        className="h-11 px-3.5 text-sm transition-all focus-visible:ring-2"
                        style={inputStyle}
                      />
                    )}

                    {/* 2. Email Address */}
                    {field.type === 'email' && (
                      <Input
                        type="email"
                        value={fieldAnswer || ''}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                        placeholder={field.placeholder || 'name@example.com'}
                        className="h-11 px-3.5 text-sm transition-all focus-visible:ring-2"
                        style={inputStyle}
                      />
                    )}

                    {/* 3. Number */}
                    {field.type === 'number' && (
                      <Input
                        type="number"
                        value={fieldAnswer || ''}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                        placeholder={field.placeholder || '0'}
                        className="h-11 px-3.5 text-sm transition-all focus-visible:ring-2"
                        style={inputStyle}
                      />
                    )}

                    {/* 4. Date Input */}
                    {field.type === 'date' && (
                      <div className="space-y-1">
                        <Input
                          type="date"
                          value={fieldAnswer || ''}
                          onChange={(e) => handleInputChange(field.id, e.target.value)}
                          className="h-11 px-3.5 text-sm font-medium transition-all focus-visible:ring-2"
                          style={inputStyle}
                        />
                        {field.placeholder && (
                          <p className="text-[11px] opacity-60 pl-1">{field.placeholder}</p>
                        )}
                      </div>
                    )}

                    {/* 5. Multi-line Textarea */}
                    {field.type === 'textarea' && (
                      <Textarea
                        rows={4}
                        value={fieldAnswer || ''}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                        placeholder={field.placeholder || 'Write your detailed response here...'}
                        className="p-3.5 text-sm leading-relaxed transition-all focus-visible:ring-2"
                        style={inputStyle}
                      />
                    )}

                    {/* 6. Dropdown Select */}
                    {field.type === 'select' && (
                      <Select
                        value={fieldAnswer || ''}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                        className="h-11 px-3.5 text-sm font-medium transition-all focus-visible:ring-2 cursor-pointer"
                        style={inputStyle}
                      >
                        <option value="">-- Choose an option --</option>
                        {Array.isArray(field.options) &&
                          field.options.map((opt, optIdx) => (
                            <option key={optIdx} value={opt}>
                              {opt}
                            </option>
                          ))}
                      </Select>
                    )}

                    {/* 7. Radio Option Cards */}
                    {field.type === 'radio' && (
                      <div className="space-y-2.5 pt-1">
                        {Array.isArray(field.options) &&
                          field.options.map((opt, optIdx) => {
                            const isSelected = fieldAnswer === opt;
                            return (
                              <label
                                key={optIdx}
                                className="flex items-center justify-between p-3.5 border cursor-pointer transition-all text-sm font-medium group"
                                style={{
                                  borderRadius: currentRadius,
                                  backgroundColor: isSelected
                                    ? `${theme.primaryColor}14`
                                    : isDark
                                    ? 'rgba(255, 255, 255, 0.03)'
                                    : 'rgba(255, 255, 255, 0.75)',
                                  borderColor: isSelected
                                    ? theme.primaryColor
                                    : isDark
                                    ? 'rgba(255, 255, 255, 0.12)'
                                    : 'rgba(0, 0, 0, 0.1)',
                                  color: theme.textColor,
                                }}
                              >
                                <div className="flex items-center space-x-3">
                                  <span
                                    className="w-4 h-4 rounded-full border flex items-center justify-center transition-all shrink-0"
                                    style={{
                                      borderColor: isSelected ? theme.primaryColor : 'currentColor',
                                      backgroundColor: isSelected ? theme.primaryColor : 'transparent',
                                    }}
                                  >
                                    {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                                  </span>
                                  <span>{opt}</span>
                                </div>
                                <input
                                  type="radio"
                                  name={`public-field-${field.id}`}
                                  value={opt}
                                  checked={isSelected}
                                  onChange={() => handleInputChange(field.id, opt)}
                                  className="sr-only"
                                />
                              </label>
                            );
                          })}
                      </div>
                    )}

                    {/* 8. Checkbox Cards */}
                    {field.type === 'checkbox' && (
                      <div className="space-y-2.5 pt-1">
                        {Array.isArray(field.options) &&
                          field.options.map((opt, optIdx) => {
                            const isChecked = Array.isArray(fieldAnswer) && fieldAnswer.includes(opt);
                            return (
                              <label
                                key={optIdx}
                                className="flex items-center justify-between p-3.5 border cursor-pointer transition-all text-sm font-medium group"
                                style={{
                                  borderRadius: currentRadius,
                                  backgroundColor: isChecked
                                    ? `${theme.primaryColor}14`
                                    : isDark
                                    ? 'rgba(255, 255, 255, 0.03)'
                                    : 'rgba(255, 255, 255, 0.75)',
                                  borderColor: isChecked
                                    ? theme.primaryColor
                                    : isDark
                                    ? 'rgba(255, 255, 255, 0.12)'
                                    : 'rgba(0, 0, 0, 0.1)',
                                  color: theme.textColor,
                                }}
                              >
                                <div className="flex items-center space-x-3">
                                  <span
                                    className="w-4 h-4 rounded-md border flex items-center justify-center transition-all shrink-0"
                                    style={{
                                      borderColor: isChecked ? theme.primaryColor : 'currentColor',
                                      backgroundColor: isChecked ? theme.primaryColor : 'transparent',
                                    }}
                                  >
                                    {isChecked && <Check className="w-3 h-3 text-white stroke-[3]" />}
                                  </span>
                                  <span>{opt}</span>
                                </div>
                                <input
                                  type="checkbox"
                                  value={opt}
                                  checked={isChecked}
                                  onChange={() => handleCheckboxToggle(field.id, opt)}
                                  className="sr-only"
                                />
                              </label>
                            );
                          })}
                      </div>
                    )}

                    {/* 9. Premium File & Image Upload Dropzone */}
                    {field.type === 'file' && (
                      <div className="space-y-3 pt-1">
                        <div
                          className="border-2 border-dashed p-6 text-center transition flex flex-col items-center"
                          style={{
                            borderRadius: currentRadius,
                            borderColor: `${theme.primaryColor}40`,
                            backgroundColor: `${theme.primaryColor}06`,
                          }}
                        >
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center mb-2 shadow-2xs"
                            style={{
                              backgroundColor: `${theme.primaryColor}18`,
                              color: theme.primaryColor,
                            }}
                          >
                            <FileUp className="w-5 h-5" />
                          </div>
                          <p className="text-sm font-bold">
                            Choose an image or document to upload
                          </p>
                          <p className="text-xs opacity-75 mt-1 mb-3">
                            Accepted formats:{' '}
                            {allowedExts.length > 0 ? (
                              <span className="font-semibold">
                                {allowedExts.map((e) => `.${String(e).toLowerCase().replace(/^\./, '')}`).join(', ')}
                              </span>
                            ) : (
                              'Any file format'
                            )}{' '}
                            • Max limit: <strong>{maxMB} MB</strong>
                          </p>

                          <label className="cursor-pointer">
                            <span
                              className="inline-flex items-center justify-center text-xs font-semibold h-9 px-4 py-2 border shadow-xs transition"
                              style={{
                                backgroundColor: theme.cardColor,
                                border: `1px solid ${theme.textColor}30`,
                                color: theme.textColor,
                                borderRadius: currentRadius,
                              }}
                            >
                              Select File
                            </span>
                            <input
                              type="file"
                              className="hidden"
                              accept={allowedExts.map((e) => `.${String(e).toLowerCase().replace(/^\./, '')}`).join(',')}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleFileSelect(field.id, file, maxMB, allowedExts);
                              }}
                            />
                          </label>
                        </div>

                        {/* Uploading Spinner */}
                        {isUploading && (
                          <div
                            className="flex items-center justify-center p-3 border rounded-xl text-xs gap-2 animate-in fade-in"
                            style={{
                              backgroundColor: `${theme.primaryColor}10`,
                              borderColor: `${theme.primaryColor}30`,
                              borderRadius: currentRadius,
                            }}
                          >
                            <Loader2
                              className="w-4 h-4 animate-spin"
                              style={{ color: theme.primaryColor }}
                            />
                            <span>Uploading file to server...</span>
                          </div>
                        )}

                        {/* Uploaded File / Image Preview */}
                        {fieldAnswer && !isUploading && (
                          (() => {
                            const fileName =
                              typeof fieldAnswer === 'object'
                                ? fieldAnswer.fileName || fieldAnswer.originalName
                                : String(fieldAnswer);
                            const previewUrl = getFilePreviewUrl(fieldAnswer);
                            const ext = String(fileName || '').split('.').pop()?.toLowerCase();
                            const isImage =
                              (typeof fieldAnswer === 'object' && fieldAnswer.isImage) ||
                              ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'].includes(ext);

                            return isImage && previewUrl ? (
                              <div
                                className="p-3 border rounded-xl space-y-2"
                                style={{
                                  backgroundColor: `${theme.primaryColor}10`,
                                  borderColor: `${theme.primaryColor}30`,
                                  borderRadius: currentRadius,
                                }}
                              >
                                <div className="flex items-center justify-between text-xs">
                                  <span className="font-semibold flex items-center gap-1.5">
                                    <ImageIcon
                                      className="w-3.5 h-3.5"
                                      style={{ color: theme.primaryColor }}
                                    />
                                    Image Attached
                                  </span>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleInputChange(field.id, '')}
                                    className="text-red-500 hover:bg-red-50 h-6 px-2 text-xs"
                                  >
                                    <X className="w-3 h-3 mr-1" /> Remove
                                  </Button>
                                </div>
                                <div className="flex items-center gap-3">
                                  <img
                                    src={previewUrl}
                                    alt={fileName}
                                    className="w-14 h-14 object-cover rounded-lg border border-slate-200 bg-white shrink-0 shadow-xs"
                                  />
                                  <div className="min-w-0 text-xs">
                                    <p className="font-bold truncate">{fileName}</p>
                                    {typeof fieldAnswer === 'object' && fieldAnswer.size && (
                                      <p className="text-[11px] opacity-60 mt-0.5">
                                        {(fieldAnswer.size / 1024).toFixed(1)} KB
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div
                                className="flex items-center justify-between p-3 border rounded-xl text-xs"
                                style={{
                                  backgroundColor: `${theme.primaryColor}10`,
                                  borderColor: `${theme.primaryColor}30`,
                                  borderRadius: currentRadius,
                                }}
                              >
                                <div className="flex items-center space-x-2 truncate">
                                  <FileText
                                    className="w-4 h-4 shrink-0"
                                    style={{ color: theme.primaryColor }}
                                  />
                                  <span className="font-medium truncate">{fileName}</span>
                                  {typeof fieldAnswer === 'object' && fieldAnswer.size && (
                                    <span className="opacity-60">
                                      ({(fieldAnswer.size / 1024).toFixed(1)} KB)
                                    </span>
                                  )}
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleInputChange(field.id, '')}
                                  className="text-red-500 hover:bg-red-50 h-7 px-2 text-xs"
                                >
                                  <X className="w-3.5 h-3.5 mr-1" />
                                  Remove
                                </Button>
                              </div>
                            );
                          })()
                        )}
                      </div>
                    )}

                    {/* Field Inline Error Message */}
                    {fieldError && (
                      <p className="text-xs font-semibold text-red-600 flex items-center gap-1.5 pt-1 animate-in fade-in duration-150">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{fieldError}</span>
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}

            {/* Footer Submit Card */}
            <Card
              className={`border p-5 transition-all ${getShadowClass()}`}
              style={{
                ...cardStyle,
                borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
              }}
            >
              <CardContent className="p-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="text-xs opacity-75 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    Never submit passwords or sensitive credentials through web forms.
                  </p>
                  <p className="text-xs opacity-60 mt-0.5">
                    Powered by <strong className="font-semibold">FormCraft</strong>
                  </p>
                </div>

                {renderSubmitButton()}
              </CardContent>
            </Card>
          </form>
        )}
      </div>
    </div>
  );
};

export default PublicForm;
