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
    <div className="mx-auto flex min-h-[85vh] max-w-md flex-col justify-center px-6 py-12 animate-slideup">
      <div className="rounded-sm border border-gold/20 bg-ink-light/40 p-8 shadow-xl backdrop-blur-sm">
        <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.2em] text-gold">
          Create account
        </p>
        <h1 className="mb-6 font-sans text-2xl md:text-3xl font-bold uppercase tracking-tight text-text">
          Reserve <span className="text-gold">your table</span>
        </h1>

        {error && (
          <div className="mb-6 rounded-sm border border-brick bg-brick/10 px-4 py-3 text-xs text-brick">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="font-mono text-xs uppercase tracking-wide text-gold-soft">Full name</span>
            <input
              type="text"
              required
              value={form.name}
              onChange={update('name')}
              className="rounded-sm border border-ink-lighter bg-ink px-4 py-2.5 text-sm text-text placeholder:text-text-muted/60 outline-none transition-colors focus:border-gold"
              placeholder="Jane Doe"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="font-mono text-xs uppercase tracking-wide text-gold-soft">Email Address</span>
            <input
              type="email"
              required
              value={form.email}
              onChange={update('email')}
              className="rounded-sm border border-ink-lighter bg-ink px-4 py-2.5 text-sm text-text placeholder:text-text-muted/60 outline-none transition-colors focus:border-gold"
              placeholder="you@example.com"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="font-mono text-xs uppercase tracking-wide text-gold-soft">Password</span>
            <input
              type="password"
              required
              minLength={6}
              value={form.password}
              onChange={update('password')}
              className="rounded-sm border border-ink-lighter bg-ink px-4 py-2.5 text-sm text-text placeholder:text-text-muted/60 outline-none transition-colors focus:border-gold"
              placeholder="At least 6 characters"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-sm bg-gold px-4 py-3 text-xs font-bold uppercase tracking-wider text-ink transition-all duration-300 hover:bg-gold-soft disabled:opacity-50"
          >
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-text-muted">
          Already have an account?{' '}
          <Link to="/login" className="text-gold hover:text-gold-soft hover:underline">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
}
