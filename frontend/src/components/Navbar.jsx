import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md shadow-xs">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
        {/* Brand Logo - Clean Typography */}
        <Link to="/" className="group flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-district rounded-lg">
          <span className="font-heading font-black text-xl tracking-tight text-slate-900">
            Reserve<span className="text-district">Prime</span>
          </span>
          <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wide bg-orange-50 text-district border border-orange-200">
            PRO
          </span>
        </Link>

        {/* Center / Navigation Links */}
        <nav className="flex items-center gap-2 sm:gap-3" aria-label="Main Navigation">
          {user ? (
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Role-based navigation */}
              {user.role === 'admin' ? (
                <Link
                  to="/admin"
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    isActive('/admin')
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  Admin Console
                </Link>
              ) : (
                <>
                  <Link
                    to="/"
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      isActive('/') || isActive('/bookings')
                        ? 'bg-orange-50 text-district'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    Floor Plan
                  </Link>

                  <Link
                    to="/dashboard"
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      isActive('/dashboard')
                        ? 'bg-orange-50 text-district'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    My Bookings
                  </Link>
                </>
              )}

              {/* User badge */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-xs font-semibold text-slate-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                <span className="max-w-[120px] truncate font-medium">
                  {user.name || user.email?.split('@')[0]}
                </span>
                <span className="text-[10px] uppercase font-mono font-bold text-slate-400">
                  {user.role}
                </span>
              </div>

              {/* Sign out */}
              <button
                onClick={handleLogout}
                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:text-orange-600 hover:bg-orange-50 transition-all"
                title="Sign out"
              >
                Sign out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                to="/login"
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  isActive('/login') ? 'text-district' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-district hover:bg-orange-600 transition-all"
              >
                Reserve Table
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
