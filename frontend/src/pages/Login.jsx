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
    <div className="login-container" style={{ maxWidth: '480px', margin: '2rem auto', padding: '1.5rem' }}>
      <h2>Welcome back</h2>
      <p style={{ color: '#666', marginBottom: '1.5rem' }}>Sign in to manage your reservations</p>

      {error && (
        <div className="error-message" style={{ color: '#d9534f', backgroundColor: '#fdf7f7', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group" style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            style={{ width: '100%', padding: '0.6rem', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </div>

        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            style={{ width: '100%', padding: '0.6rem', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{ width: '100%', padding: '0.75rem', backgroundColor: '#b34700', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      <p className="register-prompt" style={{ marginTop: '1rem', textAlign: 'center' }}>
        Don't have an account? <Link to="/register" style={{ color: '#b34700' }}>Register</Link>
      </p>

      <div className="quick-access-section" style={{ marginTop: '2.5rem', borderTop: '1px solid #eee', paddingTop: '1.5rem' }}>
        <h4 style={{ fontSize: '0.85rem', color: '#888', letterSpacing: '1px', marginBottom: '1rem' }}>
          REVIEWER QUICK ACCESS
        </h4>

        <div className="quick-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #eee', borderRadius: '6px', padding: '1rem', marginBottom: '0.75rem' }}>
          <div>
            <strong>Customer Demo</strong>
            <div style={{ fontSize: '0.85rem', color: '#666' }}>customer@demo.com</div>
          </div>
          <button
            type="button"
            onClick={() => handleQuickLogin('customer@demo.com', 'customer123')}
            disabled={loading}
            style={{ background: 'none', border: 'none', color: '#b34700', fontWeight: 'bold', cursor: 'pointer' }}
          >
            LOGIN →
          </button>
        </div>

        <div className="quick-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #eee', borderRadius: '6px', padding: '1rem' }}>
          <div>
            <strong>Admin Demo</strong>
            <div style={{ fontSize: '0.85rem', color: '#666' }}>admin@demo.com</div>
          </div>
          <button
            type="button"
            onClick={() => handleQuickLogin('admin@demo.com', 'admin123')}
            disabled={loading}
            style={{ background: 'none', border: 'none', color: '#b34700', fontWeight: 'bold', cursor: 'pointer' }}
          >
            LOGIN →
          </button>
        </div>
      </div>
    </div>
  );
}