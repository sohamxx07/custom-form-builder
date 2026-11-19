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
  ArrowLeft,
  Eye,
  CheckCircle2,
  AlertCircle,
  FileUp,
  RotateCcw,
  Calendar,
} from 'lucide-react';

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

  useEffect(() => {
    const fetchFormAndFields = async () => {
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
        alert(`Invalid file extension (.${ext}). Allowed: ${allowedExts.join(', ')}`);
        return;
      }
    }

    setAnswers((prev) => ({
      ...prev,
      [fieldId]: file.name,
    }));
  };

  const handleTestSubmit = async (e) => {
    e.preventDefault();
    setTesting(true);
    setTestResult(null);
    setValidationErrors({});

    try {
      const res = await api.post(`/forms/${formId}/test-submit`, { answers });
      setTestResult({
        success: true,
        message: res.data.message || 'Test submission successful! All fields validated properly.',
        details: res.data.data,
      });
    } catch (err) {
      const errData = err.response?.data;
      setValidationErrors(errData?.data?.errors || {});
      setTestResult({
        success: false,
        message: errData?.message || 'Test validation failed. Please check the marked fields.',
      });
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col justify-center items-center px-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mb-3" />
        <p className="text-gray-500 text-sm font-medium">Loading interactive preview...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 bg-white border border-red-200 rounded-2xl text-center shadow-sm">
        <h3 className="text-lg font-bold text-red-800 mb-2">Error Loading Preview</h3>
        <p className="text-sm text-red-600 mb-6">{error}</p>
        <Link to={`/forms/${formId}/builder`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back to Form Builder
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EEF2FF]/40 py-8 px-4 sm:px-6 lg:px-8 pb-16">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between">
          <Link
            to={`/forms/${formId}/builder`}
            className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back to Form Builder
          </Link>
          <Badge variant="secondary" className="font-semibold px-3 py-1">
            <Eye className="h-3.5 w-3.5 mr-1.5 text-indigo-600" />
            Creator Test Mode
          </Badge>
        </div>

        {/* Test Result Alert */}
        {testResult && (
          <div
            className={`p-4 rounded-2xl border text-sm flex items-start justify-between shadow-sm animate-in fade-in ${
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
                    Server validations passed. No records were written to the responses database.
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={() => setTestResult(null)}
              className="text-xs font-semibold hover:opacity-75"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Form Details Card */}
        <Card className="border-t-8 border-t-indigo-600 border-border/80 shadow-sm bg-white">
          <CardHeader className="p-6 sm:p-8 pb-4">
            <CardTitle className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              {form?.title}
            </CardTitle>
            {form?.description && (
              <CardDescription className="text-sm text-gray-600 mt-2 whitespace-pre-line leading-relaxed">
                {form.description}
              </CardDescription>
            )}
            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
              <span>{fields.length} Configured {fields.length === 1 ? 'Field' : 'Fields'}</span>
              <span className="text-red-500 font-medium">* Required</span>
            </div>
          </CardHeader>
        </Card>

        {/* Interactive Test Form */}
        <form onSubmit={handleTestSubmit} className="space-y-4">
          {fields.map((field, idx) => {
            const fieldAnswer = answers[field.id];
            const hasError = validationErrors[field.id];
            const fileOpts = field.options || {};
            const allowedExts = fileOpts.allowedExtensions || [];
            const maxMB = fileOpts.maxFileSizeMB || 5;

            return (
              <Card
                key={field.id}
                className={`transition-all bg-white ${
                  hasError ? 'border-red-400 ring-2 ring-red-100' : 'border-border/80'
                }`}
              >
                <CardContent className="p-6">
                  <Label className="block text-sm font-bold text-gray-900 mb-2">
                    <span className="text-gray-400 font-mono text-xs mr-2">{idx + 1}.</span>
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1.5">*</span>}
                  </Label>

                  {field.type === 'text' && (
                    <Input
                      type="text"
                      value={fieldAnswer || ''}
                      onChange={(e) => handleInputChange(field.id, e.target.value)}
                      placeholder={field.placeholder || 'Your answer'}
                      className="h-10 rounded-xl"
                    />
                  )}

                  {field.type === 'email' && (
                    <Input
                      type="email"
                      value={fieldAnswer || ''}
                      onChange={(e) => handleInputChange(field.id, e.target.value)}
                      placeholder={field.placeholder || 'name@example.com'}
                      className="h-10 rounded-xl"
                    />
                  )}

                  {field.type === 'number' && (
                    <Input
                      type="number"
                      value={fieldAnswer || ''}
                      onChange={(e) => handleInputChange(field.id, e.target.value)}
                      placeholder={field.placeholder || '0'}
                      className="h-10 rounded-xl"
                    />
                  )}

                  {field.type === 'date' && (
                    <Input
                      type="date"
                      value={fieldAnswer || ''}
                      onChange={(e) => handleInputChange(field.id, e.target.value)}
                      className="h-10 rounded-xl"
                    />
                  )}

                  {field.type === 'textarea' && (
                    <Textarea
                      rows={3}
                      value={fieldAnswer || ''}
                      onChange={(e) => handleInputChange(field.id, e.target.value)}
                      placeholder={field.placeholder || 'Type your response here...'}
                      className="rounded-xl"
                    />
                  )}

                  {field.type === 'select' && (
                    <Select
                      value={fieldAnswer || ''}
                      onChange={(e) => handleInputChange(field.id, e.target.value)}
                      className="h-10 rounded-xl"
                    >
                      <option value="">-- Select an option --</option>
                      {Array.isArray(field.options) &&
                        field.options.map((opt, optIdx) => (
                          <option key={optIdx} value={opt}>
                            {opt}
                          </option>
                        ))}
                    </Select>
                  )}

                  {field.type === 'radio' && (
                    <div className="space-y-2 mt-2">
                      {Array.isArray(field.options) &&
                        field.options.map((opt, optIdx) => (
                          <label
                            key={optIdx}
                            className={`flex items-center space-x-3 p-3 rounded-xl border cursor-pointer transition text-xs font-medium text-gray-800 ${
                              fieldAnswer === opt
                                ? 'bg-indigo-50/70 border-indigo-300'
                                : 'border-gray-200 hover:bg-gray-50'
                            }`}
                          >
                            <input
                              type="radio"
                              name={`preview-field-${field.id}`}
                              value={opt}
                              checked={fieldAnswer === opt}
                              onChange={() => handleInputChange(field.id, opt)}
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                            />
                            <span>{opt}</span>
                          </label>
                        ))}
                    </div>
                  )}

                  {field.type === 'checkbox' && (
                    <div className="space-y-2 mt-2">
                      {Array.isArray(field.options) &&
                        field.options.map((opt, optIdx) => {
                          const isChecked = Array.isArray(fieldAnswer) && fieldAnswer.includes(opt);
                          return (
                            <label
                              key={optIdx}
                              className={`flex items-center space-x-3 p-3 rounded-xl border cursor-pointer transition text-xs font-medium text-gray-800 ${
                                isChecked
                                  ? 'bg-indigo-50/70 border-indigo-300'
                                  : 'border-gray-200 hover:bg-gray-50'
                              }`}
                            >
                              <Checkbox
                                checked={isChecked}
                                onChange={() => handleCheckboxToggle(field.id, opt)}
                              />
                              <span className="ml-2.5">{opt}</span>
                            </label>
                          );
                        })}
                    </div>
                  )}

                  {field.type === 'file' && (
                    <div className="mt-2">
                      <div className="border border-dashed border-gray-300 rounded-xl p-5 text-center bg-gray-50/50">
                        <FileUp className="h-6 w-6 text-gray-400 mx-auto mb-1.5" />
                        <p className="text-xs text-gray-500 mb-2">
                          Accepted: {allowedExts.length > 0 ? allowedExts.join(', ') : 'Any'} • Max size: {maxMB} MB
                        </p>
                        <label className="inline-flex items-center bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 font-semibold px-3 py-1.5 rounded-lg text-xs shadow-xs cursor-pointer transition">
                          Select Test File
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
                        <p className="mt-2 text-xs text-indigo-700 font-medium">
                          Selected test file: <strong>{fieldAnswer}</strong>
                        </p>
                      )}
                    </div>
                  )}

                  {hasError && (
                    <p className="mt-2 text-xs font-semibold text-red-600 flex items-center">
                      <span className="mr-1">●</span> {hasError}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}

          <Card className="border-border/80 p-5 shadow-sm bg-white">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <p className="text-xs text-gray-500">
                Test mode validates simulated input data against backend business rules without creating database responses.
              </p>
              <Button
                type="submit"
                disabled={testing || fields.length === 0}
                className="bg-indigo-600 hover:bg-indigo-700 font-semibold shadow-sm shrink-0"
              >
                {testing ? 'Testing...' : 'Test Submit Form'}
              </Button>
            </div>
          </Card>
        </form>
      </div>
    </div>
  );
};

export default FormPreview;
