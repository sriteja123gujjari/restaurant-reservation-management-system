import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await api.login({ email, password });
      login(data.token, data.user);
      navigate(data.user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper to quickly log in with demo accounts
  const handleQuickLogin = async (demoEmail, demoPassword) => {
    setError('');
    setLoading(true);
    try {
      const data = await api.login({ email: demoEmail, password: demoPassword });
      login(data.token, data.user);
      navigate(data.user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[85vh] max-w-md flex-col justify-center px-6 py-12 animate-slideup">
      <div className="rounded-sm border border-gold/20 bg-ink-light/40 p-8 shadow-xl backdrop-blur-sm">
        <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.2em] text-gold">
          Welcome back
        </p>
        <h1 className="mb-6 font-sans text-2xl md:text-3xl font-bold uppercase tracking-tight text-text">
          Sign in <span className="text-gold">to reserve</span>
        </h1>

        {error && (
          <div className="mb-6 rounded-sm border border-brick bg-brick/10 px-4 py-3 text-xs text-brick">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="font-mono text-xs uppercase tracking-wide text-text-muted">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-sm border border-ink-lighter bg-ink px-4 py-2.5 text-sm text-text outline-none transition-colors focus:border-gold"
              placeholder="you@example.com"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="font-mono text-xs uppercase tracking-wide text-text-muted">Password</span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-sm border border-ink-lighter bg-ink px-4 py-2.5 text-sm text-text outline-none transition-colors focus:border-gold"
              placeholder="••••••••"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-sm bg-gold px-4 py-3 text-xs font-bold uppercase tracking-wider text-ink transition-all duration-300 hover:bg-gold-soft disabled:opacity-50"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-text-muted">
          Don't have an account?{' '}
          <Link to="/register" className="text-gold hover:text-gold-soft hover:underline">
            Register here
          </Link>
        </p>

        {/* Demo Credentials Quick-Fill Panel */}
        <div className="mt-8 border-t border-ink-lighter pt-6">
          <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-text-muted text-center">
            Reviewer Quick Access
          </p>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => handleQuickLogin('customer@demo.com', 'customer123')}
              className="flex items-center justify-between rounded-sm border border-ink-lighter bg-ink-light/50 px-4 py-2.5 text-xs text-text hover:border-gold/50 hover:bg-ink-light transition-all"
            >
              <span>Customer Demo</span>
              <span className="font-mono text-[9px] uppercase tracking-wide text-gold">One-Click Log In</span>
            </button>
            <button
              onClick={() => handleQuickLogin('admin@demo.com', 'admin123')}
              className="flex items-center justify-between rounded-sm border border-ink-lighter bg-ink-light/50 px-4 py-2.5 text-xs text-text hover:border-gold/50 hover:bg-ink-light transition-all"
            >
              <span>Admin Demo</span>
              <span className="font-mono text-[9px] uppercase tracking-wide text-gold">One-Click Log In</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
