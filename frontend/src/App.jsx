import React from 'react';
import { Routes, Route, Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CustomerDashboard from './pages/CustomerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';
import Navbar from './components/Navbar';

export default function App() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-900 flex flex-col font-sans antialiased selection:bg-orange-500/20 selection:text-orange-900">
      {/* Sticky ReservePrime Navbar */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1 w-full">
        <Routes>
          {/* Dynamic home routing: Customers -> CustomerDashboard, Admins -> AdminDashboard, Guests -> Home */}
          <Route
            path="/"
            element={
              user ? (
                user.role === 'admin' ? (
                  <AdminDashboard />
                ) : (
                  <CustomerDashboard />
                )
              ) : (
                <Home />
              )
            }
          />

          <Route
            path="/dashboard"
            element={
              user ? (
                user.role === 'admin' ? (
                  <Navigate to="/admin" replace />
                ) : (
                  <CustomerDashboard />
                )
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          <Route
            path="/bookings"
            element={
              user ? (
                <CustomerDashboard />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          <Route
            path="/admin"
            element={
              user && user.role === 'admin' ? (
                <AdminDashboard />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      {/* Clean ReservePrime Footer */}
      <footer className="w-full border-t border-slate-200/80 bg-white py-5 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-sans">
          <div>
            <span className="font-semibold text-slate-700">
              Reserve<span className="text-district font-extrabold">Prime</span>
            </span>
            <span className="mx-2 text-slate-300">•</span>
            <span>&copy; {new Date().getFullYear()} All rights reserved.</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-slate-600 font-medium">Instant Table Allocation</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-600 font-medium">Zero Cancellation Fee</span>
          </div>
        </div>
      </footer>
    </div>
  );
}