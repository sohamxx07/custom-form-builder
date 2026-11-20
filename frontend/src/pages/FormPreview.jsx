import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import {
  ArrowLeft,
  Eye,
  CheckCircle2,
  AlertCircle,
  FileUp,
  RotateCcw,
  Palette,
  Monitor,
  Tablet,
  Smartphone,
  SlidersHorizontal,
  X,
  Save,
  Loader2,
  Check,
  Calendar,
  Image as ImageIcon,
  FileText,
  Sparkles,
} from 'lucide-react';
import ThemeCustomizer from '../components/ThemeCustomizer';
import { DEFAULT_THEME, sanitizeTheme } from '../lib/themePresets';
import { getFieldIconComponent } from '../lib/fieldIcons';

const FormPreview = () => {
  const { formId } = useParams();

  const [form, setForm] = useState(null);
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Field test values in state
  const [answers, setAnswers] = useState({});
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  // Theme Customization State
  const [theme, setTheme] = useState(DEFAULT_THEME);
  const [lastSavedTheme, setLastSavedTheme] = useState(DEFAULT_THEME);
  const [savingTheme, setSavingTheme] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // { type: 'success' | 'error', message: string } | null
  const [themeSidebarOpen, setThemeSidebarOpen] = useState(true);
  const [viewportMode, setViewportMode] = useState('desktop'); // 'desktop' | 'tablet' | 'mobile'

  useEffect(() => {
    const fetchFormAndFields = async () => {
      setLoading(true);
      setError('');
      try {
        const [formRes, fieldsRes] = await Promise.all([
          api.get(`/forms/${formId}`),
          api.get(`/forms/${formId}/fields`),
        ]);
        const fetchedForm = formRes.data.data;
        setForm(fetchedForm);

        // Load saved theme from database or use DEFAULT_THEME
        if (fetchedForm?.theme) {
          const loadedTheme = sanitizeTheme(fetchedForm.theme);
          setTheme(loadedTheme);
          setLastSavedTheme(loadedTheme);
        } else {
          setTheme(DEFAULT_THEME);
          setLastSavedTheme(DEFAULT_THEME);
        }

        const fetchedFields = fieldsRes.data.data || [];
        setFields(fetchedFields);

        const initialAnswers = {};
        fetchedFields.forEach((field) => {
          if (field.type === 'checkbox') {
            initialAnswers[field.id] = [];
          } else {
            initialAnswers[field.id] = '';
          }
        });
        setAnswers(initialAnswers);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load form preview.');
      } finally {
        setLoading(false);
      }
    };

    fetchFormAndFields();
  }, [formId]);

  const handleInputChange = (fieldId, value) => {
    setAnswers((prev) => ({
      ...prev,
      [fieldId]: value,
    }));
    if (validationErrors[fieldId]) {
      setValidationErrors((prev) => {
        const copy = { ...prev };
        delete copy[fieldId];
        return copy;
      });
    }
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
    if (validationErrors[fieldId]) {
      setValidationErrors((prev) => {
        const copy = { ...prev };
        delete copy[fieldId];
        return copy;
      });
    }
  };

  const handleFileSelect = (fieldId, file, maxMB, allowedExts) => {
    if (!file) return;

    if (maxMB && file.size > maxMB * 1024 * 1024) {
      alert(`File size exceeds the limit of ${maxMB} MB.`);
      return;
    }

    const ext = file.name.split('.').pop()?.toLowerCase();
    if (Array.isArray(allowedExts) && allowedExts.length > 0) {
      const lowerExts = allowedExts.map((e) => e.toLowerCase());
      if (!lowerExts.includes(ext)) {
        alert(
          `File extension .${ext} is not allowed. Supported extensions: ${allowedExts.join(', ')}`
        );
        return;
      }
    }

    const isImage = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'].includes(ext);
    const localUrl = URL.createObjectURL(file);

    setAnswers((prev) => ({
      ...prev,
      [fieldId]: {
        fileName: file.name,
        size: file.size,
        url: localUrl,
        isImage,
      },
    }));
  };

  const handleResetAnswers = () => {
    const reset = {};
    fields.forEach((f) => {
      reset[f.id] = f.type === 'checkbox' ? [] : '';
    });
    setAnswers(reset);
    setValidationErrors({});
    setTestResult(null);
  };

  const handleResetTheme = () => {
    if (theme.headerImage?.url) {
      URL.revokeObjectURL(theme.headerImage.url);
    }
    setTheme(DEFAULT_THEME);
  };

  // Compare theme against last saved theme to detect real changes
  const isThemeChanged = () => {
    if (!lastSavedTheme) return false;
    return (
      theme.preset !== lastSavedTheme.preset ||
      theme.primaryColor !== lastSavedTheme.primaryColor ||
      theme.backgroundColor !== lastSavedTheme.backgroundColor ||
      theme.cardColor !== lastSavedTheme.cardColor ||
      theme.textColor !== lastSavedTheme.textColor ||
      theme.fontFamily !== lastSavedTheme.fontFamily ||
      theme.headerFontSize !== lastSavedTheme.headerFontSize ||
      theme.questionFontSize !== lastSavedTheme.questionFontSize ||
      theme.descriptionFontSize !== lastSavedTheme.descriptionFontSize ||
      theme.cardRadius !== lastSavedTheme.cardRadius ||
      theme.cardShadow !== lastSavedTheme.cardShadow ||
      theme.buttonStyle !== lastSavedTheme.buttonStyle
    );
  };

  // Save customized theme to backend database
  const handleSaveTheme = async () => {
    if (savingTheme) return;
    setSavingTheme(true);
    setSaveStatus(null);

    try {
      // Header Image Rule: Temporary blob URLs are not saved permanently as image references
      const themePayload = {
        ...theme,
        headerImage:
          theme.headerImage && typeof theme.headerImage === 'object' && !String(theme.headerImage.url || '').startsWith('blob:')
            ? theme.headerImage
            : null,
      };

      const response = await api.put(`/forms/${formId}/theme`, {
        theme: themePayload,
      });

      const savedThemeData = sanitizeTheme(response.data.data.theme);
      setLastSavedTheme(savedThemeData);
      setSaveStatus({
        type: 'success',
        message: 'Theme saved successfully!',
      });

      setTimeout(() => {
        setSaveStatus((prev) => (prev?.type === 'success' ? null : prev));
      }, 3500);
    } catch (err) {
      console.error('Error saving theme:', err);
      setSaveStatus({
        type: 'error',
        message: err.response?.data?.message || 'Failed to save theme. Please try again.',
      });
    } finally {
      setSavingTheme(false);
    }
  };

  const handleTestSubmit = async (e) => {
    e.preventDefault();
    setTesting(true);
    setValidationErrors({});
    setTestResult(null);

    try {
      const response = await api.post(`/forms/${formId}/test-submit`, { answers });
      setTestResult({
        success: true,
        message: response.data.message || 'Test submission passed all validations!',
      });
    } catch (err) {
      const resData = err.response?.data;
      if (resData?.data?.errors) {
        setValidationErrors(resData.data.errors);
        setTestResult({
          success: false,
          message: resData.message || 'Validation failed. Please correct the highlighted errors.',
        });
      } else {
        setTestResult({
          success: false,
          message: resData?.message || 'Test submission failed.',
        });
      }
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-slate-600">Loading form preview & theme...</p>
        </div>
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4">
        <Card className="max-w-md w-full p-8 text-center bg-white border-slate-200 shadow-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Error Loading Form</h2>
          <p className="text-sm text-slate-600 mb-6">{error || 'Form could not be found.'}</p>
          <Link to={`/forms/${formId}/builder`}>
            <Button className="w-full font-semibold">Back to Form Studio</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const currentRadius = theme.cardRadius || theme.borderRadius || '12px';
  const currentShadow = theme.cardShadow || theme.shadow || 'sm';
  const currentPreset = theme.preset || theme.activePreset || 'minimal';
  const hasUnsavedChanges = isThemeChanged();

  // Determine if theme is dark
  const isDark =
    theme.preset === 'dark' ||
    theme.preset === 'modern' ||
    theme.backgroundColor === '#090D16' ||
    theme.backgroundColor === '#0F172A';

  // Determine shadow class based on theme.cardShadow
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

  // Determine card style object
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

  // Determine submit button styling
  const renderSubmitButton = () => {
    let styleProps = {};
    let customClassName = 'font-semibold transition-all px-7 py-3 text-sm h-12 shrink-0 shadow-sm';

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
        disabled={testing || fields.length === 0}
        style={styleProps}
        className={customClassName}
      >
        {testing ? (
          <span className="flex items-center gap-2">
            <span className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
            Validating...
          </span>
        ) : (
          'Submit Response'
        )}
      </Button>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      {/* TOP CONTROL BAR */}
      <header className="h-14 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between shrink-0 z-20 shadow-2xs">
        <div className="flex items-center space-x-3">
          <Link
            to={`/forms/${formId}/builder`}
            className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1 text-slate-500" />
            <span className="hidden sm:inline">Back to Studio</span>
          </Link>
          <div className="h-4 w-px bg-slate-200 hidden sm:block" />
          <div className="flex items-center space-x-2">
            <span className="font-bold text-xs sm:text-sm text-slate-900 truncate max-w-[160px] sm:max-w-xs">
              {form?.title}
            </span>
            <Badge variant="outline" className="text-[10px] hidden md:inline-flex py-0 px-1.5 font-normal">
              Theme Studio
            </Badge>
          </div>
        </div>

        {/* Center: Device Simulation Viewport Switcher */}
        <div className="hidden md:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => setViewportMode('desktop')}
            className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
              viewportMode === 'desktop'
                ? 'bg-white text-indigo-700 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
            title="Desktop View"
          >
            <Monitor className="h-3.5 w-3.5" />
            <span className="text-[11px]">Desktop</span>
          </button>
          <button
            type="button"
            onClick={() => setViewportMode('tablet')}
            className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
              viewportMode === 'tablet'
                ? 'bg-white text-indigo-700 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
            title="Tablet View"
          >
            <Tablet className="h-3.5 w-3.5" />
            <span className="text-[11px]">Tablet</span>
          </button>
          <button
            type="button"
            onClick={() => setViewportMode('mobile')}
            className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
              viewportMode === 'mobile'
                ? 'bg-white text-indigo-700 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
            title="Mobile View"
          >
            <Smartphone className="h-3.5 w-3.5" />
            <span className="text-[11px]">Mobile</span>
          </button>
        </div>

        {/* Right Actions: Save Theme & Theme Sidebar Toggle */}
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetAnswers}
            className="h-8 text-xs text-slate-500 hover:text-slate-900 hidden lg:inline-flex"
            title="Clear test inputs"
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1 text-slate-400" />
            Clear Answers
          </Button>

          {/* SAVE THEME BUTTON */}
          <Button
            size="sm"
            onClick={handleSaveTheme}
            disabled={savingTheme || !hasUnsavedChanges}
            className={`h-8 font-semibold text-xs shadow-xs transition-all flex items-center gap-1.5 ${
              hasUnsavedChanges
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white ring-2 ring-emerald-500/20'
                : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed hover:bg-slate-100'
            }`}
            title={hasUnsavedChanges ? 'Save customized theme to database' : 'Theme is up to date'}
          >
            {savingTheme ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span className="hidden sm:inline">Saving...</span>
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Save Theme</span>
                {hasUnsavedChanges && (
                  <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                )}
              </>
            )}
          </Button>

          {/* CUSTOMIZE THEME SIDEBAR TOGGLE */}
          <Button
            size="sm"
            onClick={() => setThemeSidebarOpen(!themeSidebarOpen)}
            className={`h-8 font-semibold text-xs shadow-xs transition-all flex items-center gap-1.5 ${
              themeSidebarOpen
                ? 'bg-indigo-600 text-white hover:bg-indigo-700 ring-2 ring-indigo-500/20'
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-300'
            }`}
          >
            <Palette className="h-3.5 w-3.5 text-current" />
            <span>Customize</span>
            {currentPreset !== 'minimal' && (
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            )}
          </Button>
        </div>
      </header>

      {/* MAIN WORKSPACE (LIVE PREVIEW CANVAS + THEME SIDEBAR) */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* LEFT / CENTER: SCROLLABLE LIVE PREVIEW CANVAS */}
        <main
          className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10 transition-colors duration-200"
          style={{
            backgroundColor: theme.backgroundColor,
            fontFamily: theme.fontFamily,
          }}
        >
          <div
            className={`mx-auto transition-all duration-300 space-y-5 ${
              viewportMode === 'mobile'
                ? 'max-w-sm'
                : viewportMode === 'tablet'
                ? 'max-w-xl'
                : 'max-w-3xl'
            }`}
          >
            {/* Save Status Banner Notification */}
            {saveStatus && (
              <div
                className={`p-3 rounded-xl border text-xs sm:text-sm flex items-center justify-between shadow-xs animate-in fade-in ${
                  saveStatus.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                    : 'bg-red-50 border-red-200 text-red-950'
                }`}
              >
                <div className="flex items-center space-x-2">
                  {saveStatus.type === 'success' ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
                  )}
                  <span className="font-semibold">{saveStatus.message}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSaveStatus(null)}
                  className="text-slate-400 hover:text-slate-700 text-xs ml-2"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {/* Test Mode Alert */}
            <div
              className="border p-3 text-xs flex items-center justify-between shadow-2xs backdrop-blur-xs transition-all"
              style={{
                borderRadius: currentRadius,
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.85)',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
                color: theme.textColor,
              }}
            >
              <div className="flex items-center space-x-2">
                <span
                  className="h-2 w-2 rounded-full animate-pulse"
                  style={{ backgroundColor: theme.primaryColor }}
                />
                <span className="font-semibold">Interactive Studio Preview</span>
                <span className="opacity-60 hidden sm:inline">• Test inputs & appearance in real time</span>
              </div>
              <div className="flex items-center space-x-2">
                {hasUnsavedChanges && (
                  <Badge variant="secondary" className="text-[10px] bg-amber-50 text-amber-700 border-amber-200">
                    Unsaved
                  </Badge>
                )}
                <Badge variant="outline" className="text-[10px] uppercase font-mono">
                  {currentPreset}
                </Badge>
              </div>
            </div>

            {/* Test Submission Result Banner */}
            {testResult && (
              <div
                className={`p-4 rounded-xl border text-xs sm:text-sm flex items-start justify-between shadow-sm animate-in fade-in ${
                  testResult.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                    : 'bg-red-50 border-red-200 text-red-950'
                }`}
              >
                <div className="flex items-start space-x-2.5">
                  {testResult.success ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="font-bold">{testResult.message}</p>
                    {testResult.success && (
                      <p className="text-xs text-emerald-700 mt-0.5">
                        Client & server validations passed. Answers validated against all rules.
                      </p>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setTestResult(null)}
                  className="text-xs font-semibold hover:opacity-75"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* HEADER IMAGE BANNER (RESPONSIVE) */}
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

            {/* FORM TITLE & DESCRIPTION HEADER CARD (SECTION HEADER) */}
            <div
              className={`border transition-all overflow-hidden ${getShadowClass()}`}
              style={{
                ...cardStyle,
                borderTop: `6px solid ${theme.primaryColor}`,
                borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
              }}
            >
              <div className="p-6 sm:p-8">
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider"
                    style={{
                      backgroundColor: `${theme.primaryColor}18`,
                      color: theme.primaryColor,
                    }}
                  >
                    <Sparkles className="w-3 h-3" />
                    Custom Form
                  </span>
                </div>

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
                    className="mt-3 whitespace-pre-line leading-relaxed transition-all"
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

                <div
                  className="mt-6 pt-4 border-t flex items-center justify-between text-xs transition-opacity"
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
              </div>
            </div>

            {/* INTERACTIVE FORM FIELDS */}
            <form onSubmit={handleTestSubmit} className="space-y-4">
              {fields.map((field, idx) => {
                const fieldAnswer = answers[field.id];
                const hasError = validationErrors[field.id];
                const fileOpts = field.options || {};
                const allowedExts = fileOpts.allowedExtensions || [];
                const maxMB = fileOpts.maxFileSizeMB || 5;
                const FieldIcon = getFieldIconComponent(field);

                return (
                  <div
                    key={field.id}
                    className={`border transition-all p-6 sm:p-7 ${getShadowClass()} ${
                      hasError ? 'ring-2 ring-red-400' : ''
                    }`}
                    style={{
                      ...cardStyle,
                      borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
                    }}
                  >
                    {/* ICON-BASED FIELD LABEL */}
                    <div className="flex items-center justify-between mb-3">
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

                    {/* 4. Date Picker Input */}
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

                    {/* 7. Radio Choice Cards */}
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
                                  name={`preview-field-${field.id}`}
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

                    {/* 8. Multi-select Checkbox Cards */}
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

                    {/* 9. Premium File Upload Dropzone */}
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
                              'Any format'
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
                              Browse Files
                            </span>
                            <input
                              type="file"
                              className="hidden"
                              accept={allowedExts.map((e) => `.${e.toLowerCase()}`).join(',')}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleFileSelect(field.id, file, maxMB, allowedExts);
                              }}
                            />
                          </label>
                        </div>

                        {fieldAnswer && (
                          <div
                            className="p-3 border rounded-xl flex items-center justify-between"
                            style={{
                              backgroundColor: `${theme.primaryColor}10`,
                              borderColor: `${theme.primaryColor}30`,
                              borderRadius: currentRadius,
                            }}
                          >
                            <div className="flex items-center space-x-3 min-w-0">
                              {fieldAnswer.isImage && fieldAnswer.url ? (
                                <img
                                  src={fieldAnswer.url}
                                  alt={fieldAnswer.fileName}
                                  className="w-12 h-12 object-cover rounded-lg border bg-white shrink-0"
                                />
                              ) : (
                                <div
                                  className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                                  style={{
                                    backgroundColor: `${theme.primaryColor}20`,
                                    color: theme.primaryColor,
                                  }}
                                >
                                  <FileText className="w-4 h-4" />
                                </div>
                              )}
                              <div className="min-w-0 text-xs">
                                <p className="font-bold truncate">{fieldAnswer.fileName || fieldAnswer}</p>
                                {fieldAnswer.size && (
                                  <p className="opacity-60 text-[10px]">
                                    {(fieldAnswer.size / 1024).toFixed(1)} KB
                                  </p>
                                )}
                              </div>
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
                        )}
                      </div>
                    )}

                    {hasError && (
                      <p className="mt-2.5 text-xs font-semibold text-red-600 flex items-center gap-1.5 animate-in fade-in">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{hasError}</span>
                      </p>
                    )}
                  </div>
                );
              })}

              {/* ACTION FOOTER CARD */}
              <div
                className={`border p-5 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${getShadowClass()}`}
                style={{
                  ...cardStyle,
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
                }}
              >
                <div>
                  <p className="text-xs opacity-80 font-semibold">
                    Theme: <strong className="capitalize">{currentPreset}</strong> • Font: {theme.fontFamily.split(',')[0].replace(/['"]/g, '')}
                  </p>
                  <p className="text-[11px] opacity-60 mt-0.5">
                    Testing validation rules & visual layout without saving responses.
                  </p>
                </div>
                {renderSubmitButton()}
              </div>
            </form>
          </div>
        </main>

        {/* RIGHT: GOOGLE FORMS-STYLE THEME CUSTOMIZATION SIDEBAR */}
        {themeSidebarOpen && (
          <ThemeCustomizer
            theme={theme}
            setTheme={setTheme}
            onClose={() => setThemeSidebarOpen(false)}
            onReset={handleResetTheme}
            onSave={handleSaveTheme}
            saving={savingTheme}
            hasChanges={hasUnsavedChanges}
            saveStatus={saveStatus}
          />
        )}
      </div>
    </div>
  );
};

export default FormPreview;
