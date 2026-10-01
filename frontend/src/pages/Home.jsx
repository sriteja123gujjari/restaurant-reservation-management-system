import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleAction = () => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/bookings');
      }
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="home-container" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
      <span className="badge" style={{ background: '#fef3c7', color: '#92400e', padding: '0.25rem 0.75rem', borderRadius: '12px', fontSize: '0.85rem' }}>
        • Now accepting reservations
      </span>

      <h1 style={{ fontSize: '2.5rem', marginTop: '1rem' }}>
        Book your perfect <br />
        <span style={{ color: '#b34700' }}>dining experience</span>
      </h1>

      <p style={{ color: '#666', maxWidth: '500px', margin: '1rem auto' }}>
        Reserve your preferred table in under a minute. Browse our interactive floor plan, pick your seat, and lock it in.
      </p>

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.5rem' }}>
        <button
          onClick={handleAction}
          style={{ backgroundColor: '#b34700', color: '#fff', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          {user ? 'Go to Booking Dashboard' : 'Reserve a table'}
        </button>

        {!user && (
          <button
            onClick={() => navigate('/login')}
            style={{ backgroundColor: '#f3f4f6', border: '1px solid #ccc', padding: '0.75rem 1.5rem', borderRadius: '6px', cursor: 'pointer' }}
          >
            Sign in
          </button>
        )}
      </div>
    </div>
  );
}