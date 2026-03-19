const natural = require("natural");
const pool = require("./db");

let docs = [];          // [{type, id, title, text}]
let tfidf = null;       // TF-IDF model

async function buildIndex() {
  docs = [];
  tfidf = new natural.TfIdf();

  // Load gems
  const [gems] = await pool.query("SELECT id, name, gem_type, color, hardness, origin, description FROM gems");
  gems.forEach((g) => {
    const text = `
      Gem: ${g.name}
      Type: ${g.gem_type || ""}
      Color: ${g.color || ""}
      Hardness: ${g.hardness || ""}
      Origin: ${g.origin || ""}
      Description: ${g.description || ""}
    `.trim();

    docs.push({ type: "gem", id: g.id, title: g.name, text });
    tfidf.addDocument(text);
  });

  // Load locations
  const [locs] = await pool.query("SELECT id, name, location_type, district, address, lat, lng, description FROM locations");
  locs.forEach((l) => {
    const text = `
      Location: ${l.name}
      Type: ${l.location_type || ""}
      District: ${l.district || ""}
      Address: ${l.address || ""}
      Coordinates: ${l.lat}, ${l.lng}
      Description: ${l.description || ""}
    `.trim();

    docs.push({ type: "location", id: l.id, title: l.name, text });
    tfidf.addDocument(text);
  });

  console.log(`Chat index built. Docs: ${docs.length}`);
}

function topK(query, k = 3) {
  if (!tfidf) return [];

  const scores = [];
  tfidf.tfidfs(query, (i, measure) => {
    scores.push({ i, score: measure });
  });

  scores.sort((a, b) => b.score - a.score);
  return scores
    .filter((x) => x.score > 0)
    .slice(0, k)
    .map((x) => docs[x.i]);
}

function makeAnswer(userMsg, contexts) {
  if (contexts.length === 0) {
    return {
      answer:
        "I couldn’t find a matching gem/location in the database. Try asking with a gem name (e.g., Blue Sapphire) or a district (e.g., Ratnapura).",
      contexts: [],
    };
  }

  // Simple answer using retrieved context (research component = retrieval + grounded answer)
  const lines = [];
  lines.push("Here’s what I found from the GemFindr database:\n");

  contexts.forEach((c, idx) => {
    lines.push(`(${idx + 1}) ${c.type.toUpperCase()}: ${c.title}`);
    lines.push(c.text);
    lines.push("");
  });

  // Add a small safety/quality note
  lines.push("Note: This is educational info from the current database. For certification/valuation, consult a gem professional.");
const natural = require("natural");
const pool = require("./db");

let docs = [];          // [{type, id, title, text}]
let tfidf = null;       // TF-IDF model

async function buildIndex() {
  docs = [];
  tfidf = new natural.TfIdf();

  // Load gems
  const [gems] = await pool.query("SELECT id, name, gem_type, color, hardness, origin, description FROM gems");
  gems.forEach((g) => {
    const text = `
      Gem: ${g.name}
      Type: ${g.gem_type || ""}
      Color: ${g.color || ""}
      Hardness: ${g.hardness || ""}
      Origin: ${g.origin || ""}
      Description: ${g.description || ""}
    `.trim();

    docs.push({ type: "gem", id: g.id, title: g.name, text });
    tfidf.addDocument(text);
  });

  // Load locations
  const [locs] = await pool.query("SELECT id, name, location_type, district, address, lat, lng, description FROM locations");
  locs.forEach((l) => {
    const text = `
      Location: ${l.name}
      Type: ${l.location_type || ""}
      District: ${l.district || ""}
      Address: ${l.address || ""}
      Coordinates: ${l.lat}, ${l.lng}
      Description: ${l.description || ""}
    `.trim();

    docs.push({ type: "location", id: l.id, title: l.name, text });
    tfidf.addDocument(text);
  });

  console.log(`Chat index built. Docs: ${docs.length}`);
}

function topK(query, k = 3) {
  if (!tfidf) return [];

  const scores = [];
  tfidf.tfidfs(query, (i, measure) => {
    scores.push({ i, score: measure });
  });

  scores.sort((a, b) => b.score - a.score);
  return scores
    .filter((x) => x.score > 0)
    .slice(0, k)
    .map((x) => docs[x.i]);
}

function makeAnswer(userMsg, contexts) {
  if (contexts.length === 0) {
    return {
      answer:
        "I couldn’t find a matching gem/location in the database. Try asking with a gem name (e.g., Blue Sapphire) or a district (e.g., Ratnapura).",
      contexts: [],
    };
  }

  // Simple answer using retrieved context (research component = retrieval + grounded answer)
  const lines = [];
  lines.push("Here’s what I found from the GemFindr database:\n");

  contexts.forEach((c, idx) => {
    lines.push(`(${idx + 1}) ${c.type.toUpperCase()}: ${c.title}`);
    lines.push(c.text);
    lines.push("");
  });

  // Add a small safety/quality note
  lines.push("Note: This is educational info from the current database. For certification/valuation, consult a gem professional.");

  return { answer: lines.join("\n"), contexts };
}

module.exports = { buildIndex, topK, makeAnswer };

  return { answer: lines.join("\n"), contexts };
}

module.exports = { buildIndex, topK, makeAnswer };
