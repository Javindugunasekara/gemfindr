import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function AdminRoute({ children }) {
  const { admin, loading } = useAuth();

  if (loading) return <div className="glass-card admin-section">Loading...</div>;
  if (!admin) return <Navigate to="/admin-login" replace />;
  if (admin.role !== "admin") return <Navigate to="/" replace />;
  return children;
}