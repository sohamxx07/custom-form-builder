import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
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
        return false;
      });
    });
  }, [responses, searchTerm]);

  // Helper to format an answer for display
  const renderAnswerValue = (field, answer) => {
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
      const fileName = typeof answer === 'object' && answer !== null ? answer.name : String(answer);
      return (
        <span className="inline-flex items-center text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-mono truncate max-w-[180px]">
          <FileText className="w-3 h-3 mr-1 shrink-0" />
          <span className="truncate">{fileName}</span>
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
          <Button asChild variant="outline" size="sm">
            <Link to={`/forms/${formId}/builder`}>
              <Sliders className="w-3.5 h-3.5 mr-1.5" />
              Manage Fields
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to={`/forms/${formId}/preview`}>
              <Eye className="w-3.5 h-3.5 mr-1.5" />
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
        <Card className="shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Total Submissions
              </p>
              <h3 className="text-2xl font-bold tracking-tight text-foreground mt-1">
                {totalCount}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Inbox className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Form Fields
              </p>
              <h3 className="text-2xl font-bold tracking-tight text-foreground mt-1">
                {fields.length}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Publication Status
              </p>
              <div className="mt-1.5">
                {form?.status === 'published' ? (
                  <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700 text-xs font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5" />
                    Published
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700 text-xs font-semibold">
                    Draft
                  </Badge>
                )}
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <FileCheck2 className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Latest Response
              </p>
              <p className="text-sm font-semibold text-foreground mt-1 truncate">
                {latestSubmission ? new Date(latestSubmission).toLocaleDateString() : 'None yet'}
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
              <CalendarDays className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Responses Table Card or Empty State */}
      {totalCount === 0 ? (
        <Card className="border-dashed shadow-sm text-center py-12 px-6">
          <CardContent className="max-w-md mx-auto space-y-4">
            <div className="w-14 h-14 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto">
              <Inbox className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">No Responses Yet</h3>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
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
                <Button asChild variant="outline" size="sm">
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
        <Card className="shadow-sm overflow-hidden">
          {/* Card Header with Search & Filter */}
          <CardHeader className="p-4 sm:p-5 border-b border-border bg-slate-50/50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base font-semibold">
                  Submitted Answers ({filteredResponses.length} of {totalCount})
                </CardTitle>
                <CardDescription className="text-xs">
                  Showing submissions ordered newest first
                </CardDescription>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search by ID or answer..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 h-9 text-xs"
                  />
                </div>

                {form?.status === 'published' && form?.slug && (
                  <Button
                    onClick={copyPublicLink}
                    variant="outline"
                    size="sm"
                    className="shrink-0 h-9"
                    title="Copy Public Link"
                  >
                    {copiedLink ? (
                      <Check className="w-4 h-4 text-emerald-600" />
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
                  <TableHead className="w-20 text-xs font-semibold"># ID</TableHead>
                  <TableHead className="w-44 text-xs font-semibold">Submitted At</TableHead>
                  {fields.slice(0, 3).map((f) => (
                    <TableHead key={f.id} className="text-xs font-semibold max-w-xs truncate">
                      {f.label}
                    </TableHead>
                  ))}
                  <TableHead className="text-right text-xs font-semibold w-28">Actions</TableHead>
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
                        <TableCell className="font-mono text-xs font-semibold text-foreground">
                          #{resp.id}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(resp.createdAt).toLocaleString()}
                        </TableCell>

                        {/* First 3 fields preview */}
                        {fields.slice(0, 3).map((f) => {
                          const val =
                            answers[f.id] !== undefined ? answers[f.id] : answers[String(f.id)];
                          return (
                            <TableCell key={f.id} className="max-w-xs truncate py-3">
                              {renderAnswerValue(f, val)}
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
                            className="text-primary hover:text-primary hover:bg-primary/10 h-8 px-2.5 text-xs font-medium"
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
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader className="border-b border-border pb-4">
              <div className="flex items-center gap-2">
                <DialogTitle className="text-lg font-bold">
                  Response #{selectedResponse.id}
                </DialogTitle>
                <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary text-xs">
                  Completed
                </Badge>
              </div>
              <DialogDescription className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
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

                return (
                  <div
                    key={field.id}
                    className="p-3.5 rounded-lg border border-border bg-slate-50/50 space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="font-mono">Field {idx + 1}</span>
                      <Badge variant="secondary" className="text-[10px] uppercase font-mono px-1.5 py-0">
                        {field.type}
                      </Badge>
                    </div>

                    <h4 className="text-sm font-semibold text-foreground">
                      {field.label}
                    </h4>

                    <div className="bg-white rounded-md p-3 border border-border">
                      {renderAnswerValue(field, answer)}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-border pt-4 flex items-center justify-between">
              <span className="text-xs text-muted-foreground truncate max-w-xs">
                Form: <strong className="text-foreground">{form?.title}</strong>
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
  );
};

export default Responses;
