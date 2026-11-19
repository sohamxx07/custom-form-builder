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
  Settings2,
  BarChart3,
  Edit,
  Trash2,
  Copy,
  Check,
  LayoutDashboard,
  FolderOpen,
  Layers,
  LogOut,
  Menu,
  X,
} from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'published' | 'draft'
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
    <div className="min-h-screen bg-[#EEF2FF]/40 flex">
      {/* 1. PROFESSIONAL SIDEBAR NAVIGATION */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200/90 shadow-sm flex flex-col justify-between transition-transform duration-200 lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-5 space-y-6">
          {/* Sidebar Header / Brand */}
          <div className="flex items-center justify-between">
            <Link to="/dashboard" className="flex items-center space-x-2.5">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#4F46E5] to-[#3730A3] text-white flex items-center justify-center font-bold shadow-sm shadow-indigo-500/25">
                <Layers className="h-5 w-5" />
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-slate-900 block leading-tight">
                  FormCraft
                </span>
                <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase block">
                  Workspace
                </span>
              </div>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Quick Action Button */}
          <Link to="/forms/new" className="block">
            <Button className="w-full bg-[#4F46E5] hover:bg-[#4338CA] text-white shadow-md shadow-indigo-500/20 font-semibold h-10 rounded-xl justify-center">
              <Plus className="h-4 w-4 mr-2" />
              Create Form
            </Button>
          </Link>

          {/* Sidebar Menu Items */}
          <div className="space-y-1">
            <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Navigation
            </p>

            <button
              onClick={() => {
                setStatusFilter('all');
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                statusFilter === 'all'
                  ? 'bg-[#4F46E5] text-white shadow-sm shadow-indigo-500/30'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-[#EEF2FF]'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <LayoutDashboard className="h-4 w-4" />
                <span>All Forms</span>
              </div>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                  statusFilter === 'all' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {totalCount}
              </span>
            </button>

            <button
              onClick={() => {
                setStatusFilter('published');
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                statusFilter === 'published'
                  ? 'bg-[#16A34A] text-white shadow-sm shadow-green-600/30'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-[#EEF2FF]'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <CheckCircle2 className="h-4 w-4" />
                <span>Published</span>
              </div>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                  statusFilter === 'published' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {publishedCount}
              </span>
            </button>

            <button
              onClick={() => {
                setStatusFilter('draft');
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                statusFilter === 'draft'
                  ? 'bg-amber-600 text-white shadow-sm shadow-amber-600/30'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-[#EEF2FF]'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Clock className="h-4 w-4" />
                <span>Drafts</span>
              </div>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                  statusFilter === 'draft' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {draftCount}
              </span>
            </button>
          </div>
        </div>

        {/* Sidebar Footer User Card */}
        <div className="p-4 border-t border-slate-200/80 bg-slate-50/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#4F46E5] to-[#3730A3] text-white font-bold text-xs flex items-center justify-center shrink-0">
                {user?.name ? user.name[0].toUpperCase() : 'U'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">{user?.name}</p>
                <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={logout}
              title="Logout"
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Backdrop for mobile sidebar */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-slate-900/50 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* 2. MAIN DASHBOARD CONTENT */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header Bar for Mobile Toggle & Search */}
        <div className="bg-white border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4 sticky top-16 z-20">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="relative w-64 sm:w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
              <Input
                type="text"
                placeholder="Search forms by title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs rounded-xl bg-slate-50 border-slate-200"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Link to="/forms/new">
              <Button size="sm" className="hidden sm:inline-flex h-9 rounded-xl font-semibold">
                <Plus className="h-3.5 w-3.5 mr-1" />
                New Form
              </Button>
            </Link>
          </div>
        </div>

        <div className="p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Welcome Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                Dashboard
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Welcome back, {user?.name || 'Creator'}! Manage your custom forms, interactive fields, and live responses.
              </p>
            </div>
          </div>

          {/* SaaS Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Card 1: Total Forms */}
            <Card className="border-border/80 shadow-sm bg-white hover:shadow-md transition-all">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Total Forms
                  </p>
                  <p className="text-3xl font-black text-slate-900 mt-1">
                    {loading ? '—' : totalCount}
                  </p>
                  <p className="text-[11px] text-[#4F46E5] font-semibold mt-1">
                    Active creator workspaces
                  </p>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center border border-indigo-100">
                  <FileText className="h-6 w-6" />
                </div>
              </CardContent>
            </Card>

            {/* Card 2: Published */}
            <Card className="border-border/80 shadow-sm bg-white hover:shadow-md transition-all">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Published & Live
                  </p>
                  <p className="text-3xl font-black text-[#16A34A] mt-1">
                    {loading ? '—' : publishedCount}
                  </p>
                  <p className="text-[11px] text-emerald-600 font-semibold mt-1">
                    Accepting respondent submissions
                  </p>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-[#16A34A] flex items-center justify-center border border-emerald-100">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
              </CardContent>
            </Card>

            {/* Card 3: Drafts */}
            <Card className="border-border/80 shadow-sm bg-white hover:shadow-md transition-all sm:col-span-2 lg:col-span-1">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Draft Forms
                  </p>
                  <p className="text-3xl font-black text-amber-600 mt-1">
                    {loading ? '—' : draftCount}
                  </p>
                  <p className="text-[11px] text-amber-600 font-semibold mt-1">
                    In development / testing
                  </p>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                  <Clock className="h-6 w-6" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Forms Management Section */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-slate-900">
                  {statusFilter === 'all'
                    ? 'All Custom Forms'
                    : statusFilter === 'published'
                    ? 'Published Forms'
                    : 'Draft Forms'}{' '}
                  ({filteredForms.length})
                </h2>
              </div>

              {/* Status Tabs */}
              <div className="flex items-center bg-white border border-slate-200/90 rounded-xl p-1 shadow-xs self-start sm:self-auto">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    statusFilter === 'all'
                      ? 'bg-[#4F46E5] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All ({totalCount})
                </button>
                <button
                  onClick={() => setStatusFilter('published')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    statusFilter === 'published'
                      ? 'bg-[#16A34A] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Published ({publishedCount})
                </button>
                <button
                  onClick={() => setStatusFilter('draft')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    statusFilter === 'draft'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Drafts ({draftCount})
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center justify-between shadow-sm">
                <span>{error}</span>
                <Button variant="outline" size="sm" onClick={fetchForms}>
                  Retry
                </Button>
              </div>
            )}

            {/* Loading Skeleton */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="p-6 space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="h-6 w-3/4 bg-slate-200 rounded animate-pulse" />
                      <div className="h-5 w-16 bg-slate-200 rounded-full animate-pulse" />
                    </div>
                    <div className="h-10 bg-slate-100 rounded animate-pulse" />
                    <div className="h-8 bg-slate-100 rounded-lg animate-pulse" />
                  </Card>
                ))}
              </div>
            ) : filteredForms.length === 0 ? (
              /* Empty State */
              <Card className="border-dashed border-2 border-slate-300 bg-white/80 p-12 text-center max-w-lg mx-auto my-6 shadow-sm">
                <div className="w-16 h-16 bg-[#EEF2FF] text-[#4F46E5] rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl shadow-inner">
                  <FolderOpen className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">
                  {searchQuery || statusFilter !== 'all'
                    ? 'No matching forms found'
                    : 'No custom forms created yet'}
                </h3>
                <p className="text-sm text-slate-500 mb-6 max-w-xs mx-auto leading-relaxed">
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
                    <Button size="sm" className="bg-[#4F46E5] text-white">
                      <Plus className="h-4 w-4 mr-1" />
                      Create First Form
                    </Button>
                  </Link>
                )}
              </Card>
            ) : (
              /* Forms Grid */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredForms.map((form) => {
                  const isPublished = form.status === 'published';

                  return (
                    <Card
                      key={form.id}
                      className="flex flex-col justify-between hover:shadow-lg transition-all group overflow-hidden border-slate-200 bg-white rounded-2xl"
                    >
                      <CardHeader className="p-5 pb-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-base font-bold text-slate-900 truncate group-hover:text-[#4F46E5] transition-colors">
                              {form.title}
                            </CardTitle>
                          </div>
                          {isPublished ? (
                            <Badge className="shrink-0 bg-emerald-50 text-[#16A34A] border border-emerald-200 text-[11px] font-semibold py-0.5">
                              <span className="h-1.5 w-1.5 rounded-full bg-[#16A34A] mr-1.5 animate-pulse" />
                              Published
                            </Badge>
                          ) : (
                            <Badge className="shrink-0 bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-semibold py-0.5">
                              Draft
                            </Badge>
                          )}
                        </div>
                        <CardDescription className="line-clamp-2 mt-2 text-xs text-slate-500 min-h-[2.25rem]">
                          {form.description || 'No description provided.'}
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="px-5 py-2">
                        <div className="flex items-center justify-between text-xs text-slate-400 py-2 border-t border-slate-100">
                          <span>Created {new Date(form.createdAt).toLocaleDateString()}</span>
                          {isPublished && form.slug && (
                            <div className="flex items-center space-x-1.5">
                              <button
                                type="button"
                                onClick={() => copyShareLink(form)}
                                className="text-emerald-700 hover:text-emerald-800 font-semibold inline-flex items-center text-xs p-1 rounded hover:bg-emerald-50 transition"
                                title="Copy Public Link"
                              >
                                {copiedId === form.id ? (
                                  <>
                                    <Check className="h-3 w-3 mr-1 text-[#16A34A]" />
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
                                className="text-[#4F46E5] hover:text-[#3730A3] font-semibold inline-flex items-center"
                                title="Open Live Form"
                              >
                                Live ↗
                              </a>
                            </div>
                          )}
                        </div>
                      </CardContent>

                      <CardFooter className="bg-slate-50/70 px-5 py-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-2.5">
                          <Link
                            to={`/forms/${form.id}/responses`}
                            className="text-[#3730A3] hover:text-[#4F46E5] font-bold inline-flex items-center"
                          >
                            <BarChart3 className="h-3.5 w-3.5 mr-1 text-[#4F46E5]" />
                            Responses
                          </Link>
                          <span className="text-slate-300">•</span>
                          <Link
                            to={`/forms/${form.id}/builder`}
                            className="text-slate-700 hover:text-slate-900 font-medium inline-flex items-center"
                          >
                            <Settings2 className="h-3.5 w-3.5 mr-1 text-slate-500" />
                            Fields
                          </Link>
                        </div>

                        <div className="flex items-center space-x-1">
                          <Link
                            to={`/forms/${form.id}/edit`}
                            className="text-slate-500 hover:text-slate-800 font-medium p-1.5 rounded-lg hover:bg-slate-200/50 transition"
                            title="Edit Title & Description"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => setFormToDelete(form)}
                            className="text-slate-400 hover:text-red-600 font-medium p-1.5 rounded-lg hover:bg-red-50 transition"
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
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        <Dialog open={Boolean(formToDelete)} onOpenChange={(open) => !open && setFormToDelete(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-red-600 flex items-center">
                <Trash2 className="h-5 w-5 mr-2" />
                Delete Form
              </DialogTitle>
              <DialogDescription className="mt-2 text-sm leading-relaxed">
                Are you sure you want to delete{' '}
                <strong className="text-slate-900 font-bold">
                  "{formToDelete?.title}"
                </strong>
                ? All configured fields and submitted responses will be permanently removed.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-4 gap-2">
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
