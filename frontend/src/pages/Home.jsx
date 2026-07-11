import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { token, user } = useAuth();

  if (token) {
    return <Navigate to={user?.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-ink px-6 text-center">
      <div className="mx-auto max-w-2xl animate-slideup">
        <span className="mb-4 inline-block font-mono text-xs uppercase tracking-[0.25em] text-gold">
          Est. 2026 · Exclusive Seating
        </span>
        <h1 className="mb-6 font-sans text-4xl md:text-6xl font-bold uppercase tracking-tight leading-tight text-text">
          A table, held in <br />
          <span className="text-gold">your name.</span>
        </h1>
        <p className="mx-auto mb-10 max-w-md text-sm md:text-base text-text-muted/90 font-light leading-relaxed">
          Reserve a table in under a minute. Experience our Michelin-caliber seating chart where you can pick your exact preferred table on our interactive digital floor map.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/register"
            className="w-full sm:w-auto rounded-sm bg-gold px-8 py-3.5 text-xs font-bold uppercase tracking-wider text-ink transition-all duration-300 hover:bg-gold-soft hover:shadow-lg hover:shadow-gold/20"
          >
            Reserve a table
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto rounded-sm border border-gold/40 px-8 py-3.5 text-xs font-semibold uppercase tracking-wider text-text transition-all duration-300 hover:border-gold hover:bg-gold/5"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
