import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { user, login } = useAuth();
  const navigate = useNavigate();

  // If already authenticated, redirect straight to booking dashboard
  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({ email, password });
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (demoEmail, demoPassword) => {
    setError('');
    setLoading(true);

    try {
      await login({ email: demoEmail, password: demoPassword });
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message || 'Quick login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-12 animate-slideup">
      <div className="max-w-md w-full mx-auto bg-white rounded-2xl border border-slate-200/90 p-8 shadow-card">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-extrabold font-heading text-slate-900">
            Sign In
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Access your ReservePrime floor plan & bookings
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-xl border border-orange-200 bg-orange-50 px-4 py-2.5 text-xs text-orange-800 font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-district focus:border-transparent font-medium shadow-xs transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-district focus:border-transparent font-medium shadow-xs transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-district hover:bg-orange-600 active:scale-[0.99] transition-all mt-2"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-slate-500">
          Don't have an account?{' '}
          <Link to="/register" className="text-district font-bold hover:underline">
            Register here
          </Link>
        </p>

        {/* Demo Accounts */}
        <div className="mt-8 border-t border-slate-100 pt-5">
          <div className="text-[11px] font-bold tracking-wider uppercase text-slate-400 mb-2.5 font-mono">
            Quick Demo Access
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50">
              <div>
                <div className="text-xs font-bold text-slate-800">Demo Customer</div>
                <div className="text-[11px] text-slate-500 font-mono">customer@demo.com</div>
              </div>
              <button
                type="button"
                onClick={() => handleQuickLogin('customer@demo.com', 'customer123')}
                disabled={loading}
                className="text-xs font-bold text-district hover:underline px-3 py-1 rounded-md bg-white border border-slate-200"
              >
                Log In
              </button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50">
              <div>
                <div className="text-xs font-bold text-slate-800">Demo Admin</div>
                <div className="text-[11px] text-slate-500 font-mono">admin@demo.com</div>
              </div>
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@demo.com', 'admin123')}
                disabled={loading}
                className="text-xs font-bold text-district hover:underline px-3 py-1 rounded-md bg-white border border-slate-200"
              >
                Log In
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}