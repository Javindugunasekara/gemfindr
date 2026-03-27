import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";

import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

import Home from "./pages/Home";
import Gems from "./pages/Gems";
import GemDetail from "./pages/GemDetail";
import Locations from "./pages/Locations";
import Chatbot from "./pages/Chatbot";
import Admin from "./pages/Admin";

import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminLogin from "./pages/AdminLogin";

export default function App() {
  return (
    <Layout>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin-login" element={<AdminLogin />} />

        {/* Protected User Website */}
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/gems" element={<ProtectedRoute><Gems /></ProtectedRoute>} />
        <Route path="/gems/:id" element={<ProtectedRoute><GemDetail /></ProtectedRoute>} />
        <Route path="/locations" element={<ProtectedRoute><Locations /></ProtectedRoute>} />
        <Route path="/chat" element={<ProtectedRoute><Chatbot /></ProtectedRoute>} />

        {/* Admin panel */}
        <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />

        {/* fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}