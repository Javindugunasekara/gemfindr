import { createContext, useContext, useEffect, useState } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
const USER_TOKEN_KEY = "gemfindr_user_token";
const ADMIN_TOKEN_KEY = "gemfindr_admin_token";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);         // normal user session
  const [admin, setAdmin] = useState(null);       // admin session
  const [loading, setLoading] = useState(true);

  async function fetchMe(token) {
    const r = await fetch(`${API}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.message || "Not logged in");
    return data.user;
  }

  useEffect(() => {
    (async () => {
      try {
        const userToken = localStorage.getItem(USER_TOKEN_KEY);
        const adminToken = localStorage.getItem(ADMIN_TOKEN_KEY);

        if (userToken) {
          const u = await fetchMe(userToken);
          setUser(u);
        }
        if (adminToken) {
          const a = await fetchMe(adminToken);
          if (a.role === "admin") setAdmin(a);
          else localStorage.removeItem(ADMIN_TOKEN_KEY);
        }
      } catch {
        localStorage.removeItem(USER_TOKEN_KEY);
        localStorage.removeItem(ADMIN_TOKEN_KEY);
        setUser(null);
        setAdmin(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function loginUser(email, password) {
    const r = await fetch(`${API}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.message || "Login failed");
    localStorage.setItem(USER_TOKEN_KEY, data.token);
    setUser(data.user);
    return data.user;
  }

  async function registerUser(name, email, password) {
    const r = await fetch(`${API}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.message || "Register failed");
    localStorage.setItem(USER_TOKEN_KEY, data.token);
    setUser(data.user);
    return data.user;
  }

  async function loginAdmin(email, password) {
    const r = await fetch(`${API}/api/auth/admin-login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.message || "Admin login failed");
    localStorage.setItem(ADMIN_TOKEN_KEY, data.token);
    setAdmin(data.user);
    return data.user;
  }

  function logoutUser() {
    localStorage.removeItem(USER_TOKEN_KEY);
    setUser(null);
  }

  function logoutAdmin() {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    setAdmin(null);
  }

  function userAuthHeader() {
    const t = localStorage.getItem(USER_TOKEN_KEY);
    return t ? { Authorization: `Bearer ${t}` } : {};
  }

  function adminAuthHeader() {
    const t = localStorage.getItem(ADMIN_TOKEN_KEY);
    return t ? { Authorization: `Bearer ${t}` } : {};
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        admin,
        loading,
        loginUser,
        registerUser,
        loginAdmin,
        logoutUser,
        logoutAdmin,
        userAuthHeader,
        adminAuthHeader,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}