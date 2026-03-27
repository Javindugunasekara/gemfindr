import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import HeroHeader from "../components/HeroHeader";
import { useAuth } from "../auth/AuthContext";

export default function Register() {
  const { registerUser } = useAuth();
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  async function submit(e) {
    e.preventDefault();
    setErr("");
    try {
      await registerUser(name, email, password);
      nav("/");
    } catch (e2) {
      setErr(e2.message);
    }
  }

  return (
    <div>
      <HeroHeader title="Register" subtitle="Create an account to use GemFindr." />
      <div className="glass-card admin-section" style={{ maxWidth: 520 }}>
        {err && <div className="alert">{err}</div>}
        <form onSubmit={submit}>
          <div className="row" style={{ flexDirection: "column", alignItems: "stretch" }}>
            <input className="input" placeholder="Full Name" value={name} onChange={(e)=>setName(e.target.value)} />
            <input className="input" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} />
            <input className="input" type="password" placeholder="Password (min 6 chars)" value={password} onChange={(e)=>setPassword(e.target.value)} />
            <button className="button" type="submit">Register</button>
          </div>
        </form>
        <div style={{ marginTop: 10, color: "rgba(255,255,255,.8)", fontWeight: 700 }}>
          Already have an account? <Link to="/login">Login</Link>
        </div>
      </div>
    </div>
  );
}