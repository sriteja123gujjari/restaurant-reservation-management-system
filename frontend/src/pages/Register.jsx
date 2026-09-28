import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await api.register(form);
      login(data.token, data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[85vh] max-w-sm flex-col justify-center px-6 py-12 animate-slideup">
      <div>
        <h1 className="mb-1 font-sans text-2xl font-bold text-gray-900">
          Create an account
        </h1>
        <p className="mb-8 text-sm text-gray-500">
          Get started with your first reservation
        </p>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-gray-700">Full name</span>
            <input
              type="text"
              required
              value={form.name}
              onChange={update('name')}
              className="rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-colors focus:border-gold focus:ring-1 focus:ring-gold/30"
              placeholder="Jane Doe"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-gray-700">Email</span>
            <input
              type="email"
              required
              value={form.email}
              onChange={update('email')}
              className="rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-colors focus:border-gold focus:ring-1 focus:ring-gold/30"
              placeholder="you@example.com"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-gray-700">Password</span>
            <input
              type="password"
              required
              minLength={6}
              value={form.password}
              onChange={update('password')}
              className="rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-colors focus:border-gold focus:ring-1 focus:ring-gold/30"
              placeholder="At least 6 characters"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="mt-1 rounded-lg bg-gold px-4 py-2.5 text-sm font-semibold text-white hover:bg-gold-soft disabled:opacity-50 transition-colors"
          >
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="text-gold font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
