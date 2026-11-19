import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
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
  Plus,
  Search,
  FileText,
  CheckCircle2,
  Clock,
  ExternalLink,
  Settings2,
  BarChart3,
  Edit,
  Trash2,
  Copy,
  Check,
  LayoutDashboard,
  FolderOpen,
  Filter,
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'published' | 'draft'

  // Delete modal state
  const [formToDelete, setFormToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

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

  const confirmDelete = async () => {
    if (!formToDelete) return;

    setDeleting(true);
    try {
      await api.delete(`/forms/${formToDelete.id}`);
      setForms((prev) => prev.filter((f) => f.id !== formToDelete.id));
      setFormToDelete(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete form.');
    } finally {
      setDeleting(false);
    }
  };

  const copyShareLink = (form) => {
    if (!form.slug) return;
    const url = `${window.location.origin}/public/forms/${form.slug}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(form.id);
      setTimeout(() => setCopiedId(null), 2500);
    });
  };

  // Metrics
  const totalCount = forms.length;
  const publishedCount = forms.filter((f) => f.status === 'published').length;
  const draftCount = forms.filter((f) => f.status !== 'published').length;

  // Filtered forms
  const filteredForms = forms.filter((form) => {
    const matchesQuery =
      form.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (form.description && form.description.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesQuery) return false;

    if (statusFilter === 'published') return form.status === 'published';
    if (statusFilter === 'draft') return form.status !== 'published';
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50/60 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Welcome Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">
              Welcome back, {user?.name?.split(' ')[0] || 'Creator'}!
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Create custom input fields, publish live forms, and analyze collected submissions.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Link to="/forms/new">
              <Button className="h-10 px-4 rounded-xl font-semibold shadow-sm">
                <Plus className="h-4 w-4 mr-1.5" />
                Create New Form
              </Button>
            </Link>
          </div>
        </div>

        {/* Statistics Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
          {/* Card 1: Total Forms */}
          <Card className="border-border/70 hover:shadow-sm transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Total Forms
                  </p>
                  <p className="text-3xl font-black text-gray-900 mt-2">
                    {loading ? '—' : totalCount}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-100">
                  <FileText className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Published */}
          <Card className="border-border/70 hover:shadow-sm transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Live & Published
                  </p>
                  <p className="text-3xl font-black text-emerald-600 mt-2">
                    {loading ? '—' : publishedCount}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Drafts */}
          <Card className="border-border/70 hover:shadow-sm transition-all sm:col-span-2 lg:col-span-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Draft Workspaces
                  </p>
                  <p className="text-3xl font-black text-amber-600 mt-2">
                    {loading ? '—' : draftCount}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-100">
                  <Clock className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
            <Input
              type="text"
              placeholder="Search forms by title or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 rounded-xl bg-white border-border/80 text-sm shadow-sm"
            />
          </div>

          <div className="flex items-center bg-white border border-border/80 rounded-xl p-1 shadow-sm shrink-0">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                statusFilter === 'all'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All ({totalCount})
            </button>
            <button
              onClick={() => setStatusFilter('published')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                statusFilter === 'published'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Published ({publishedCount})
            </button>
            <button
              onClick={() => setStatusFilter('draft')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                statusFilter === 'draft'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Drafts ({draftCount})
            </button>
          </div>
        </div>

        {/* Error alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center justify-between shadow-sm">
            <span>{error}</span>
            <Button variant="outline" size="sm" onClick={fetchForms}>
              Retry
            </Button>
          </div>
        )}

        {/* Loading Skeleton */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse" />
                  <div className="h-5 w-16 bg-gray-200 rounded-full animate-pulse" />
                </div>
                <div className="h-10 bg-gray-100 rounded animate-pulse" />
                <div className="h-8 bg-gray-100 rounded-lg animate-pulse" />
              </Card>
            ))}
          </div>
        ) : filteredForms.length === 0 ? (
          /* Empty State */
          <Card className="border-dashed border-2 border-border/80 bg-white/60 p-12 text-center max-w-lg mx-auto my-8">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl shadow-inner">
              <FolderOpen className="h-7 w-7" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              {searchQuery || statusFilter !== 'all'
                ? 'No matching forms found'
                : 'No custom forms created yet'}
            </h3>
            <p className="text-sm text-gray-500 mb-6 max-w-xs mx-auto leading-relaxed">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your search query or switching filters.'
                : 'Create your first custom form, add configured fields, and generate shareable links.'}
            </p>
            {searchQuery || statusFilter !== 'all' ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                }}
              >
                Clear Filters
              </Button>
            ) : (
              <Link to="/forms/new">
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Create First Form
                </Button>
              </Link>
            )}
          </Card>
        ) : (
          /* Forms Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredForms.map((form) => {
              const isPublished = form.status === 'published';

              return (
                <Card
                  key={form.id}
                  className="flex flex-col justify-between hover:shadow-md transition-all group overflow-hidden border-border/80 bg-white"
                >
                  <CardHeader className="p-6 pb-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                          {form.title}
                        </CardTitle>
                      </div>
                      {isPublished ? (
                        <Badge variant="success" className="shrink-0 font-medium">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
                          Published
                        </Badge>
                      ) : (
                        <Badge variant="warning" className="shrink-0 font-medium">
                          Draft
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="line-clamp-2 mt-2 min-h-[2.5rem]">
                      {form.description || 'No description provided.'}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="px-6 py-2">
                    <div className="flex items-center justify-between text-xs text-gray-400 py-2 border-t border-gray-100">
                      <span>Created {new Date(form.createdAt).toLocaleDateString()}</span>
                      {isPublished && form.slug && (
                        <div className="flex items-center space-x-1.5">
                          <button
                            type="button"
                            onClick={() => copyShareLink(form)}
                            className="text-emerald-700 hover:text-emerald-800 font-medium inline-flex items-center text-xs p-1 rounded hover:bg-emerald-50 transition"
                            title="Copy Public Link"
                          >
                            {copiedId === form.id ? (
                              <>
                                <Check className="h-3 w-3 mr-1 text-emerald-600" />
                                Copied!
                              </>
                            ) : (
                              <>
                                <Copy className="h-3 w-3 mr-1" />
                                Copy Link
                              </>
                            )}
                          </button>
                          <span>•</span>
                          <a
                            href={`/public/forms/${form.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center"
                            title="Open Respondent Form"
                          >
                            Live ↗
                          </a>
                        </div>
                      )}
                    </div>
                  </CardContent>

                  <CardFooter className="bg-slate-50/70 px-6 py-3 border-t border-gray-100 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-3">
                      <Link
                        to={`/forms/${form.id}/responses`}
                        className="text-indigo-600 hover:text-indigo-800 font-semibold inline-flex items-center"
                      >
                        <BarChart3 className="h-3.5 w-3.5 mr-1" />
                        Responses
                      </Link>
                      <span className="text-gray-300">•</span>
                      <Link
                        to={`/forms/${form.id}/builder`}
                        className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center"
                      >
                        <Settings2 className="h-3.5 w-3.5 mr-1" />
                        Fields
                      </Link>
                    </div>

                    <div className="flex items-center space-x-1">
                      <Link
                        to={`/forms/${form.id}/edit`}
                        className="text-gray-500 hover:text-gray-800 font-medium px-2 py-1 rounded hover:bg-gray-200/50 transition"
                        title="Edit Info"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => setFormToDelete(form)}
                        className="text-gray-400 hover:text-red-600 font-medium px-2 py-1 rounded hover:bg-red-50 transition"
                        title="Delete Form"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={Boolean(formToDelete)} onOpenChange={(open) => !open && setFormToDelete(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-red-600 flex items-center">
                <Trash2 className="h-5 w-5 mr-2" />
                Delete Form
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to delete{' '}
                <strong className="text-gray-900 font-semibold">
                  "{formToDelete?.title}"
                </strong>
                ? All configured fields and submitted responses will be permanently removed.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFormToDelete(null)}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={confirmDelete}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete Permanently'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Dashboard;
