import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import HeroHeader from "../components/HeroHeader";
import { useAuth } from "../auth/AuthContext";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Gems() {
  const { userAuthHeader } = useAuth();

  const [gems, setGems] = useState([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    fetch(`${API}/api/gems`, {
      headers: { ...userAuthHeader() },
    })
      .then((r) => r.json())
      .then(setGems)
      .catch(console.error);
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return gems;
    return gems.filter((g) =>
      [g.name, g.gem_type, g.color, g.origin].some((x) =>
        (x || "").toLowerCase().includes(s)
      )
    );
  }, [gems, q]);

  return (
    <div>
      <HeroHeader
        title="Gems"
        subtitle="Browse gemstone profiles with images and key properties."
        right={<span className="badge blue">{filtered.length} results</span>}
      />

      <div className="glass-card admin-section">
        <div className="row">
          <input
            className="input"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name, type, color, origin..."
            style={{ maxWidth: 520 }}
          />
          <button className="button secondary" onClick={() => setQ("")}>
            Clear
          </button>
        </div>
      </div>

      <div className="grid grid-auto" style={{ marginTop: 14 }}>
        {filtered.map((g) => (
          <div key={g.id} className="glass-card gem-card">
            <div className="gem-media">
              {g.image_url ? (
                <img src={`${API}${g.image_url}`} alt={g.name} />
              ) : (
                <div className="placeholder">No image</div>
              )}
            </div>

            <div className="gem-body">
              <div className="gem-title">
                <Link to={`/gems/${g.id}`}>{g.name}</Link>
              </div>

              <div className="gem-lines">
                <div><b>Type:</b> {g.gem_type || "-"}</div>
                <div><b>Color:</b> {g.color || "-"}</div>
                <div><b>Origin:</b> {g.origin || "-"}</div>
              </div>

              {g.description && (
                <div className="gem-desc">
                  {String(g.description).slice(0, 100)}
                  {g.description.length > 100 ? "..." : ""}
                </div>
              )}

              <div className="gem-actions">
                <Link className="button secondary" to={`/gems/${g.id}`}>
                  View Details
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}