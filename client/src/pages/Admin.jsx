import { useEffect, useState } from "react";
import HeroHeader from "../components/HeroHeader";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

function getJsonHeaders(adminKey) {
  return {
    "Content-Type": "application/json",
    ...(adminKey ? { "x-admin-key": adminKey } : {}),
  };
}

export default function Admin() {
  const [adminKey, setAdminKey] = useState(localStorage.getItem("ADMIN_KEY") || "");
  const [tab, setTab] = useState("gems");
  const [error, setError] = useState("");

  // Gems
  const [gems, setGems] = useState([]);
  const [gemForm, setGemForm] = useState({
    id: null,
    name: "",
    gem_type: "",
    color: "",
    hardness: "",
    origin: "",
    description: "",
    image_url: "",
  });
  const [gemImageFile, setGemImageFile] = useState(null);

  // Locations
  const [locations, setLocations] = useState([]);
  const [locForm, setLocForm] = useState({
    id: null,
    name: "",
    location_type: "market",
    district: "",
    address: "",
    lat: "",
    lng: "",
    description: "",
  });

  // Chunks
  const [chunks, setChunks] = useState([]);
  const [chunkForm, setChunkForm] = useState({
    id: null,
    entity_type: "general",
    entity_id: "",
    title: "",
    content: "",
    tags: "",
    source: "",
    reliability: 3,
    language: "en",
  });

  const headers = getJsonHeaders(adminKey);

  async function fetchJson(url) {
    const r = await fetch(url, { headers });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(data.error || data.message || `HTTP ${r.status}`);
    return data;
  }

  async function loadAll() {
    setError("");
    try {
      const [g, l, c] = await Promise.all([
        fetchJson(`${API}/api/admin/gems`),
        fetchJson(`${API}/api/admin/locations`),
        fetchJson(`${API}/api/admin/chunks`),
      ]);
      setGems(Array.isArray(g) ? g : []);
      setLocations(Array.isArray(l) ? l : []);
      setChunks(Array.isArray(c) ? c : []);
    } catch (e) {
      setError(e.message);
      setGems([]);
      setLocations([]);
      setChunks([]);
    }
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line
  }, []);

  function saveKey() {
    localStorage.setItem("ADMIN_KEY", adminKey);
    loadAll();
  }

  /* ---------- Gems CRUD ---------- */

  async function submitGem(e) {
    e.preventDefault();
    setError("");

    const payload = {
      ...gemForm,
      hardness: gemForm.hardness === "" ? null : Number(gemForm.hardness),
    };

    try {
      if (gemForm.id) {
        await fetch(`${API}/api/admin/gems/${gemForm.id}`, {
          method: "PUT",
          headers,
          body: JSON.stringify(payload),
        });
      } else {
        const r = await fetch(`${API}/api/admin/gems`, {
          method: "POST",
          headers,
          body: JSON.stringify(payload),
        });
        const data = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(data.error || data.message || "Create failed");
        if (data?.id) setGemForm((f) => ({ ...f, id: data.id }));
      }

      await loadAll();
    } catch (e2) {
      setError(e2.message);
    }
  }

  async function deleteGem(id) {
    if (!confirm("Delete this gem?")) return;
    setError("");
    try {
      const r = await fetch(`${API}/api/admin/gems/${id}`, { method: "DELETE", headers });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(data.error || data.message || "Delete failed");
      await loadAll();
    } catch (e2) {
      setError(e2.message);
    }
  }

  function clearGemForm() {
    setGemForm({
      id: null,
      name: "",
      gem_type: "",
      color: "",
      hardness: "",
      origin: "",
      description: "",
      image_url: "",
    });
    setGemImageFile(null);
  }

  async function uploadGemImage(gemId) {
    if (!gemId) return alert("Create/Save the gem first (must have an ID).");
    if (!gemImageFile) return alert("Choose an image file first.");

    setError("");
    try {
      const fd = new FormData();
      fd.append("image", gemImageFile);

      const r = await fetch(`${API}/api/admin/gems/${gemId}/image`, {
        method: "POST",
        headers: adminKey ? { "x-admin-key": adminKey } : {},
        body: fd,
      });

      const data = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(data.error || data.message || "Upload failed");

      setGemForm((f) => ({ ...f, image_url: data.image_url || f.image_url }));
      setGemImageFile(null);
      await loadAll();
      alert("Image uploaded successfully!");
    } catch (e2) {
      setError(e2.message);
    }
  }

  /* ---------- Locations CRUD ---------- */

  async function submitLoc(e) {
    e.preventDefault();
    setError("");

    const payload = {
      ...locForm,
      lat: Number(locForm.lat),
      lng: Number(locForm.lng),
    };

    try {
      if (locForm.id) {
        await fetch(`${API}/api/admin/locations/${locForm.id}`, {
          method: "PUT",
          headers,
          body: JSON.stringify(payload),
        });
      } else {
        const r = await fetch(`${API}/api/admin/locations`, {
          method: "POST",
          headers,
          body: JSON.stringify(payload),
        });
        const data = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(data.error || data.message || "Create failed");
      }
      clearLocForm();
      await loadAll();
    } catch (e2) {
      setError(e2.message);
    }
  }

  async function deleteLoc(id) {
    if (!confirm("Delete this location?")) return;
    setError("");
    try {
      const r = await fetch(`${API}/api/admin/locations/${id}`, { method: "DELETE", headers });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(data.error || data.message || "Delete failed");
      await loadAll();
    } catch (e2) {
      setError(e2.message);
    }
  }

  function clearLocForm() {
    setLocForm({
      id: null,
      name: "",
      location_type: "market",
      district: "",
      address: "",
      lat: "",
      lng: "",
      description: "",
    });
  }

  /* ---------- Chunks CRUD ---------- */

  async function submitChunk(e) {
    e.preventDefault();
    setError("");

    const payload = {
      ...chunkForm,
      entity_id: chunkForm.entity_id === "" ? null : Number(chunkForm.entity_id),
      reliability: Number(chunkForm.reliability),
    };

    try {
      if (chunkForm.id) {
        await fetch(`${API}/api/admin/chunks/${chunkForm.id}`, {
          method: "PUT",
          headers,
          body: JSON.stringify(payload),
        });
      } else {
        const r = await fetch(`${API}/api/admin/chunks`, {
          method: "POST",
          headers,
          body: JSON.stringify(payload),
        });
        const data = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(data.error || data.message || "Create failed");
      }
      clearChunkForm();
      await loadAll();
    } catch (e2) {
      setError(e2.message);
    }
  }

  async function deleteChunk(id) {
    if (!confirm("Delete this chunk?")) return;
    setError("");
    try {
      const r = await fetch(`${API}/api/admin/chunks/${id}`, { method: "DELETE", headers });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(data.error || data.message || "Delete failed");
      await loadAll();
    } catch (e2) {
      setError(e2.message);
    }
  }

  function clearChunkForm() {
    setChunkForm({
      id: null,
      entity_type: "general",
      entity_id: "",
      title: "",
      content: "",
      tags: "",
      source: "",
      reliability: 3,
      language: "en",
    });
  }

  return (
    <div>
      <HeroHeader
        title="Admin Panel"
        subtitle="Manage gems, locations, knowledge chunks and upload gem images."
        right={<span className="badge purple">Secure Admin</span>}
      />

      <div className="glass-card admin-section">
        <div className="row">
          <input
            className="input"
            value={adminKey}
            onChange={(e) => setAdminKey(e.target.value)}
            placeholder="Admin Key (x-admin-key)"
            style={{ maxWidth: 260 }}
          />
          <button className="button" onClick={saveKey}>Save Key</button>
          <button className="button secondary" onClick={loadAll}>Refresh</button>
        </div>

        {error && <div className="alert" style={{ marginTop: 12 }}>Admin error: {error}</div>}

        <div className="admin-tabs">
          <button className={`tab-btn ${tab === "gems" ? "active" : ""}`} onClick={() => setTab("gems")}>Gems</button>
          <button className={`tab-btn ${tab === "locations" ? "active" : ""}`} onClick={() => setTab("locations")}>Locations</button>
          <button className={`tab-btn ${tab === "chunks" ? "active" : ""}`} onClick={() => setTab("chunks")}>Knowledge Chunks</button>
        </div>
      </div>

      {/* ---------- GEMS ---------- */}
      {tab === "gems" && (
        <>
          <div className="glass-card admin-section" style={{ marginTop: 14 }}>
            <div className="form-label">{gemForm.id ? `Edit Gem #${gemForm.id}` : "Add New Gem"}</div>

            <form onSubmit={submitGem}>
              <div className="form-grid">
                <input className="input" placeholder="name*" value={gemForm.name} onChange={(e)=>setGemForm({...gemForm,name:e.target.value})}/>
                <input className="input" placeholder="gem_type*" value={gemForm.gem_type} onChange={(e)=>setGemForm({...gemForm,gem_type:e.target.value})}/>
                <input className="input" placeholder="color" value={gemForm.color} onChange={(e)=>setGemForm({...gemForm,color:e.target.value})}/>
                <input className="input" placeholder="hardness" value={gemForm.hardness} onChange={(e)=>setGemForm({...gemForm,hardness:e.target.value})}/>
                <input className="input" placeholder="origin" value={gemForm.origin} onChange={(e)=>setGemForm({...gemForm,origin:e.target.value})}/>
                <input className="input" placeholder="image_url (auto after upload)" value={gemForm.image_url} onChange={(e)=>setGemForm({...gemForm,image_url:e.target.value})}/>
              </div>

              <textarea className="textarea" placeholder="description" value={gemForm.description} onChange={(e)=>setGemForm({...gemForm,description:e.target.value})} style={{ marginTop: 10 }}/>

              <div className="row" style={{ marginTop: 12 }}>
                <input type="file" accept="image/*" onChange={(e)=>setGemImageFile(e.target.files?.[0] || null)} />
                <button type="button" className="button secondary" onClick={() => uploadGemImage(gemForm.id)} disabled={!gemForm.id}>
                  Upload Image (selected gem)
                </button>
                {!gemForm.id && <span style={{ color: "rgba(255,255,255,.75)", fontWeight: 700 }}>Create/Save gem first to upload.</span>}
              </div>

              {gemForm.image_url && (
                <div style={{ marginTop: 12 }}>
                  <span className="badge blue">Preview</span>
                  <div style={{ marginTop: 8 }}>
                    <img src={`${API}${gemForm.image_url}`} alt="preview" style={{ width: 200, borderRadius: 14, border: "1px solid rgba(255,255,255,.15)" }} />
                  </div>
                </div>
              )}

              <div className="form-actions">
                <button className="button" type="submit">{gemForm.id ? "Update" : "Create"}</button>
                <button className="button secondary" type="button" onClick={clearGemForm}>Clear</button>
              </div>
            </form>
          </div>

          <div className="glass-card admin-section table-wrap" style={{ marginTop: 14 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th><th>Name</th><th>Type</th><th>Color</th><th>Image</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {gems.map((g) => (
                  <tr key={g.id}>
                    <td>{g.id}</td>
                    <td style={{ fontWeight: 900 }}>{g.name}</td>
                    <td>{g.gem_type}</td>
                    <td>{g.color || "-"}</td>
                    <td>{g.image_url ? "Yes" : "No"}</td>
                    <td>
                      <button className="button secondary" onClick={() => setGemForm({
                        id: g.id,
                        name: g.name || "",
                        gem_type: g.gem_type || "",
                        color: g.color || "",
                        hardness: g.hardness ?? "",
                        origin: g.origin || "",
                        description: g.description || "",
                        image_url: g.image_url || "",
                      })}>Edit</button>{" "}
                      <button className="button danger" onClick={() => deleteGem(g.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ---------- LOCATIONS ---------- */}
      {tab === "locations" && (
        <>
          <div className="glass-card admin-section" style={{ marginTop: 14 }}>
            <div className="form-label">{locForm.id ? `Edit Location #${locForm.id}` : "Add New Location"}</div>

            <form onSubmit={submitLoc}>
              <div className="form-grid">
                <input className="input" placeholder="name*" value={locForm.name} onChange={(e)=>setLocForm({...locForm,name:e.target.value})}/>
                <select className="select" value={locForm.location_type} onChange={(e)=>setLocForm({...locForm,location_type:e.target.value})}>
                  <option value="market">market</option>
                  <option value="shop">shop</option>
                  <option value="mining">mining</option>
                </select>
                <input className="input" placeholder="district" value={locForm.district} onChange={(e)=>setLocForm({...locForm,district:e.target.value})}/>
                <input className="input" placeholder="address" value={locForm.address} onChange={(e)=>setLocForm({...locForm,address:e.target.value})}/>
                <input className="input" placeholder="lat*" value={locForm.lat} onChange={(e)=>setLocForm({...locForm,lat:e.target.value})}/>
                <input className="input" placeholder="lng*" value={locForm.lng} onChange={(e)=>setLocForm({...locForm,lng:e.target.value})}/>
              </div>

              <textarea className="textarea" placeholder="description" value={locForm.description} onChange={(e)=>setLocForm({...locForm,description:e.target.value})} style={{ marginTop: 10 }}/>

              <div className="form-actions">
                <button className="button" type="submit">{locForm.id ? "Update" : "Create"}</button>
                <button className="button secondary" type="button" onClick={clearLocForm}>Clear</button>
              </div>
            </form>
          </div>

          <div className="glass-card admin-section table-wrap" style={{ marginTop: 14 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th><th>Name</th><th>Type</th><th>District</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {locations.map((l) => (
                  <tr key={l.id}>
                    <td>{l.id}</td>
                    <td style={{ fontWeight: 900 }}>{l.name}</td>
                    <td><span className="badge">{l.location_type}</span></td>
                    <td>{l.district || "-"}</td>
                    <td>
                      <button className="button secondary" onClick={() => setLocForm({
                        id: l.id,
                        name: l.name || "",
                        location_type: l.location_type || "market",
                        district: l.district || "",
                        address: l.address || "",
                        lat: l.lat ?? "",
                        lng: l.lng ?? "",
                        description: l.description || "",
                      })}>Edit</button>{" "}
                      <button className="button danger" onClick={() => deleteLoc(l.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ---------- CHUNKS ---------- */}
      {tab === "chunks" && (
        <>
          <div className="glass-card admin-section" style={{ marginTop: 14 }}>
            <div className="form-label">{chunkForm.id ? `Edit Chunk #${chunkForm.id}` : "Add New Chunk"}</div>

            <form onSubmit={submitChunk}>
              <div className="form-grid">
                <select className="select" value={chunkForm.entity_type} onChange={(e)=>setChunkForm({...chunkForm,entity_type:e.target.value})}>
                  <option value="general">general</option>
                  <option value="gem">gem</option>
                  <option value="location">location</option>
                </select>
                <input className="input" placeholder="entity_id (optional)" value={chunkForm.entity_id} onChange={(e)=>setChunkForm({...chunkForm,entity_id:e.target.value})}/>
                <input className="input" placeholder="title*" value={chunkForm.title} onChange={(e)=>setChunkForm({...chunkForm,title:e.target.value})}/>
                <input className="input" placeholder="tags" value={chunkForm.tags} onChange={(e)=>setChunkForm({...chunkForm,tags:e.target.value})}/>
                <input className="input" placeholder="source" value={chunkForm.source} onChange={(e)=>setChunkForm({...chunkForm,source:e.target.value})}/>
                <input className="input" placeholder="language" value={chunkForm.language} onChange={(e)=>setChunkForm({...chunkForm,language:e.target.value})}/>
                <input className="input" placeholder="reliability (1-5)" value={chunkForm.reliability} onChange={(e)=>setChunkForm({...chunkForm,reliability:e.target.value})}/>
              </div>

              <textarea className="textarea" placeholder="content* (paragraphs)" value={chunkForm.content} onChange={(e)=>setChunkForm({...chunkForm,content:e.target.value})} style={{ marginTop: 10 }}/>

              <div className="form-actions">
                <button className="button" type="submit">{chunkForm.id ? "Update" : "Create"}</button>
                <button className="button secondary" type="button" onClick={clearChunkForm}>Clear</button>
              </div>
            </form>
          </div>

          <div className="glass-card admin-section table-wrap" style={{ marginTop: 14 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th><th>Type</th><th>Entity ID</th><th>Title</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {chunks.map((c) => (
                  <tr key={c.id}>
                    <td>{c.id}</td>
                    <td><span className="badge">{c.entity_type}</span></td>
                    <td>{c.entity_id ?? ""}</td>
                    <td style={{ fontWeight: 900 }}>{c.title}</td>
                    <td>
                      <button className="button secondary" onClick={() => setChunkForm({
                        id: c.id,
                        entity_type: c.entity_type || "general",
                        entity_id: c.entity_id ?? "",
                        title: c.title || "",
                        content: c.content || "",
                        tags: c.tags || "",
                        source: c.source || "",
                        reliability: c.reliability ?? 3,
                        language: c.language || "en",
                      })}>Edit</button>{" "}
                      <button className="button danger" onClick={() => deleteChunk(c.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}