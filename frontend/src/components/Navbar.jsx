import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  User as UserIcon,
  Layers,
  Sparkles,
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // If on a respondent public form, show minimal branding
  const isPublicForm = location.pathname.startsWith('/public/forms/');

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-white/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <Link
              to={isAuthenticated ? '/dashboard' : '/login'}
              className="flex items-center space-x-2.5 transition-opacity hover:opacity-90"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-500/20">
                <Layers className="h-5 w-5" />
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold tracking-tight text-gray-900">
                  FormCraft
                </span>
                <Badge variant="secondary" className="hidden sm:inline-flex text-[10px] py-0 px-2 font-semibold">
                  SaaS
                </Badge>
              </div>
            </Link>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard">
                  <Button
                    variant={location.pathname === '/dashboard' ? 'secondary' : 'ghost'}
                    size="sm"
                    className="font-medium"
                  >
                    <LayoutDashboard className="h-4 w-4 mr-1.5 text-gray-500" />
                    Dashboard
                  </Button>
                </Link>

                <Link to="/forms/new">
                  <Button size="sm" className="font-semibold shadow-sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Create Form
                  </Button>
                </Link>

                <div className="h-5 w-px bg-gray-200 mx-1" />

                {/* User Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <button className="flex items-center space-x-2 rounded-full p-1 pl-2 text-xs font-medium text-gray-700 hover:bg-gray-100 transition-colors focus:outline-none">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-200">
                        {user?.name ? user.name[0].toUpperCase() : 'U'}
                      </div>
                      <span className="hidden md:inline font-semibold text-gray-800">
                        {user?.name}
                      </span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="right" className="w-56 p-1.5">
                    <div className="px-2.5 py-2">
                      <p className="text-xs font-semibold text-gray-900">{user?.name}</p>
                      <p className="text-[11px] text-gray-500 truncate">{user?.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                      <LayoutDashboard className="h-3.5 w-3.5 mr-2 text-gray-400" />
                      All Forms
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/forms/new')}>
                      <Plus className="h-3.5 w-3.5 mr-2 text-gray-400" />
                      New Form
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600 focus:bg-red-50">
                      <LogOut className="h-3.5 w-3.5 mr-2 text-red-500" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              !isPublicForm && (
                <div className="flex items-center space-x-2">
                  <Link to="/login">
                    <Button variant="ghost" size="sm">
                      Login
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button size="sm">Register</Button>
                  </Link>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
