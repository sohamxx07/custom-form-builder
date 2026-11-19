import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  LayoutDashboard,
  Plus,
  LogOut,
  Layers,
  Menu,
  X,
  ArrowRight,
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileMenuOpen(false);
  };

  // Check if respondent is viewing a live form
  const isPublicForm = location.pathname.startsWith('/public/forms/');

  // Helper to test if a nav link is currently active
  const isLinkActive = (path, hash = '') => {
    if (hash) {
      return location.pathname === '/' && location.hash === hash;
    }
    if (path === '/') {
      return location.pathname === '/' && !location.hash;
    }
    return location.pathname === path;
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-white/95 backdrop-blur-md shadow-[0_1px_3px_0_rgba(15,23,42,0.05)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Brand Logo & Name */}
          <div className="flex items-center space-x-8">
            <Link
              to={isAuthenticated ? '/dashboard' : '/'}
              className="flex items-center space-x-2.5 transition-all hover:opacity-90 group"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#4F46E5] to-[#3730A3] text-white shadow-md shadow-indigo-500/25 group-hover:scale-105 transition-transform">
                <Layers className="h-5 w-5" />
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold tracking-tight text-slate-900">
                  FormCraft
                </span>
                <span className="hidden sm:inline-flex text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-[#EEF2FF] text-[#3730A3] border border-indigo-100">
                  SaaS
                </span>
              </div>
            </Link>

            {/* Desktop Navigation for Unauthenticated Visitors */}
            {!isAuthenticated && !isPublicForm && (
              <nav className="hidden md:flex items-center space-x-1">
                <Link
                  to="/"
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    isLinkActive('/')
                      ? 'bg-[#EEF2FF] text-[#3730A3] font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  Home
                </Link>
                <a
                  href="/#features"
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    isLinkActive('/', '#features')
                      ? 'bg-[#EEF2FF] text-[#3730A3] font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  Features
                </a>
                <a
                  href="/#how-it-works"
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    isLinkActive('/', '#how-it-works')
                      ? 'bg-[#EEF2FF] text-[#3730A3] font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  How It Works
                </a>
                <a
                  href="/#about"
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    isLinkActive('/', '#about')
                      ? 'bg-[#EEF2FF] text-[#3730A3] font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  About
                </a>
                <a
                  href="/#contact"
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    isLinkActive('/', '#contact')
                      ? 'bg-[#EEF2FF] text-[#3730A3] font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  Contact
                </a>
              </nav>
            )}

            {/* Desktop Navigation for Authenticated Creators */}
            {isAuthenticated && !isPublicForm && (
              <nav className="hidden md:flex items-center space-x-1">
                <Link
                  to="/dashboard"
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                    location.pathname === '/dashboard'
                      ? 'bg-[#EEF2FF] text-[#3730A3] font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
                <Link
                  to="/forms/new"
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                    location.pathname === '/forms/new'
                      ? 'bg-[#EEF2FF] text-[#3730A3] font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <Plus className="h-4 w-4" />
                  New Form
                </Link>
              </nav>
            )}
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                <Link to="/forms/new" className="hidden sm:inline-flex">
                  <Button size="sm" className="font-semibold shadow-sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Create Form
                  </Button>
                </Link>

                <div className="hidden sm:block h-5 w-px bg-slate-200 mx-1" />

                {/* User Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <button className="flex items-center space-x-2.5 rounded-full p-1 pl-2 text-xs font-medium text-slate-700 hover:bg-[#EEF2FF] transition-colors focus:outline-none focus:ring-2 focus:ring-[#4F46E5]">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#4F46E5] to-[#3730A3] text-white font-bold text-xs shadow-sm">
                        {user?.name ? user.name[0].toUpperCase() : 'U'}
                      </div>
                      <span className="hidden md:inline font-semibold text-slate-800">
                        {user?.name}
                      </span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="right" className="w-56 p-1.5 shadow-lg border-border">
                    <div className="px-3 py-2 bg-slate-50/70 rounded-md mb-1">
                      <p className="text-xs font-bold text-slate-900">{user?.name}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{user?.email}</p>
                    </div>
                    <DropdownMenuItem
                      onClick={() => navigate('/dashboard')}
                      className={`cursor-pointer ${
                        location.pathname === '/dashboard' ? 'bg-[#EEF2FF] text-[#3730A3] font-medium' : ''
                      }`}
                    >
                      <LayoutDashboard className="h-3.5 w-3.5 mr-2 text-[#4F46E5]" />
                      Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => navigate('/forms/new')}
                      className="cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5 mr-2 text-[#4F46E5]" />
                      Create New Form
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer font-medium"
                    >
                      <LogOut className="h-3.5 w-3.5 mr-2 text-red-500" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              !isPublicForm && (
                <div className="hidden sm:flex items-center space-x-2.5">
                  <Link to="/login">
                    <Button
                      variant={location.pathname === '/login' ? 'secondary' : 'ghost'}
                      size="sm"
                      className="font-medium"
                    >
                      Login
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button
                      size="sm"
                      className="font-semibold shadow-sm"
                    >
                      Get Started
                      <ArrowRight className="h-3.5 w-3.5 ml-1" />
                    </Button>
                  </Link>
                </div>
              )
            )}

            {/* Mobile Hamburger Toggle */}
            {!isPublicForm && (
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer / Menu */}
      {mobileMenuOpen && !isPublicForm && (
        <div className="md:hidden border-t border-border bg-white px-4 pt-3 pb-6 space-y-2 animate-in slide-in-from-top-2 duration-150">
          {!isAuthenticated ? (
            <>
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-lg text-sm font-medium ${
                  isLinkActive('/')
                    ? 'bg-[#EEF2FF] text-[#3730A3] font-semibold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                Home
              </Link>
              <a
                href="/#features"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Features
              </a>
              <a
                href="/#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                How It Works
              </a>
              <a
                href="/#about"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                About
              </a>
              <a
                href="/#contact"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Contact
              </a>
              <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full">
                    Login
                  </Button>
                </Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full">
                    Get Started Free
                  </Button>
                </Link>
              </div>
            </>
          ) : (
            <>
              <div className="px-3 py-2 mb-2 bg-[#EEF2FF] rounded-lg">
                <p className="text-xs font-bold text-slate-900">{user?.name}</p>
                <p className="text-[11px] text-slate-600 truncate">{user?.email}</p>
              </div>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                  location.pathname === '/dashboard'
                    ? 'bg-[#EEF2FF] text-[#3730A3] font-semibold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <LayoutDashboard className="h-4 w-4 text-[#4F46E5]" />
                Dashboard
              </Link>
              <Link
                to="/forms/new"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <Plus className="h-4 w-4 text-[#4F46E5]" />
                Create New Form
              </Link>
              <div className="pt-3 border-t border-slate-100">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-semibold text-red-600 hover:bg-red-50 transition"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
