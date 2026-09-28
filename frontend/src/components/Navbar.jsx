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
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3.5">
        {/* Brand */}
        <Link to="/" className="group flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold text-white transition-colors group-hover:bg-gold-soft">
            <svg className="h-4.5 w-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <span className="font-sans text-base font-bold text-gray-900">
            ReserveTable
          </span>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-3 text-sm">
          {user ? (
            <>
              {/* Role badge */}
              <div className="hidden sm:flex items-center gap-2 rounded-full bg-gray-50 border border-gray-100 px-3 py-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-sage"></div>
                <span className="text-xs text-gray-700 font-medium">
                  {user.name}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-gold font-bold font-mono bg-amber-50 px-1.5 py-0.5 rounded">
                  {user.role}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {user.role === 'admin' ? (
                  <Link
                    to="/admin"
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      isActive('/admin')
                        ? 'bg-amber-50 text-gold'
                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    Dashboard
                  </Link>
                ) : (
                  <Link
                    to="/dashboard"
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      isActive('/dashboard')
                        ? 'bg-amber-50 text-gold'
                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    My Bookings
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="rounded-md px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-brick hover:bg-red-50 transition-colors"
                >
                  Sign out
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  isActive('/login') ? 'text-gold' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="rounded-lg bg-gold px-4 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-gold-soft transition-colors"
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
