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
    <div className="mx-auto flex min-h-[85vh] max-w-sm flex-col justify-center px-6 py-12 animate-slideup">
      <div>
        <h1 className="mb-1 font-sans text-2xl font-bold text-gray-900">
          Welcome back
        </h1>
        <p className="mb-8 text-sm text-gray-500">
          Sign in to manage your reservations
        </p>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-gray-700">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-colors focus:border-gold focus:ring-1 focus:ring-gold/30"
              placeholder="you@example.com"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-gray-700">Password</span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-colors focus:border-gold focus:ring-1 focus:ring-gold/30"
              placeholder="••••••••"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="mt-1 rounded-lg bg-gold px-4 py-2.5 text-sm font-semibold text-white hover:bg-gold-soft disabled:opacity-50 transition-colors"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Don't have an account?{' '}
          <Link to="/register" className="text-gold font-medium hover:underline">
            Register
          </Link>
        </p>

        {/* Quick access for reviewers */}
        <div className="mt-10 border-t border-gray-100 pt-6">
          <p className="mb-3 text-xs font-medium text-gray-400 text-center uppercase tracking-wider">
            Reviewer Quick Access
          </p>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('customer@demo.com', 'customer123')}
              className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50/50 px-4 py-3 text-left hover:border-gold/40 hover:bg-amber-50/30 transition-colors"
            >
              <div>
                <span className="text-sm font-semibold text-gray-900 block">Customer Demo</span>
                <span className="text-xs text-gray-400 font-mono">customer@demo.com</span>
              </div>
              <span className="text-[10px] uppercase tracking-wide text-gold font-bold">Login →</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@demo.com', 'admin123')}
              className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50/50 px-4 py-3 text-left hover:border-gold/40 hover:bg-amber-50/30 transition-colors"
            >
              <div>
                <span className="text-sm font-semibold text-gray-900 block">Admin Demo</span>
                <span className="text-xs text-gray-400 font-mono">admin@demo.com</span>
              </div>
              <span className="text-[10px] uppercase tracking-wide text-gold font-bold">Login →</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
