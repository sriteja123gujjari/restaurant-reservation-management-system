import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Guards a route: requires login, and optionally a specific role.
// Usage: <ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>
export default function ProtectedRoute({ children, role }) {
  const { token, user } = useAuth();

  if (!token) return <Navigate to="/login" replace />;
  if (role && user?.role !== role) return <Navigate to="/" replace />;

  return children;
}
