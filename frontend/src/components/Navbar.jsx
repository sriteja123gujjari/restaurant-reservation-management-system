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
    <header className="sticky top-0 z-50 border-b border-ink-lighter bg-ink/95 backdrop-blur-md transition-all duration-300">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        {/* Elegant Brand Logo */}
        <Link to="/" className="group flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-gold/40 bg-ink-light transition-all duration-300 group-hover:border-gold group-hover:bg-ink-lighter">
            <svg
              className="h-5 w-5 text-gold transition-transform duration-500 group-hover:rotate-12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
          <span className="font-sans text-lg md:text-xl font-bold tracking-wide text-text transition-colors group-hover:text-gold">
            The <span className="text-gold">Reservation</span> Book
          </span>
        </Link>

        {/* Navigation Items */}
        <nav className="flex items-center gap-5 font-sans text-sm">
          {user ? (
            <>
              {/* User badge */}
              <div className="hidden sm:flex items-center gap-2 rounded-full border border-ink-lighter bg-ink-light px-3 py-1">
                <div className="h-2 w-2 rounded-full bg-sage animate-pulse"></div>
                <span className="text-xs text-text font-medium">
                  {user.name} 
                  <span className="ml-1.5 text-[10px] uppercase tracking-wider text-gold font-mono">
                    {user.role}
                  </span>
                </span>
              </div>

              <div className="flex items-center gap-4">
                {user.role === 'admin' ? (
                  <Link
                    to="/admin"
                    className={`relative py-1 font-medium tracking-wide transition-colors ${
                      isActive('/admin') ? 'text-gold' : 'text-text-muted hover:text-text'
                    }`}
                  >
                    Ledger
                    {isActive('/admin') && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold rounded-full"></span>
                    )}
                  </Link>
                ) : (
                  <Link
                    to="/dashboard"
                    className={`relative py-1 font-medium tracking-wide transition-colors ${
                      isActive('/dashboard') ? 'text-gold' : 'text-text-muted hover:text-text'
                    }`}
                  >
                    My Table
                    {isActive('/dashboard') && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold rounded-full"></span>
                    )}
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="rounded-sm border border-brick/40 px-3.5 py-1.5 text-xs font-semibold text-brick hover:border-brick hover:bg-brick/10 transition-all duration-300"
                >
                  Sign out
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <Link
                to="/login"
                className={`py-1 font-medium transition-colors ${
                  isActive('/login') ? 'text-gold' : 'text-text-muted hover:text-text'
                }`}
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="rounded-sm bg-gold px-4 py-2 text-xs font-bold uppercase tracking-wider text-ink hover:bg-gold-soft transition-all duration-300 shadow-md hover:shadow-gold/20"
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
