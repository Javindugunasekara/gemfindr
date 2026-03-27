import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Layout({ children }) {
  const nav = useNavigate();
  const { user, admin, logoutUser, logoutAdmin } = useAuth();

  function doLogout() {
    logoutUser();
    logoutAdmin();
    nav("/login");
  }

  return (
    <div className="shell">
      {/* Header */}
      <header className="topbar">
        <div className="topbar-inner">
          <a className="logo" href={user ? "/" : "/login"}>
            <span className="logo-mark">💎</span>
            <span className="logo-text">
              <span className="logo-title">GemFindr</span>
              <span className="logo-sub">💎💎💎💎</span>
            </span>
          </a>

          {/* Main navigation only after USER login */}
          {user && (
            <nav className="nav">
              <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>Home</NavLink>
              <NavLink to="/gems" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>Gems</NavLink>
              <NavLink to="/locations" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>Locations</NavLink>
              <NavLink to="/chat" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>Chatbot</NavLink>
            </nav>
          )}

          {/* Right side actions */}
          <div className="topbar-right">
            {!user ? (
              <div className="row">
                <NavLink className="button secondary" to="/login">Login</NavLink>
                <NavLink className="button" to="/register">Register</NavLink>
                <NavLink className="button secondary" to="/admin-login">Admin</NavLink>
              </div>
            ) : (
              <div className="row">
                {/* Admin button always visible after user login */}
                <NavLink className="button secondary" to={admin ? "/admin" : "/admin-login"}>
                  Admin
                </NavLink>

                {/* Optional search (UI only) */}
                <div className="search" style={{ display: "flex" }}>
                  <span className="search-ico">⌕</span>
                  <input className="search-input" placeholder="Search gems or locations..." />
                </div>

                <button className="button danger" onClick={doLogout}>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Page Content */}
      <main className="container">{children}</main>

      {/* Footer (✅ your exact footer kept) */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-grid">
            <div>
              <div className="footer-title">GemFindr</div>
              <p className="footer-text">
                Platform for gem education, market/location
                information.
              </p>
              <div className="footer-badges">
                <span className="badge purple">Gems</span>
                <span className="badge blue">Markets</span>
                <span className="badge green"> Chatbot</span>
              </div>
            </div>

            <div>
              <div className="footer-title">Pages</div>
              <div className="footer-links">
                <a href="/gems">Gems</a>
                <a href="/locations">Locations</a>
                <a href="/chat">Chatbot</a>
                <a href="/admin">Admin</a>
              </div>
            </div>

            <div>
              <div className="footer-title">Contact</div>
              <p className="footer-text">
                Javindu Ggunasekara<br />
                javindugunasekara@gmail.com<br />
                0767089139
              </p>
            </div>
          </div>

          <div className="footer-bottom">
            <span>©️ {new Date().getFullYear()} GemFindr</span>
            <span className="footer-muted">AI Based Education Platform</span>
          </div>
        </div>
      </footer>
    </div>
  );
}