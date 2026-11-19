import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { ArrowLeft, FileText, Save, ArrowRight, Loader2 } from 'lucide-react';

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
        // Promptly redirect directly into the field builder for smooth SaaS flow
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
      <div className="min-h-[70vh] flex flex-col justify-center items-center px-4 bg-[#EEF2FF]/40">
        <Loader2 className="w-8 h-8 animate-spin text-[#4F46E5] mb-3" />
        <p className="text-slate-500 text-sm font-medium">Loading form info...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EEF2FF]/40 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <Link
          to="/dashboard"
          className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-[#4F46E5] transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          Back to Dashboard
        </Link>

        <Card className="border-slate-200 bg-white shadow-xl rounded-2xl overflow-hidden">
          <CardHeader className="p-6 sm:p-8 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center space-x-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EEF2FF] text-[#4F46E5] border border-indigo-100 shadow-xs">
                <FileText className="h-5 w-5" />
              </div>
              <CardTitle className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                {isEditing ? 'Edit Form Information' : 'Create New Custom Form'}
              </CardTitle>
            </div>
            <CardDescription className="text-xs sm:text-sm text-slate-500">
              {isEditing
                ? 'Update the title and general description for this form workspace.'
                : 'Enter basic details to initialize your form workspace, then proceed to configure fields.'}
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 sm:p-8">
            {error && (
              <div className="mb-6 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs font-medium rounded-xl flex items-start space-x-2 animate-in fade-in duration-150">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="form-title" className="text-xs sm:text-sm font-bold text-slate-800">
                  Form Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="form-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Employee Feedback Survey"
                  required
                  className="h-10 rounded-xl text-sm"
                />
                <p className="text-[11px] text-slate-400">
                  A recognizable, clear title shown to respondents and on your dashboard.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="form-desc" className="text-xs sm:text-sm font-bold text-slate-800">
                  Form Description (Optional)
                </Label>
                <Textarea
                  id="form-desc"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide instructions, context, or guidelines for respondents filling out this form..."
                  className="rounded-xl text-sm"
                />
              </div>

              <div className="pt-4 flex items-center justify-end space-x-3 border-t border-slate-100">
                <Link to="/dashboard">
                  <Button variant="outline" type="button" size="sm" className="rounded-xl">
                    Cancel
                  </Button>
                </Link>
                <Button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl font-semibold shadow-md shadow-indigo-500/20"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : isEditing ? (
                    <>
                      <Save className="h-4 w-4 mr-1.5" />
                      Save Changes
                    </>
                  ) : (
                    <>
                      Continue to Field Studio
                      <ArrowRight className="h-4 w-4 ml-1.5" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FormEditor;
