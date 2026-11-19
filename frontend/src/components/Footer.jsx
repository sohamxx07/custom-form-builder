import React from 'react';
import { Link } from 'react-router-dom';
import { Layers, Heart, Code2 } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center space-x-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#4F46E5] to-[#3730A3] text-white shadow-lg shadow-indigo-500/30">
                <Layers className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                FormCraft
              </span>
            </Link>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              The modern, versatile custom form builder for teams, educators, and creators. Build custom input fields, publish with unique links, and collect responses with real-time analytics.
            </p>
            <div className="flex items-center space-x-3 pt-2 text-xs text-slate-400">
              <span className="inline-flex items-center text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
                All Systems Operational
              </span>
              <span>•</span>
              <span>v2.0 SaaS Edition</span>
            </div>
          </div>

          {/* Product Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Product
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/#features" className="hover:text-white transition">
                  Features
                </a>
              </li>
              <li>
                <a href="/#how-it-works" className="hover:text-white transition">
                  How It Works
                </a>
              </li>
              <li>
                <a href="/#benefits" className="hover:text-white transition">
                  Key Benefits
                </a>
              </li>
              <li>
                <a href="/#faq" className="hover:text-white transition">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Platform Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Platform
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/register" className="hover:text-white transition">
                  Get Started Free
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition">
                  Sign In
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-white transition">
                  Creator Dashboard
                </Link>
              </li>
              <li>
                <Link to="/forms/new" className="hover:text-white transition">
                  Create New Form
                </Link>
              </li>
            </ul>
          </div>

          {/* Company & Support */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Support & About
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/#about" className="hover:text-white transition">
                  About FormCraft
                </a>
              </li>
              <li>
                <a href="/#contact" className="hover:text-white transition">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="https://github.com/sohamxx07/custom-form-builder" target="_blank" rel="noopener noreferrer" className="hover:text-white transition inline-flex items-center gap-1">
                  <Code2 className="h-3.5 w-3.5" />
                  GitHub Repository
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>
            &copy; {new Date().getFullYear()} FormCraft SaaS. Built with React, Tailwind CSS & shadcn/ui.
          </p>
          <div className="flex items-center space-x-6">
            <span className="inline-flex items-center gap-1">
              Made with <Heart className="h-3 w-3 text-red-500 fill-red-500 mx-0.5" /> for modern web builders
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
