import { NavLink } from "react-router-dom";

function NavItem({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => `navlink ${isActive ? "active" : ""}`}
    >
      {children}
    </NavLink>
  );
}

export default function Layout({ children }) {
  return (
    <div className="shell">
      {/* Header */}
      <header className="topbar">
  <div className="topbar-inner">
    <a className="logo" href="/">
      <span className="logo-mark">💎</span>
      <span className="logo-text">
        <span className="logo-title">GemFindr</span>
        <span className="logo-sub">💎💎💎💎</span>
      </span>
    </a>

    <nav className="nav">
      <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>Home</NavLink>
      <NavLink to="/gems" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>Gems</NavLink>
      <NavLink to="/locations" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>Locations</NavLink>
      <NavLink to="/chat" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>Chatbot</NavLink>
      <NavLink to="/admin" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>Admin</NavLink>
    </nav>

    {/* Optional quick search (UI only) */}
    <div className="topbar-right">
      <div className="search">
        <span className="search-ico">⌕</span>
        <input className="search-input" placeholder="Search gems or locations..." />
      </div>
    </div>
  </div>
</header>

      {/* Page Content */}
      <main className="container">{children}</main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-grid">
            <div>
              <div className="footer-title">GemFindr</div>
              <p className="footer-text">
                Platform for gem education, market/location
                information, and a database-grounded chatbot.
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
            <span>© {new Date().getFullYear()} GemFindr</span>
            <span className="footer-muted">AI Based Education Platform</span>
          </div>
        </div>
      </footer>
    </div>
  );
}