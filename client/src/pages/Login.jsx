import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import HeroHeader from "../components/HeroHeader";
import { useAuth } from "../auth/AuthContext";

export default function Login() {
  const { loginUser } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const redirectTo = loc.state?.from || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  async function submit(e) {
    e.preventDefault();
    setErr("");
    try {
      await loginUser(email, password);
      nav(redirectTo);
    } catch (e2) {
      setErr(e2.message);
    }
  }

  return (
    <div>
      <HeroHeader title="Login" subtitle="Login to access GemFindr." />
      <div className="glass-card admin-section" style={{ maxWidth: 520 }}>
        {err && <div className="alert">{err}</div>}
        <form onSubmit={submit}>
          <div className="row" style={{ flexDirection: "column", alignItems: "stretch" }}>
            <input className="input" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} />
            <input className="input" type="password" placeholder="Password" value={password} onChange={(e)=>setPassword(e.target.value)} />
            <button className="button" type="submit">Login</button>
          </div>
        </form>
        <div style={{ marginTop: 10, color: "rgba(255,255,255,.8)", fontWeight: 700 }}>
          No account? <Link to="/register">Register</Link>
        </div>
      </div>
    </div>
  );
}