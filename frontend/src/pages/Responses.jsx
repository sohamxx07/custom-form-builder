import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Inbox,
  Layers,
  Search,
  Copy,
  Check,
  ExternalLink,
  Eye,
  Sliders,
  Calendar,
  ArrowLeft,
  FileText,
  AlertCircle,
  Loader2,
  CalendarDays,
  FileCheck2,
  Share2,
  Image as ImageIcon,
  ImageOff,
} from 'lucide-react';

const Responses = () => {
  const { formId } = useParams();

  const [form, setForm] = useState(null);
  const [fields, setFields] = useState([]);
  const [responses, setResponses] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');

  // Selected response for viewing in modal
  const [selectedResponse, setSelectedResponse] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [imageErrors, setImageErrors] = useState({});

  const fetchResponses = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await api.get(`/forms/${formId}/responses`);
      const data = res.data.data;
      setForm(data.form);
      setFields(data.form?.fields || []);
      setResponses(data.responses || []);
      setTotalCount(data.totalCount || 0);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to load responses for this form. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (formId) {
      fetchResponses();
    }
  }, [formId]);

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

  // Helper to extract file metadata safely
  const getFileMeta = (val) => {
    if (!val) return null;
    if (typeof val === 'object') {
      const fileName = val.fileName || val.originalName || val.name || 'File';
      const ext = String(fileName).split('.').pop()?.toLowerCase();
      const isImage = Boolean(
        val.isImage ||
        val.mimetype?.toLowerCase().startsWith('image/') ||
        ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'].includes(ext)
      );
      const apiBase = import.meta.env.VITE_BACKEND_URL || '';
      const rawUrl = val.url || val.path || '';
      const url = rawUrl
        ? rawUrl.startsWith('http')
          ? rawUrl
          : `${apiBase}${rawUrl.startsWith('/') ? rawUrl : '/' + rawUrl}`
        : '';
      return {
        fileName,
        ext,
        isImage,
        url,
        size: val.size,
      };
    }

    if (typeof val === 'string') {
      const apiBase = import.meta.env.VITE_BACKEND_URL || '';
      const trimmed = val.trim();
      const ext = trimmed.split('.').pop()?.toLowerCase();
      const isImage = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'].includes(ext);
      let url = '';
      if (trimmed.startsWith('http')) {
        url = trimmed;
      } else if (trimmed.startsWith('/uploads/')) {
        url = `${apiBase}${trimmed}`;
      } else if (isImage) {
        url = `${apiBase}/uploads/${trimmed}`;
      }
      return {
        fileName: trimmed.split('/').pop(),
        ext,
        isImage,
        url,
        size: null,
      };
    }

    return null;
  };

  // Filter responses by search term (matching ID or any answer content)
  const filteredResponses = useMemo(() => {
    if (!searchTerm.trim()) return responses;
    const term = searchTerm.toLowerCase();

    return responses.filter((resp) => {
      if (String(resp.id).includes(term)) return true;
      const answers = resp.answers || {};
      return Object.values(answers).some((val) => {
        if (typeof val === 'string') return val.toLowerCase().includes(term);
        if (Array.isArray(val)) return val.some((v) => String(v).toLowerCase().includes(term));
        if (typeof val === 'number') return String(val).includes(term);
        if (typeof val === 'object' && val !== null) {
          return (val.fileName || val.originalName || '').toLowerCase().includes(term);
        }
        return false;
      });
    });
  }, [responses, searchTerm]);

  // Helper to format an answer for display in the table
  const renderTableAnswerValue = (field, answer) => {
    if (answer === undefined || answer === null || answer === '') {
      return <span className="text-muted-foreground/60 italic text-xs">— (No answer)</span>;
    }

    if (field.type === 'checkbox') {
      const items = Array.isArray(answer) ? answer : [answer];
      if (items.length === 0) {
        return <span className="text-muted-foreground/60 italic text-xs">— (No answer)</span>;
      }
      return (
        <div className="flex flex-wrap gap-1">
          {items.map((item, idx) => (
            <Badge
              key={idx}
              variant="secondary"
              className="text-[11px] font-normal px-2 py-0"
            >
              {String(item)}
            </Badge>
          ))}
        </div>
      );
    }

    if (field.type === 'date') {
      const dateObj = new Date(answer);
      const formatted = !isNaN(dateObj.getTime())
        ? dateObj.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
        : String(answer);
      return (
        <span className="inline-flex items-center text-xs text-[#3730A3] bg-[#EEF2FF] border border-indigo-200 px-2 py-0.5 rounded font-mono">
          <Calendar className="w-3 h-3 mr-1 text-[#4F46E5] shrink-0" />
          <span>{formatted}</span>
        </span>
      );
    }

    if (field.type === 'select' || field.type === 'radio') {
      return (
        <Badge
          variant="outline"
          className="text-[11px] font-normal border-primary/20 bg-primary/5 text-primary px-2 py-0"
        >
          {String(answer)}
        </Badge>
      );
    }

    if (field.type === 'file') {
      const fileMeta = getFileMeta(answer);
      if (!fileMeta) {
        return <span className="text-muted-foreground/60 italic text-xs">— (No answer)</span>;
      }

      if (fileMeta.isImage && fileMeta.url) {
        return (
          <div className="flex items-center space-x-2 py-0.5">
            <img
              src={fileMeta.url}
              alt={fileMeta.fileName}
              className="w-8 h-8 rounded-lg object-cover border border-slate-200 bg-white shrink-0 shadow-xs"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <div className="min-w-0">
              <span className="text-xs font-semibold text-slate-800 truncate block max-w-[130px]">
                {fileMeta.fileName}
              </span>
              <span className="text-[10px] text-indigo-600 font-medium block leading-none">
                Image
              </span>
            </div>
          </div>
        );
      }

      return (
        <span className="inline-flex items-center text-xs text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded font-mono truncate max-w-[180px]">
          <FileText className="w-3 h-3 mr-1 text-slate-500 shrink-0" />
          <span className="truncate">{fileMeta.fileName}</span>
        </span>
      );
    }

    return (
      <span className="text-foreground text-xs sm:text-sm whitespace-pre-line truncate max-w-xs block">
        {String(answer)}
      </span>
    );
  };

  // 1. Loading State
  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col justify-center items-center px-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
        <p className="text-sm font-medium text-muted-foreground">Loading responses...</p>
      </div>
    );
  }

  // 2. Error State
  if (error) {
    return (
      <div className="max-w-xl mx-auto my-12 px-4">
        <Card className="border-destructive/30 text-center p-6">
          <CardHeader>
            <div className="w-12 h-12 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-2">
              <AlertCircle className="w-6 h-6" />
            </div>
            <CardTitle className="text-lg">Error Loading Responses</CardTitle>
            <CardDescription className="text-destructive font-medium">
              {error}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center gap-3">
            <Button onClick={fetchResponses} size="sm">
              Retry
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link to="/dashboard">Back to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const latestSubmission = responses.length > 0 ? responses[0].createdAt : null;

  return (
    <div className="min-h-screen bg-[#EEF2FF]/40 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Top Breadcrumb & Action Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Link
              to="/dashboard"
              className="hover:text-foreground flex items-center gap-1 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Dashboard
            </Link>
            <span>/</span>
            <span className="text-foreground font-medium truncate max-w-xs">{form?.title}</span>
            <span>/</span>
            <span className="text-foreground font-semibold">Responses</span>
          </div>

          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm" className="bg-white">
              <Link to={`/forms/${formId}/builder`}>
                <Sliders className="w-3.5 h-3.5 mr-1.5" />
                Manage Fields
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="bg-white">
              <Link to={`/forms/${formId}/preview`}>
                <Eye className="w-3.5 h-3.5 mr-1.5 text-[#4F46E5]" />
                Preview
              </Link>
            </Button>
            {form?.status === 'published' && form?.slug && (
              <Button asChild size="sm">
                <a
                  href={`/public/forms/${form.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                  Live Form
                </a>
              </Button>
            )}
          </div>
        </div>

        {/* Overview Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="shadow-sm bg-white border-slate-200">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Total Submissions
                </p>
                <h3 className="text-2xl font-black tracking-tight text-slate-900 mt-1">
                  {totalCount}
                </h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center border border-indigo-100">
                <Inbox className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm bg-white border-slate-200">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Configured Fields
                </p>
                <h3 className="text-2xl font-black tracking-tight text-slate-900 mt-1">
                  {fields.length}
                </h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
                <Layers className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm bg-white border-slate-200">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Publication Status
                </p>
                <div className="mt-1.5">
                  {form?.status === 'published' ? (
                    <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-[#16A34A] text-xs font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] mr-1.5 animate-pulse" />
                      Published
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700 text-xs font-semibold">
                      Draft
                    </Badge>
                  )}
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#16A34A] flex items-center justify-center border border-emerald-100">
                <FileCheck2 className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm bg-white border-slate-200">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Latest Response
                </p>
                <p className="text-sm font-semibold text-slate-800 mt-1 truncate">
                  {latestSubmission ? new Date(latestSubmission).toLocaleDateString() : 'None yet'}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
                <CalendarDays className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Responses Table Card or Empty State */}
        {totalCount === 0 ? (
          <Card className="border-dashed shadow-sm text-center py-12 px-6 bg-white">
            <CardContent className="max-w-md mx-auto space-y-4">
              <div className="w-14 h-14 bg-[#EEF2FF] text-[#4F46E5] rounded-full flex items-center justify-center mx-auto">
                <Inbox className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">No Responses Yet</h3>
                <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                  This form has not received any submissions yet. Once respondents submit answers through your public link, their data will appear here in real time.
                </p>
              </div>

              {form?.status === 'published' && form?.slug ? (
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
                  <Button onClick={copyPublicLink} size="sm">
                    {copiedLink ? (
                      <>
                        <Check className="w-4 h-4 mr-1.5 text-emerald-400" />
                        Link Copied!
                      </>
                    ) : (
                      <>
                        <Share2 className="w-4 h-4 mr-1.5" />
                        Copy Public Link
                      </>
                    )}
                  </Button>
                  <Button asChild variant="outline" size="sm" className="bg-white">
                    <a
                      href={`/public/forms/${form.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                      Open Live Form
                    </a>
                  </Button>
                </div>
              ) : (
                <Button asChild size="sm">
                  <Link to={`/forms/${formId}/builder`}>
                    Go to Form Builder to Publish
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-sm overflow-hidden bg-white border-slate-200">
            {/* Card Header with Search & Filter */}
            <CardHeader className="p-4 sm:p-5 border-b border-border bg-slate-50/50">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-base font-bold text-slate-900">
                    Submitted Answers ({filteredResponses.length} of {totalCount})
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Showing submissions ordered newest first
                  </CardDescription>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative w-full sm:w-64">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <Input
                      type="search"
                      placeholder="Search submissions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 h-9 text-xs rounded-xl bg-white"
                    />
                  </div>

                  {form?.status === 'published' && form?.slug && (
                    <Button
                      onClick={copyPublicLink}
                      variant="outline"
                      size="sm"
                      className="shrink-0 h-9 bg-white"
                      title="Copy Public Link"
                    >
                      {copiedLink ? (
                        <Check className="w-4 h-4 text-[#16A34A]" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>

            {/* Responses Table */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/80">
                  <TableRow>
                    <TableHead className="w-20 text-xs font-semibold text-slate-600"># ID</TableHead>
                    <TableHead className="w-44 text-xs font-semibold text-slate-600">Submitted At</TableHead>
                    {fields.slice(0, 3).map((f) => (
                      <TableHead key={f.id} className="text-xs font-semibold text-slate-600 max-w-xs truncate">
                        {f.label}
                      </TableHead>
                    ))}
                    <TableHead className="text-right text-xs font-semibold text-slate-600 w-28">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredResponses.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={fields.slice(0, 3).length + 3}
                        className="text-center py-8 text-muted-foreground text-sm"
                      >
                        No submissions match your search "{searchTerm}".
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredResponses.map((resp) => {
                      const answers = resp.answers || {};

                      return (
                        <TableRow
                          key={resp.id}
                          onClick={() => setSelectedResponse(resp)}
                          className="cursor-pointer hover:bg-slate-50/80 transition"
                        >
                          <TableCell className="font-mono text-xs font-semibold text-slate-900">
                            #{resp.id}
                          </TableCell>
                          <TableCell className="text-xs text-slate-500 whitespace-nowrap">
                            {new Date(resp.createdAt).toLocaleString()}
                          </TableCell>

                          {/* First 3 fields preview */}
                          {fields.slice(0, 3).map((f) => {
                            const val =
                              answers[f.id] !== undefined ? answers[f.id] : answers[String(f.id)];
                            return (
                              <TableCell key={f.id} className="max-w-xs truncate py-3">
                                {renderTableAnswerValue(f, val)}
                              </TableCell>
                            );
                          })}

                          <TableCell className="text-right py-3">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedResponse(resp);
                              }}
                              className="text-[#4F46E5] hover:text-[#3730A3] hover:bg-[#EEF2FF] h-8 px-2.5 text-xs font-medium"
                            >
                              <Eye className="w-3.5 h-3.5 mr-1" />
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        )}

        {/* Individual Response Inspection Dialog */}
        <Dialog open={!!selectedResponse} onOpenChange={(open) => !open && setSelectedResponse(null)}>
          {selectedResponse && (
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-white rounded-2xl">
              <DialogHeader className="border-b border-border pb-4">
                <div className="flex items-center gap-2">
                  <DialogTitle className="text-lg font-bold text-slate-900">
                    Response #{selectedResponse.id}
                  </DialogTitle>
                  <Badge variant="outline" className="border-indigo-200 bg-[#EEF2FF] text-[#3730A3] text-xs font-semibold">
                    Completed Submission
                  </Badge>
                </div>
                <DialogDescription className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Submitted on {new Date(selectedResponse.createdAt).toLocaleString()}
                </DialogDescription>
              </DialogHeader>

              {/* Answer List */}
              <div className="space-y-4 py-4">
                {fields.map((field, idx) => {
                  const answer =
                    selectedResponse.answers?.[field.id] !== undefined
                      ? selectedResponse.answers[field.id]
                      : selectedResponse.answers?.[String(field.id)];

                  const isAnswerEmpty =
                    answer === undefined ||
                    answer === null ||
                    answer === '' ||
                    (Array.isArray(answer) && answer.length === 0);

                  return (
                    <div
                      key={field.id}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2.5"
                    >
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span className="font-mono font-medium">Field {idx + 1}</span>
                        <Badge variant="secondary" className="text-[10px] uppercase font-mono px-2 py-0">
                          {field.type}
                        </Badge>
                      </div>

                      <h4 className="text-sm font-bold text-slate-900">
                        {field.label}
                      </h4>

                      <div className="bg-white rounded-xl p-3.5 border border-slate-200">
                        {isAnswerEmpty ? (
                          <span className="text-muted-foreground/60 italic text-xs">— (No answer provided)</span>
                        ) : field.type === 'file' ? (
                          (() => {
                            const fileMeta = getFileMeta(answer);
                            if (!fileMeta) {
                              return <span className="text-muted-foreground/60 italic text-xs">— (No answer provided)</span>;
                            }

                            if (fileMeta.isImage) {
                              const hasError = imageErrors[field.id];
                              return (
                                <div className="space-y-3">
                                  {/* Full Image Preview Box */}
                                  <div className="relative group rounded-xl border border-slate-200 bg-slate-50 p-2 overflow-hidden flex flex-col items-center justify-center min-h-[160px]">
                                    {hasError || !fileMeta.url ? (
                                      <div className="flex flex-col items-center justify-center py-8 text-slate-400 text-xs">
                                        <ImageOff className="w-8 h-8 mb-2 text-slate-400" />
                                        <p className="font-semibold text-slate-600">Image Preview Unavailable</p>
                                        <p className="text-[11px] text-slate-400 mt-0.5">{fileMeta.fileName}</p>
                                      </div>
                                    ) : (
                                      <div className="relative group/img flex justify-center w-full">
                                        <img
                                          src={fileMeta.url}
                                          alt={fileMeta.fileName}
                                          className="max-h-72 w-auto object-contain rounded-lg border border-slate-200/80 bg-white shadow-xs"
                                          onError={() =>
                                            setImageErrors((prev) => ({ ...prev, [field.id]: true }))
                                          }
                                        />
                                        <a
                                          href={fileMeta.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover/img:opacity-100 transition-opacity rounded-lg flex items-center justify-center text-white text-xs font-semibold gap-1.5 backdrop-blur-[2px]"
                                        >
                                          <ExternalLink className="w-4 h-4" />
                                          <span>Open Full Size Image</span>
                                        </a>
                                      </div>
                                    )}
                                  </div>

                                  {/* Meta & External Link Bar */}
                                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-1">
                                    <div className="flex items-center space-x-1.5 truncate">
                                      <ImageIcon className="w-3.5 h-3.5 text-[#4F46E5] shrink-0" />
                                      <span className="font-mono text-slate-800 font-medium truncate">
                                        {fileMeta.fileName}
                                      </span>
                                      {fileMeta.size && (
                                        <span className="text-slate-400 text-[11px]">
                                          ({(fileMeta.size / 1024).toFixed(1)} KB)
                                        </span>
                                      )}
                                    </div>
                                    {fileMeta.url && (
                                      <a
                                        href={fileMeta.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center font-bold text-xs text-[#4F46E5] hover:text-[#3730A3] hover:underline shrink-0"
                                      >
                                        <ExternalLink className="w-3.5 h-3.5 mr-1" />
                                        View Full Image ↗
                                      </a>
                                    )}
                                  </div>
                                </div>
                              );
                            }

                            // Non-image file attachment
                            return (
                              <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                                <div className="flex items-center space-x-2.5 truncate">
                                  <FileText className="w-5 h-5 text-slate-500 shrink-0" />
                                  <div className="truncate">
                                    <p className="font-semibold text-slate-800 truncate">{fileMeta.fileName}</p>
                                    {fileMeta.size && (
                                      <p className="text-[11px] text-slate-400 mt-0.5">
                                        {(fileMeta.size / 1024).toFixed(1)} KB
                                      </p>
                                    )}
                                  </div>
                                </div>
                                {fileMeta.url && (
                                  <a
                                    href={fileMeta.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center font-bold text-xs text-[#4F46E5] hover:text-[#3730A3] hover:underline shrink-0 ml-3"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5 mr-1" />
                                    Open Document
                                  </a>
                                )}
                              </div>
                            );
                          })()
                        ) : field.type === 'date' ? (
                          (() => {
                            const dateObj = new Date(answer);
                            const formattedDate = !isNaN(dateObj.getTime())
                              ? dateObj.toLocaleDateString(undefined, {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                })
                              : String(answer);

                            return (
                              <div className="flex items-center space-x-2 text-xs font-semibold text-indigo-950 bg-[#EEF2FF] border border-indigo-200/80 p-2.5 rounded-lg">
                                <Calendar className="w-4 h-4 text-[#4F46E5] shrink-0" />
                                <span>{formattedDate}</span>
                                <span className="text-slate-400 font-mono text-[11px] ml-2">
                                  ({String(answer)})
                                </span>
                              </div>
                            );
                          })()
                        ) : field.type === 'checkbox' ? (
                          <div className="flex flex-wrap gap-1.5">
                            {(Array.isArray(answer) ? answer : [answer]).map((item, i) => (
                              <Badge key={i} variant="secondary" className="text-xs px-2.5 py-0.5">
                                {String(item)}
                              </Badge>
                            ))}
                          </div>
                        ) : field.type === 'select' || field.type === 'radio' ? (
                          <Badge variant="outline" className="border-indigo-200 bg-[#EEF2FF] text-[#3730A3] text-xs font-semibold px-2.5 py-0.5">
                            {String(answer)}
                          </Badge>
                        ) : (
                          <span className="text-slate-800 text-sm whitespace-pre-line leading-relaxed block">
                            {String(answer)}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-border pt-4 flex items-center justify-between">
                <span className="text-xs text-slate-500 truncate max-w-xs">
                  Form: <strong className="text-slate-900">{form?.title}</strong>
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedResponse(null)}
                >
                  Close
                </Button>
              </div>
            </DialogContent>
          )}
        </Dialog>
      </div>
    </div>
  );
};

export default Responses;