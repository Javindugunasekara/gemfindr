import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const loc = useLocation();

  if (loading) return <div className="glass-card admin-section">Loading...</div>;
  if (!user) return <Navigate to="/login" state={{ from: loc.pathname }} replace />;
  return children;
}