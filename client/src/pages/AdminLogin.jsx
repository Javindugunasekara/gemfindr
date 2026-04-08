import { useState } from "react";
import { useNavigate } from "react-router-dom";
import HeroHeader from "../components/HeroHeader";
import { useAuth } from "../auth/AuthContext";

export default function AdminLogin() {
  const { loginAdmin } = useAuth();
  const nav = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  async function submit(e) {
    e.preventDefault();
    setErr("");
    try {
      await loginAdmin(email, password);
      nav("/admin");
    } catch (e2) {
      setErr(e2.message);
    }
  }

  return (
    <div>
      <HeroHeader title="Admin Login" subtitle="Login to access the Admin Panel." />
      <div className="glass-card admin-section" style={{ maxWidth: 520 }}>
        {err && <div className="alert">{err}</div>}
        <form onSubmit={submit}>
          <div className="row" style={{ flexDirection: "column", alignItems: "stretch" }}>
            <input className="input" placeholder="Admin Email" value={email} onChange={(e)=>setEmail(e.target.value)} />
            <input className="input" type="password" placeholder="Admin Password" value={password} onChange={(e)=>setPassword(e.target.value)} />
            <button className="button" type="submit">Login as Admin</button>
          </div>
        </form>
        <div style={{ marginTop: 10, color: "rgba(255,255,255,.75)", fontWeight: 700 }}>
        </div>
      </div>
    </div>
  );
}