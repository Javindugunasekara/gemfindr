import { NavLink } from "react-router-dom";

export default function Shell({ children }) {
  return (
    <div className="shell">
      <header className="navbar">
        <div className="nav-inner">
          <div className="brand">
            <div className="brand-badge">💎</div>
            <div>
              GemFindr
              <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>
                Gem market info + learning assistant
              </div>
            </div>
          </div>

          <nav className="navlinks">
            <NavLink to="/" className={({ isActive }) => `navlink ${isActive ? "active" : ""}`}>Home</NavLink>
            <NavLink to="/gems" className={({ isActive }) => `navlink ${isActive ? "active" : ""}`}>Gems</NavLink>
            <NavLink to="/locations" className={({ isActive }) => `navlink ${isActive ? "active" : ""}`}>Locations</NavLink>
            <NavLink to="/chat" className={({ isActive }) => `navlink ${isActive ? "active" : ""}`}>Chatbot</NavLink>
            <NavLink to="/admin" className={({ isActive }) => `navlink ${isActive ? "active" : ""}`}>Admin</NavLink>
          </nav>
        </div>
      </header>

      <main className="container">{children}</main>
    </div>
  );
}