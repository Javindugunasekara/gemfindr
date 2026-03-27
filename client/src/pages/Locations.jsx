import { useEffect, useMemo, useState } from "react";
import HeroHeader from "../components/HeroHeader";
import { useAuth } from "../auth/AuthContext";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Locations() {
  const { userAuthHeader } = useAuth();

  const [locations, setLocations] = useState([]);
  const [q, setQ] = useState("");
  const [type, setType] = useState("all");

  useEffect(() => {
    fetch(`${API}/api/locations`, {
      headers: { ...userAuthHeader() },
    })
      .then((r) => r.json())
      .then(setLocations)
      .catch(console.error);
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return locations.filter((l) => {
      if (type !== "all" && l.location_type !== type) return false;
      if (!s) return true;
      return [l.name, l.district, l.address].some((x) =>
        (x || "").toLowerCase().includes(s)
      );
    });
  }, [locations, q, type]);

  return (
    <div>
      <HeroHeader
        title="Locations"
        subtitle="Explore markets, shops and mining locations stored in the system."
        right={<span className="badge blue">{filtered.length} results</span>}
      />

      <div className="glass-card admin-section">
        <div className="row">
          <input
            className="input"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name, district, address..."
            style={{ maxWidth: 420 }}
          />

          <select
            className="select"
            value={type}
            onChange={(e) => setType(e.target.value)}
            style={{ maxWidth: 220 }}
          >
            <option value="all">All</option>
            <option value="shop">Shop</option>
            <option value="market">Market</option>
            <option value="mining">Mining</option>
          </select>

          <button
            className="button secondary"
            onClick={() => { setQ(""); setType("all"); }}
          >
            Reset
          </button>
        </div>
      </div>

      <div className="glass-card admin-section table-wrap" style={{ marginTop: 14 }}>
        <table className="table">
          <thead>
            <tr>
              <th style={{ width: 220 }}>Name</th>
              <th style={{ width: 120 }}>Type</th>
              <th style={{ width: 140 }}>District</th>
              <th>Address</th>
              <th style={{ width: 120 }}>Lat</th>
              <th style={{ width: 120 }}>Lng</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((l) => (
              <tr key={l.id}>
                <td style={{ fontWeight: 900 }}>{l.name}</td>
                <td>{l.location_type}</td>
                <td>{l.district || "-"}</td>
                <td style={{ whiteSpace: "normal", lineHeight: 1.4 }}>
                  {l.address || "-"}
                </td>
                <td>{l.lat}</td>
                <td>{l.lng}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}