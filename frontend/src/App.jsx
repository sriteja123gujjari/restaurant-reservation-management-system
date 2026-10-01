import React from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CustomerDashboard from './pages/CustomerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';

export default function App() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', color: '#111827' }}>
      {/* Top Header / Navbar */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', backgroundColor: '#ffffff', borderBottom: '1px solid #e5e7eb' }}>
        <Link to="/" style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#b34700', textDecoration: 'none' }}>
          ReserveTable
        </Link>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {user ? (
            <>
              <span style={{ fontSize: '0.9rem', backgroundColor: '#ecfdf5', color: '#047857', padding: '0.25rem 0.75rem', borderRadius: '12px' }}>
                ● {user.name || user.email} ({user.role?.toUpperCase() || 'CUSTOMER'})
              </span>
              <button
                onClick={handleSignOut}
                style={{ background: 'none', border: 'none', color: '#4b5563', cursor: 'pointer', fontWeight: '500' }}
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={{ textDecoration: 'none', color: '#4b5563', fontWeight: '500' }}>Sign in</Link>
              <Link to="/login" style={{ textDecoration: 'none', backgroundColor: '#b34700', color: '#fff', padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: 'bold' }}>RESERVE TABLE</Link>
            </>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main>
        <Routes>
          <Route path="/" element={user ? (user.role === 'admin' ? <AdminDashboard /> : <CustomerDashboard />) : <Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/bookings" element={<CustomerDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}