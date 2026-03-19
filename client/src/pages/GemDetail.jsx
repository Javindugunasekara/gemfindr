import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function GemDetail() {
  const { id } = useParams();
  const [gem, setGem] = useState(null);

  useEffect(() => {
    fetch(`${API}/api/gems/${id}`)
      .then((r) => r.json())
      .then(setGem)
      .catch(console.error);
  }, [id]);

  if (!gem) return <div className="card card-pad">Loading...</div>;

  return (
    <div>
      <div className="page-head">
        <div>
          <h2 className="page-title">{gem.name}</h2>
          <p className="page-subtitle">Detailed gemstone profile.</p>
        </div>
        <span className="badge purple">{gem.gem_type}</span>
      </div>

      <div className="grid grid-2">
        <div className="card card-pad">
          {gem.image_url ? (
            <img className="thumb" style={{ height: 320 }} src={`${API}${gem.image_url}`} alt={gem.name} />
          ) : (
            <div className="placeholder" style={{ height: 320 }}>No image</div>
          )}
        </div>

        <div className="card card-pad">
          <div className="row" style={{ marginBottom: 10 }}>
            <span className="badge blue">{gem.color || "Color N/A"}</span>
            <span className="badge green">Hardness: {gem.hardness || "-"}</span>
            <span className="badge">{gem.origin || "Origin N/A"}</span>
          </div>

          <div style={{ color: "var(--muted)", fontWeight: 700, marginBottom: 6 }}>
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