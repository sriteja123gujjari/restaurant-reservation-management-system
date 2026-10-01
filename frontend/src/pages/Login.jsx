import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Adjust path if needed

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { user, login } = useAuth();
  const navigate = useNavigate();

  // Redirect automatically if user is already authenticated
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
    <div className="login-container">
      <h2>Welcome back</h2>
      <p>Sign in to manage your reservations</p>

      {error && <div className="error-message" style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </div>

        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      <p className="register-prompt">
        Don't have an account? <Link to="/register">Register</Link>
      </p>

      <div className="quick-access-section" style={{ marginTop: '2rem' }}>
        <h4>REVIEWER QUICK ACCESS</h4>
        <div className="quick-card" style={{ border: '1px solid #ddd', padding: '1rem', marginBottom: '0.5rem' }}>
          <div>
            <strong>Customer Demo</strong>
            <div>customer@demo.com</div>
          </div>
          <button
            type="button"
            onClick={() => handleQuickLogin('customer@demo.com', 'password123')}
            disabled={loading}
          >
            LOGIN →
          </button>
        </div>

        <div className="quick-card" style={{ border: '1px solid #ddd', padding: '1rem' }}>
          <div>
            <strong>Admin Demo</strong>
            <div>admin@demo.com</div>
          </div>
          <button
            type="button"
            onClick={() => handleQuickLogin('admin@demo.com', 'admin123')}
            disabled={loading}
          >
            LOGIN →
          </button>
        </div>
      </div>
    </div>
  );
}