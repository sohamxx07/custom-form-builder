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
  Sparkles,
} from 'lucide-react';

const PublicForm = () => {
  const { slug } = useParams();

  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notFound, setNotFound] = useState(false);

  // Field values in state so respondents can interact with inputs
  const [answers, setAnswers] = useState({});

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
        alert(`Invalid file extension (.${ext}). Allowed: ${allowedExts.join(', ')}`);
        return;
      }
    }

    setAnswers((prev) => ({
      ...prev,
      [fieldId]: file.name,
    }));
    clearFieldError(fieldId);
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

  // 1. Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/60 flex flex-col justify-center items-center px-4">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-sm font-medium text-muted-foreground">Loading form...</p>
        </div>
      </div>
    );
  }

  // 2. 404 Not Found State
  if (notFound) {
    return (
      <div className="min-h-screen bg-slate-50/60 flex flex-col justify-center items-center px-4 py-12">
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
              <Link to="/login">Go to FormCraft Home</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // 3. Generic Loading Error State
  if (error) {
    return (
      <div className="min-h-screen bg-slate-50/60 flex flex-col justify-center items-center px-4 py-12">
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
      <div className="min-h-screen bg-slate-50/60 flex flex-col justify-center items-center px-4 py-12">
        <Card className="max-w-lg w-full shadow-xl border-border overflow-hidden animate-in fade-in-50 zoom-in-95 duration-200">
          <div className="h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-primary" />
          <CardContent className="pt-10 pb-8 px-6 sm:px-10 text-center">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-5 ring-8 ring-emerald-50/60">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Thank You!
            </h2>
            <p className="text-base font-semibold text-primary mt-1">
              {form?.title}
            </p>
            <p className="text-sm text-muted-foreground mt-3 leading-relaxed max-w-sm mx-auto">
              {submissionMessage}
            </p>

            <Separator className="my-6" />

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                type="button"
                onClick={handleResetForm}
                variant="outline"
                className="w-full sm:w-auto font-medium"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Submit Another Response
              </Button>
            </div>
          </CardContent>
          <div className="bg-muted/40 px-6 py-3 border-t border-border flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Form submitted securely via FormCraft</span>
          </div>
        </Card>
      </div>
    );
  }

  const fields = form?.fields || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Form Header Card */}
        <Card className="border-t-4 border-t-primary shadow-sm border-border overflow-hidden">
          <CardHeader className="space-y-3 pb-6">
            <div className="flex items-center justify-between gap-4">
              <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700 text-xs px-2.5 py-0.5 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5" />
                Published Form
              </Badge>
              {form?.publishedAt && (
                <span className="text-xs text-muted-foreground">
                  Published {new Date(form.publishedAt).toLocaleDateString()}
                </span>
              )}
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                {form?.title}
              </h1>
              {form?.description && (
                <p className="text-sm sm:text-base text-muted-foreground mt-2.5 whitespace-pre-line leading-relaxed">
                  {form.description}
                </p>
              )}
            </div>

            <Separator className="mt-4" />

            <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
              <span>{fields.length} {fields.length === 1 ? 'Field' : 'Fields'}</span>
              <span className="text-destructive font-medium flex items-center gap-1">
                <span className="text-destructive">*</span> Indicates required field
              </span>
            </div>
          </CardHeader>
        </Card>

        {/* Global Submission Error Banner */}
        {submitError && (
          <div className="p-4 bg-destructive/10 border border-destructive/30 text-destructive rounded-xl text-sm flex items-start gap-3 shadow-sm animate-in fade-in duration-200">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-destructive" />
            <div className="flex-1">
              <p className="font-semibold text-sm">{submitError}</p>
              {Object.keys(validationErrors).length > 0 && (
                <p className="text-xs text-destructive/80 mt-1">
                  Please review the required or invalid fields highlighted below.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Interactive Fields Form */}
        {fields.length === 0 ? (
          <Card className="border-dashed p-10 text-center text-muted-foreground text-sm">
            <HelpCircle className="w-10 h-10 mx-auto text-muted-foreground/60 mb-2" />
            <p>This form has no configured fields yet.</p>
          </Card>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map((field, idx) => {
              const fieldAnswer = answers[field.id];
              const fieldError = validationErrors[field.id];
              const fileOpts = field.options || {};
              const allowedExts = fileOpts.allowedExtensions || [];
              const maxMB = fileOpts.maxFileSizeMB || 5;

              return (
                <Card
                  key={field.id}
                  className={`transition-all duration-150 shadow-sm ${
                    fieldError
                      ? 'border-destructive ring-1 ring-destructive/30'
                      : 'border-border hover:border-slate-300'
                  }`}
                >
                  <CardContent className="pt-6 pb-6 px-5 sm:px-6 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <Label className="text-sm sm:text-base font-semibold text-foreground leading-snug cursor-pointer">
                        <span className="text-muted-foreground font-mono text-xs mr-2">{idx + 1}.</span>
                        {field.label}
                        {field.required && (
                          <span className="text-destructive ml-1" title="Required field">*</span>
                        )}
                      </Label>
                    </div>

                    {/* 1. Single-line Text */}
                    {field.type === 'text' && (
                      <Input
                        type="text"
                        value={fieldAnswer || ''}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                        placeholder={field.placeholder || 'Your answer'}
                        className={fieldError ? 'border-destructive focus-visible:ring-destructive' : ''}
                      />
                    )}

                    {/* 2. Email Address */}
                    {field.type === 'email' && (
                      <Input
                        type="email"
                        value={fieldAnswer || ''}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                        placeholder={field.placeholder || 'name@example.com'}
                        className={fieldError ? 'border-destructive focus-visible:ring-destructive' : ''}
                      />
                    )}

                    {/* 3. Number */}
                    {field.type === 'number' && (
                      <Input
                        type="number"
                        value={fieldAnswer || ''}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                        placeholder={field.placeholder || '0'}
                        className={fieldError ? 'border-destructive focus-visible:ring-destructive' : ''}
                      />
                    )}

                    {/* 4. Multi-line Textarea */}
                    {field.type === 'textarea' && (
                      <Textarea
                        rows={4}
                        value={fieldAnswer || ''}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                        placeholder={field.placeholder || 'Write your detailed response...'}
                        className={fieldError ? 'border-destructive focus-visible:ring-destructive' : ''}
                      />
                    )}

                    {/* 5. Dropdown Select */}
                    {field.type === 'select' && (
                      <Select
                        value={fieldAnswer || ''}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                        className={fieldError ? 'border-destructive' : ''}
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

                    {/* 6. Radio Options */}
                    {field.type === 'radio' && (
                      <div className="space-y-2 pt-1">
                        {Array.isArray(field.options) &&
                          field.options.map((opt, optIdx) => {
                            const isSelected = fieldAnswer === opt;
                            return (
                              <label
                                key={optIdx}
                                className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition text-sm ${
                                  isSelected
                                    ? 'bg-primary/5 border-primary text-foreground font-medium'
                                    : 'border-border text-foreground/80 hover:bg-slate-50'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name={`public-field-${field.id}`}
                                  value={opt}
                                  checked={isSelected}
                                  onChange={() => handleInputChange(field.id, opt)}
                                  className="h-4 w-4 text-primary focus:ring-primary border-muted-foreground/30"
                                />
                                <span>{opt}</span>
                              </label>
                            );
                          })}
                      </div>
                    )}

                    {/* 7. Checkboxes */}
                    {field.type === 'checkbox' && (
                      <div className="space-y-2 pt-1">
                        {Array.isArray(field.options) &&
                          field.options.map((opt, optIdx) => {
                            const isChecked = Array.isArray(fieldAnswer) && fieldAnswer.includes(opt);
                            return (
                              <label
                                key={optIdx}
                                className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition text-sm ${
                                  isChecked
                                    ? 'bg-primary/5 border-primary text-foreground font-medium'
                                    : 'border-border text-foreground/80 hover:bg-slate-50'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  value={opt}
                                  checked={isChecked}
                                  onChange={() => handleCheckboxToggle(field.id, opt)}
                                  className="h-4 w-4 text-primary focus:ring-primary border-muted-foreground/30 rounded"
                                />
                                <span>{opt}</span>
                              </label>
                            );
                          })}
                      </div>
                    )}

                    {/* 8. File Upload */}
                    {field.type === 'file' && (
                      <div className="space-y-3 pt-1">
                        <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 bg-slate-50/50 transition flex flex-col items-center">
                          <FileUp className="w-8 h-8 text-muted-foreground mb-2" />
                          <p className="text-sm font-medium text-foreground">
                            Choose a file to attach
                          </p>
                          <p className="text-xs text-muted-foreground mt-1 mb-3">
                            Accepted formats:{' '}
                            {allowedExts.length > 0 ? (
                              <span className="font-semibold text-foreground">
                                {allowedExts.map((e) => `.${e.toLowerCase()}`).join(', ')}
                              </span>
                            ) : (
                              'Any extension'
                            )}{' '}
                            • Max size: <strong>{maxMB} MB</strong>
                          </p>
                          <label className="cursor-pointer">
                            <span className="inline-flex items-center justify-center rounded-md text-xs font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 h-9 px-4 py-2 border border-border shadow-sm transition">
                              Select File
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
                          <div className="flex items-center justify-between p-3 bg-primary/5 border border-primary/20 rounded-lg text-xs">
                            <div className="flex items-center space-x-2 truncate">
                              <FileText className="w-4 h-4 text-primary shrink-0" />
                              <span className="font-medium text-foreground truncate">{fieldAnswer}</span>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleInputChange(field.id, '')}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10 h-7 px-2 text-xs"
                            >
                              <X className="w-3.5 h-3.5 mr-1" />
                              Remove
                            </Button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Field Inline Error Message */}
                    {fieldError && (
                      <p className="text-xs font-medium text-destructive flex items-center gap-1.5 pt-1 animate-in fade-in duration-150">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{fieldError}</span>
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}

            {/* Footer Submit Card */}
            <Card className="border-border shadow-sm">
              <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    Never submit passwords or sensitive credentials through web forms.
                  </p>
                  <p className="text-xs text-muted-foreground/70 mt-0.5">
                    Built with <strong className="font-semibold text-foreground">FormCraft</strong>
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={submitting}
                  size="lg"
                  className="w-full sm:w-auto font-medium shadow-sm min-w-[170px]"
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
              </CardContent>
            </Card>
          </form>
        )}
      </div>
    </div>
  );
};

export default PublicForm;
