import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import {
  Layers,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Sliders,
  Share2,
  BarChart3,
  ShieldCheck,
  FileText,
  ChevronDown,
  Mail,
  Check,
} from 'lucide-react';
import Footer from '../components/Footer';

const Landing = () => {
  const [activeFaq, setActiveFaq] = useState(null);

  const toggleFaq = (idx) => {
    setActiveFaq(activeFaq === idx ? null : idx);
  };

  const fieldTypes = [
    { name: 'Short Text', desc: 'Single-line text responses', tag: 'Text' },
    { name: 'Email Address', desc: 'Validated email input', tag: 'Email' },
    { name: 'Number', desc: 'Numeric values with limiters', tag: 'Number' },
    { name: 'Date Picker', desc: 'Calendar date selection with validation', tag: 'Date' },
    { name: 'Long Paragraph', desc: 'Multi-line detailed responses', tag: 'Textarea' },
    { name: 'Dropdown Select', desc: 'Clean single selection menu', tag: 'Select' },
    { name: 'Radio Choices', desc: 'Single option selection', tag: 'Radio' },
    { name: 'Checkboxes', desc: 'Multi-select options list', tag: 'Checkbox' },
    { name: 'File & Image Upload', desc: 'Upload images & files with live preview', tag: 'File' },
  ];

  const faqs = [
    {
      q: 'Do respondents need an account to submit answers?',
      a: 'No! Your published forms generate clean, public web links with unique slugs. Anyone with the link can view and submit answers on any desktop, tablet, or mobile phone without logging in.',
    },
    {
      q: 'What types of fields are supported in FormCraft?',
      a: 'FormCraft supports 9 essential field types: Text, Email, Number, Date Picker, Textarea, Dropdown Select, Radio choices, Checkboxes (multi-select), and File/Image Upload with custom size limits, image thumbnail previews, and extension filters.',
    },
    {
      q: 'Can I test my form before publishing it to the public?',
      a: 'Yes! FormCraft includes a dedicated interactive Form Preview Mode where you can test-drive every field, upload test files, and inspect responsive layouts just like your respondents would.',
    },
    {
      q: 'How are respondent answers organized and viewed?',
      a: 'You get a real-time Responses Dashboard for each form. You can search by respondent ID or answers, sort submissions newest-first, and click to view full response details in an inspection modal.',
    },
    {
      q: 'Is there a limit on how many forms I can create?',
      a: 'FormCraft is completely free for creators. You can create as many draft and published forms as you need.',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 selection:bg-[#4F46E5]/15 selection:text-[#3730A3]">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#1E1B4B] via-[#312E81] to-[#3730A3] text-white pt-16 pb-24 lg:pt-20 lg:pb-32">
        {/* Glow Effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-blue-500/20 blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-indigo-200">
                <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
                <span>Next-Gen Custom Form Studio & SaaS Builder</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15]">
                Build smarter custom forms with{' '}
                <span className="bg-gradient-to-r from-indigo-200 via-white to-purple-200 bg-clip-text text-transparent">
                  interactive clarity
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-indigo-100/90 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
                Empower your team to design versatile forms in minutes. Configure 9+ interactive field types, publish with a unique link, and collect respondent answers in a real-time analytics dashboard.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <Link to="/register" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto bg-white text-[#3730A3] hover:bg-indigo-50 active:bg-indigo-100 font-bold shadow-lg shadow-black/20 text-base h-12 px-7"
                  >
                    Get Started Free
                    <ArrowRight className="w-4 h-4 ml-2 text-[#4F46E5]" />
                  </Button>
                </Link>

                <a href="#features" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto bg-white/10 hover:bg-white/20 active:bg-white/25 text-white border-white/25 backdrop-blur-md font-semibold text-base h-12 px-6"
                  >
                    Explore Features
                  </Button>
                </a>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 border-t border-white/10 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-indigo-200">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Instant public URL slugs</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>8 Interactive field types</span>
                </div>
              </div>
            </div>

            {/* Right Hero Visual Showcase Card (Interactive Mockup) */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none rounded-2xl bg-slate-900/90 border border-white/15 p-5 shadow-2xl backdrop-blur-xl space-y-4">
                {/* Mockup Topbar */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center space-x-2">
                    <div className="h-3 w-3 rounded-full bg-red-500/80" />
                    <div className="h-3 w-3 rounded-full bg-amber-500/80" />
                    <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
                    <span className="text-[11px] font-mono text-slate-400 ml-2">formcraft.io/dashboard</span>
                  </div>
                  <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-[10px] py-0">
                    Live Analytics
                  </Badge>
                </div>

                {/* Hero Mock Metrics */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50">
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 block">Submissions</span>
                    <span className="text-xl font-black text-white">1,248</span>
                    <span className="text-[10px] text-emerald-400 font-semibold block mt-0.5">↑ 24% this week</span>
                  </div>
                  <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50">
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 block">Completion</span>
                    <span className="text-xl font-black text-white">96.4%</span>
                    <span className="text-[10px] text-indigo-400 font-semibold block mt-0.5">Fast & easy</span>
                  </div>
                  <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50">
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 block">Avg Time</span>
                    <span className="text-xl font-black text-white">1m 12s</span>
                    <span className="text-[10px] text-purple-400 font-semibold block mt-0.5">Streamlined</span>
                  </div>
                </div>

                {/* Mock Visual Graph */}
                <div className="bg-slate-800/40 rounded-xl p-3.5 border border-slate-700/50 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span className="font-semibold">Recent Response Stream</span>
                    <span className="text-[10px] text-slate-400">Live 10s ago</span>
                  </div>
                  <div className="flex items-end gap-1.5 h-16 pt-2">
                    {[45, 65, 30, 80, 55, 90, 70, 85, 95, 60, 88, 100].map((h, i) => (
                      <div
                        key={i}
                        style={{ height: `${h}%` }}
                        className={`flex-1 rounded-t transition-all ${
                          i === 11
                            ? 'bg-gradient-to-t from-[#4F46E5] to-[#818CF8]'
                            : 'bg-indigo-600/40 hover:bg-indigo-500/60'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Mock Active Form Card */}
                <div className="bg-gradient-to-r from-indigo-950/80 to-slate-900 rounded-xl p-3 border border-indigo-500/30 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2.5">
                    <div className="h-8 w-8 rounded-lg bg-[#4F46E5] text-white flex items-center justify-center font-bold">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">Client Onboarding Form</p>
                      <p className="text-[10px] text-slate-400">slug: client-onboarding-x92</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/50 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                    Published
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. STATS / SOCIAL PROOF STRIP */}
      <section className="bg-white border-y border-slate-200/80 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="space-y-1">
              <p className="text-3xl font-black text-slate-900">9+</p>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Field Types Supported</p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-black text-[#4F46E5]">100%</p>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Mobile Responsive</p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-black text-slate-900">0 ms</p>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Setup Delay</p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-black text-emerald-600">Enterprise</p>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Input Validation</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CORE FEATURES SECTION */}
      <section id="features" className="py-20 lg:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <Badge className="bg-[#EEF2FF] text-[#3730A3] border border-indigo-100 text-xs px-3 py-1 font-semibold">
            Platform Capabilities
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            Everything you need to collect information seamlessly
          </h2>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            From intuitive field customization to one-click publishing and deep response analysis, FormCraft provides the complete workflow in one cohesive SaaS interface.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Feature 1 */}
          <Card className="border-border hover:shadow-lg transition-all duration-200 group bg-white">
            <CardHeader className="space-y-3 pb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#4F46E5] to-[#3730A3] text-white flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <Sliders className="w-6 h-6" />
              </div>
              <CardTitle className="text-lg font-bold text-slate-900">
                Form Studio & Builder
              </CardTitle>
              <CardDescription className="text-sm text-slate-600 leading-relaxed">
                Design custom forms with a streamlined two-column studio. Add, edit, reorder, and configure field labels, placeholders, and required rules.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Feature 2 */}
          <Card className="border-border hover:shadow-lg transition-all duration-200 group bg-white">
            <CardHeader className="space-y-3 pb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-500/20 group-hover:scale-105 transition-transform">
                <Layers className="w-6 h-6" />
              </div>
              <CardTitle className="text-lg font-bold text-slate-900">
                9+ Field Types
              </CardTitle>
              <CardDescription className="text-sm text-slate-600 leading-relaxed">
                Support for single text, email, number, date picker, textarea, dropdowns, radio lists, multi-select checkboxes, and image/file uploads with live preview.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Feature 3 */}
          <Card className="border-border hover:shadow-lg transition-all duration-200 group bg-white">
            <CardHeader className="space-y-3 pb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <Share2 className="w-6 h-6" />
              </div>
              <CardTitle className="text-lg font-bold text-slate-900">
                One-Click Publishing
              </CardTitle>
              <CardDescription className="text-sm text-slate-600 leading-relaxed">
                Publish draft forms with collision-free, memorable URL slugs. Copy and distribute your public links with a single click.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Feature 4 */}
          <Card className="border-border hover:shadow-lg transition-all duration-200 group bg-white">
            <CardHeader className="space-y-3 pb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <BarChart3 className="w-6 h-6" />
              </div>
              <CardTitle className="text-lg font-bold text-slate-900">
                Responses Dashboard
              </CardTitle>
              <CardDescription className="text-sm text-slate-600 leading-relaxed">
                Review submitted answers in a real-time data table. Search submissions, inspect individual responses, and track engagement trends.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* 9 Field Types Showcase Pills */}
        <div className="mt-14 p-6 sm:p-8 bg-white rounded-2xl border border-border shadow-sm">
          <div className="text-center max-w-xl mx-auto mb-6">
            <h3 className="text-lg font-bold text-slate-900">
              Interactive Field Types for Every Use Case
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Every field type includes custom placeholder support, real-time respondent validation, and image preview
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {fieldTypes.map((item, i) => (
              <div
                key={i}
                className="p-3.5 rounded-xl border border-slate-100 bg-[#EEF2FF]/40 hover:bg-[#EEF2FF] transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-slate-900 text-xs">{item.name}</span>
                  <Badge variant="secondary" className="text-[10px] py-0 px-1.5 font-mono">
                    {item.tag}
                  </Badge>
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS SECTION */}
      <section id="how-it-works" className="py-20 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 bg-indigo-950/60 border border-indigo-800/60 px-3 py-1 rounded-full">
              Simple 4-Step Process
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              From idea to live submissions in minutes
            </h2>
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
              FormCraft removes the friction between conceptualizing a questionnaire and receiving clean data.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Step 1 */}
            <div className="relative space-y-3 bg-slate-800/60 p-6 rounded-2xl border border-slate-700/60">
              <div className="w-10 h-10 rounded-xl bg-[#4F46E5] text-white flex items-center justify-center font-bold text-lg">
                1
              </div>
              <h3 className="text-lg font-bold text-white">Create Form</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Provide a descriptive title and instructions for your respondents. All forms start safely in draft mode.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative space-y-3 bg-slate-800/60 p-6 rounded-2xl border border-slate-700/60">
              <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-lg">
                2
              </div>
              <h3 className="text-lg font-bold text-white">Add Custom Fields</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Choose text, dropdowns, checkboxes, or file uploads. Mark required inputs and set options with ease.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative space-y-3 bg-slate-800/60 p-6 rounded-2xl border border-slate-700/60">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg">
                3
              </div>
              <h3 className="text-lg font-bold text-white">Test & Publish</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Test inputs in our dedicated Interactive Preview Mode. Then click Publish to receive your unique public slug link.
              </p>
            </div>

            {/* Step 4 */}
            <div className="relative space-y-3 bg-slate-800/60 p-6 rounded-2xl border border-slate-700/60">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg">
                4
              </div>
              <h3 className="text-lg font-bold text-white">Analyze Responses</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Watch answers stream into your real-time responses dashboard with full search and inspection tools.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. BENEFITS SECTION */}
      <section id="benefits" className="py-20 lg:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <Badge className="bg-[#EEF2FF] text-[#3730A3] border border-indigo-100 text-xs px-3 py-1 font-semibold">
              Why Creators Choose FormCraft
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Designed for speed, built for complete reliability
            </h2>
            <p className="text-base text-slate-600 leading-relaxed">
              Whether you need a quick feedback survey, client onboarding questionnaire, or file submission portal, FormCraft guarantees a seamless respondent journey.
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex items-start space-x-3.5">
                <div className="h-6 w-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="h-3.5 w-3.5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Zero Technical Barrier</h4>
                  <p className="text-xs text-slate-500 mt-0.5">No coding or complicated database setup required. Build and launch right in the browser.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3.5">
                <div className="h-6 w-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="h-3.5 w-3.5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Automated Validation</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Required fields, email syntax, numeric inputs, and file upload parameters are validated on both client and backend.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3.5">
                <div className="h-6 w-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="h-3.5 w-3.5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Responsive Everywhere</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Forms render with mobile-first perfection on iOS, Android, tablets, laptops, and ultra-wide screens.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3.5">
                <div className="h-6 w-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="h-3.5 w-3.5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Strict Creator Isolation</h4>
                  <p className="text-xs text-slate-500 mt-0.5">JWT token authentication ensures form creators can only access and manage their own forms and private responses.</p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Link to="/register">
                <Button size="lg" className="font-bold">
                  Create Your Free Account
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Visual Showcase Card */}
          <div className="bg-gradient-to-br from-[#EEF2FF] to-white p-8 sm:p-10 rounded-3xl border border-indigo-100 shadow-xl space-y-6">
            <div className="flex items-center space-x-3 text-indigo-700">
              <div className="h-10 w-10 rounded-xl bg-[#4F46E5] text-white flex items-center justify-center">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Production-Grade Security</h3>
                <p className="text-xs text-slate-500">Built with modern Node.js, Sequelize & React</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-100">
                <span>Field Security Checks</span>
                <span className="text-emerald-600 font-semibold">Active & Enforced</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-700">File Type Sanitization</span>
                  <span className="font-mono text-slate-500">Allowed Exts Only</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-700">Payload Size Protection</span>
                  <span className="font-mono text-slate-500">Configurable (1 - 50 MB)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-700">Database Schema</span>
                  <span className="font-mono text-slate-500">SQLite + JSON Answers</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-indigo-50/70 rounded-xl border border-indigo-100/80 text-xs text-indigo-900 leading-relaxed">
              <strong>Creator Tip:</strong> Use the live preview mode before publishing your form to ensure your respondent flow is clear and intuitive!
            </div>
          </div>
        </div>
      </section>

      {/* 6. ABOUT SECTION */}
      <section id="about" className="py-20 bg-white border-y border-slate-200/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <Badge className="bg-[#EEF2FF] text-[#3730A3] border border-indigo-100 text-xs px-3 py-1 font-semibold">
            About FormCraft
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Crafting the future of open, customizable form software
          </h2>
          <p className="text-base sm:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
            FormCraft was engineered to bridge the gap between clunky, slow spreadsheet forms and expensive proprietary survey tools. We believe creators should have complete freedom to define fields, customize input parameters, and review answers with maximum simplicity.
          </p>
          <div className="pt-4 flex flex-wrap justify-center gap-4">
            <div className="px-5 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700">
              Modern JavaScript Stack
            </div>
            <div className="px-5 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700">
              Tailwind CSS & shadcn/ui
            </div>
            <div className="px-5 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700">
              Express & Sequelize REST APIs
            </div>
          </div>
        </div>
      </section>

      {/* 7. FAQ ACCORDION SECTION */}
      <section id="faq" className="py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-12">
          <Badge className="bg-[#EEF2FF] text-[#3730A3] border border-indigo-100 text-xs px-3 py-1 font-semibold">
            Common Inquiries
          </Badge>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-slate-600">
            Have questions about how FormCraft works? We have answers.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <Card
                key={idx}
                className="border-border overflow-hidden transition-all duration-150 cursor-pointer"
                onClick={() => toggleFaq(idx)}
              >
                <div className="p-5 flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 pr-4">
                    {faq.q}
                  </h4>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-500 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-[#4F46E5]' : ''
                    }`}
                  />
                </div>
                {isOpen && (
                  <div className="px-5 pb-5 pt-0 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 mt-1 pt-3 animate-in fade-in-50 duration-150">
                    {faq.a}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </section>

      {/* 8. CONTACT SECTION */}
      <section id="contact" className="py-16 bg-[#EEF2FF]/60 border-t border-indigo-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <Badge className="bg-white text-[#3730A3] border border-indigo-200 text-xs px-3 py-1 font-semibold">
            Get In Touch
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Ready to integrate or have feedback?
          </h2>
          <p className="text-sm text-slate-600 max-w-xl mx-auto">
            Our platform is actively maintained and expanding. Contact our development team or explore the open repository on GitHub.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <a
              href="mailto:support@formcraft.example"
              className="inline-flex items-center text-xs font-semibold bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 px-4 py-2.5 rounded-lg shadow-sm transition"
            >
              <Mail className="w-4 h-4 mr-2 text-[#4F46E5]" />
              support@formcraft.example
            </a>
            <a
              href="https://github.com/sohamxx07/custom-form-builder"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-lg shadow-sm transition"
            >
              View on GitHub
            </a>
          </div>
        </div>
      </section>

      {/* 9. FINAL CTA BANNER */}
      <section className="bg-gradient-to-r from-[#1E1B4B] via-[#3730A3] to-[#4F46E5] text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Start building your custom forms today
          </h2>
          <p className="text-sm sm:text-base text-indigo-100 max-w-xl mx-auto leading-relaxed">
            Free forever for form creators. Collect responses, organize questions, and view submissions with effortless ease.
          </p>
          <div className="pt-2">
            <Link to="/register">
              <Button
                size="lg"
                className="bg-white text-[#3730A3] hover:bg-indigo-50 font-bold h-12 px-8 shadow-lg shadow-black/25 text-base"
              >
                Create Your Form Now - It's Free
                <ArrowRight className="w-4 h-4 ml-2 text-[#4F46E5]" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 10. FOOTER */}
      <Footer />
    </div>
  );
};

export default Landing;
