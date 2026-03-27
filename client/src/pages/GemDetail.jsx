import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function GemDetail() {
  const { userAuthHeader } = useAuth();
  const { id } = useParams();
  const [gem, setGem] = useState(null);

  useEffect(() => {
    fetch(`${API}/api/gems/${id}`, {
      headers: { ...userAuthHeader() },
    })
      .then((r) => r.json())
      .then(setGem)
      .catch(console.error);
  }, [id]);

  if (!gem) return <div className="glass-card admin-section">Loading...</div>;

  return (
    <div>
      <div className="hero">
        <div className="hero-inner">
          <div>
            <h1 className="hero-title">{gem.name}</h1>
            <p className="hero-subtitle">Detailed gemstone profile.</p>
          </div>
          <span className="badge purple">{gem.gem_type}</span>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="glass-card admin-section">
          {gem.image_url ? (
            <img
              className="thumb"
              style={{ height: 320, borderRadius: 16, width: "100%", objectFit: "cover" }}
              src={`${API}${gem.image_url}`}
              alt={gem.name}
            />
          ) : (
            <div className="placeholder" style={{ height: 320 }}>No image</div>
          )}
        </div>

        <div className="glass-card admin-section">
          <div style={{ marginBottom: 10, color: "rgba(255,255,255,.85)", fontWeight: 800 }}>
            <div><b>Color:</b> {gem.color || "-"}</div>
            <div><b>Hardness:</b> {gem.hardness || "-"}</div>
            <div><b>Origin:</b> {gem.origin || "-"}</div>
          </div>

          <div style={{ color: "rgba(255,255,255,.75)", fontWeight: 800, marginBottom: 6 }}>
            Description
          </div>
          <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.55 }}>
            {gem.description || "No description available."}
          </div>
        </div>
      </div>
    </div>
  );
}