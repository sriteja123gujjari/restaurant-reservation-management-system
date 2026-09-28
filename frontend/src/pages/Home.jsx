import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { token, user } = useAuth();

  if (token) {
    return <Navigate to={user?.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  }

  return (
    <div className="flex min-h-[85vh] items-center justify-center px-6">
      <div className="mx-auto max-w-xl text-center animate-slideup">
        <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 border border-amber-100 px-4 py-1.5 mb-6">
          <div className="h-1.5 w-1.5 rounded-full bg-gold"></div>
          <span className="text-xs font-semibold text-gold tracking-wide">Now accepting reservations</span>
        </div>

        <h1 className="mb-4 font-sans text-4xl md:text-5xl font-bold tracking-tight leading-tight text-gray-900">
          Book your perfect
          <br />
          <span className="text-gold">dining experience</span>
        </h1>

        <p className="mx-auto mb-8 max-w-md text-base text-gray-500 leading-relaxed">
          Reserve your preferred table in under a minute. Browse our interactive floor plan, pick your seat, and lock it in.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/register"
            className="w-full sm:w-auto rounded-lg bg-gold px-7 py-3 text-sm font-semibold text-white hover:bg-gold-soft transition-colors shadow-sm"
          >
            Reserve a table
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto rounded-lg border border-gray-200 px-7 py-3 text-sm font-semibold text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-colors"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
