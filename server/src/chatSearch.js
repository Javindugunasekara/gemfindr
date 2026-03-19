const pool = require("./db");

/* ---------------- CONFIG ---------------- */

const STOPWORDS = new Set([
  "what","is","are","the","a","an","about","tell","me","please",
  "where","can","i","find","in","near","to","of","for","and","or",
  "do","does","how","much","price","prices","gem","gems"
]);

const GENERIC_TERMS = new Set([
  "help","hi","hello","start","guide","info"
]);

/* ---------------- HELPERS ---------------- */

function normalizeMessageForSearch(text) {
  // remove "(shop)" "(mining)" etc.
  return (text || "")
    .replace(/\([^)]*\)/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractKeywords(text) {
  return (text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w));
}

function detectFocus(message) {
  const m = (message || "").toLowerCase();
  return {
    hardness: m.includes("hardness"),
    origin: m.includes("origin") || m.includes("from"),
    price: m.includes("price") || m.includes("cost"),
    where:
      m.includes("where") ||
      m.includes("location") ||
      m.includes("locations") ||
      m.includes("find") ||
      m.includes("near") ||
      m.includes("shop") ||
      m.includes("shops") ||
      m.includes("market") ||
      m.includes("markets") ||
      m.includes("mining"),
  };
}

function isGenericQuery(message, keywords) {
  const msg = (message || "").trim().toLowerCase();
  if (!msg) return true;
  if (!keywords || keywords.length === 0) return true;
  if (msg.length <= 6 && GENERIC_TERMS.has(msg)) return true;
  return false;
}

function isNoMatch(gems, locations, chunks) {
  return (
    (!gems || gems.length === 0) &&
    (!locations || locations.length === 0) &&
    (!chunks || chunks.length === 0)
  );
}

/* ---------------- LIST INTENTS (FIXED) ---------------- */

const LIST_WORDS = ["available", "list", "show", "all"];
const GEM_WORD_RE = /\b(gem|gems|gemstone|gemstones)\b/;
const LOC_WORD_RE = /\b(location|locations|market|markets|shop|shops|mining)\b/;

function isListGemsQuery(message) {
  const m = (message || "").toLowerCase().trim();

  // only word typed
  if (m === "gem" || m === "gems" || m === "gemstone" || m === "gemstones") return true;

  const hasListWord = LIST_WORDS.some((w) => m.includes(w));
  const hasGemWord = GEM_WORD_RE.test(m);
  const hasLocWord = LOC_WORD_RE.test(m);

  return hasListWord && hasGemWord && !hasLocWord;
}

function isListLocationsQuery(message) {
  const m = (message || "").toLowerCase().trim();

  // only word typed
  if (
    m === "location" || m === "locations" ||
    m === "shop" || m === "shops" ||
    m === "market" || m === "markets" ||
    m === "mining"
  ) return true;

  const hasListWord = LIST_WORDS.some((w) => m.includes(w));
  const hasLocWord = LOC_WORD_RE.test(m);

  return hasListWord && hasLocWord;
}

function detectLocationType(message) {
  const m = (message || "").toLowerCase();
  if (/\bshops?\b/.test(m)) return "shop";
  if (/\bmarkets?\b/.test(m)) return "market";
  if (/\bmining\b/.test(m)) return "mining";
  return null;
}

/* ---------------- LIST QUERIES ---------------- */

async function listGemsFromDb(limit = 20) {
  const lim = Math.max(1, Math.min(100, Number(limit) || 20));

  const [[countRow]] = await pool.query("SELECT COUNT(*) AS total FROM gems");
  const total = countRow.total || 0;

  if (total === 0) {
    return {
      answer: "There are no gems in the database yet. Add gems from Admin → Gems.",
      follow_up: true,
      list_type: "gems",
      suggestions: { gems: [], locations: [] },
      gems: [],
      locations: [],
      chunks: [],
    };
  }

  const [rows] = await pool.query(
    "SELECT id, name, gem_type, color, image_url FROM gems ORDER BY name ASC LIMIT ?",
    [lim]
  );

  let out = `✅ Available gems: ${total}\n\n`;
  rows.forEach((g, i) => {
    out += `${i + 1}) ${g.name} — ${g.gem_type || "-"} (${g.color || "-"})\n`;
  });

  if (total > rows.length) out += `\n…and ${total - rows.length} more.\n`;
  out += `\nTip: Click a gem below (or type the name) to get full details.`;

  return {
    answer: out,
    follow_up: true,
    list_type: "gems",
    suggestions: {
      gems: rows.map((r) => ({ id: r.id, name: r.name, image_url: r.image_url })),
      locations: [],
    },
    gems: [],
    locations: [],
    chunks: [],
  };
}

async function listLocationsFromDb(limit = 20, typeFilter = null) {
  const lim = Math.max(1, Math.min(100, Number(limit) || 20));

  let countSql = "SELECT COUNT(*) AS total FROM locations";
  let listSql = "SELECT id, name, location_type, district FROM locations";
  const params = [];

  if (typeFilter) {
    countSql += " WHERE location_type = ?";
    listSql += " WHERE location_type = ?";
    params.push(typeFilter);
  }

  listSql += " ORDER BY name ASC LIMIT ?";
  params.push(lim);

  const [[countRow]] = await pool.query(countSql, typeFilter ? [typeFilter] : []);
  const total = countRow.total || 0;

  if (total === 0) {
    return {
      answer: typeFilter
        ? `No ${typeFilter} locations found in the database.`
        : "There are no locations in the database yet. Add locations from Admin → Locations.",
      follow_up: true,
      list_type: "locations",
      suggestions: { gems: [], locations: [] },
      gems: [],
      locations: [],
      chunks: [],
    };
  }

  const [rows] = await pool.query(listSql, params);

  let label = "locations";
  if (typeFilter === "shop") label = "shops";
  if (typeFilter === "market") label = "markets";
  if (typeFilter === "mining") label = "mining locations";

  let out = `✅ Available ${label}: ${total}\n\n`;
  rows.forEach((l, i) => {
    out += `${i + 1}) ${l.name} — ${l.location_type || "-"} (${l.district || "-"})\n`;
  });

  if (total > rows.length) out += `\n…and ${total - rows.length} more.\n`;
  out += `\nTip: Click a location below (or type the name) to get full details.`;

  return {
    answer: out,
    follow_up: true,
    list_type: "locations",
    suggestions: {
      gems: [],
      locations: rows.map((r) => ({ id: r.id, name: r.name, location_type: r.location_type })),
    },
    gems: [],
    locations: [],
    chunks: [],
  };
}

/* ---------------- SUGGESTIONS (GEM IMAGES + LOCATION TYPE) ---------------- */

async function getSuggestions(term) {
  const t = (term || "").trim();
  const like = `%${t}%`;

  if (!t) {
    const [gems] = await pool.query(
      "SELECT id, name, image_url FROM gems ORDER BY id DESC LIMIT 5"
    );
    const [locations] = await pool.query(
      "SELECT id, name, location_type FROM locations ORDER BY id DESC LIMIT 5"
    );
    return { gems, locations };
  }

  const [gems] = await pool.query(
    "SELECT id, name, image_url FROM gems WHERE name LIKE ? OR gem_type LIKE ? OR color LIKE ? LIMIT 5",
    [like, like, like]
  );

  const [locations] = await pool.query(
    "SELECT id, name, location_type FROM locations WHERE name LIKE ? OR district LIKE ? OR address LIKE ? LIMIT 5",
    [like, like, like]
  );

  return { gems, locations };
}

/* ---------------- FULLTEXT SEARCH ---------------- */

async function searchChunksFulltext(q) {
  const [rows] = await pool.query(
    `SELECT id, entity_type, entity_id, title, content, tags, source, reliability,
            MATCH(title, content, tags) AGAINST (? IN NATURAL LANGUAGE MODE) AS score
     FROM knowledge_chunks
     WHERE MATCH(title, content, tags) AGAINST (? IN NATURAL LANGUAGE MODE)
     ORDER BY score DESC
     LIMIT 5`,
    [q, q]
  );
  return rows;
}

async function searchGemsFulltext(q) {
  const [rows] = await pool.query(
    `SELECT id, name, gem_type, color, hardness, origin, description, image_url,
            MATCH(name, gem_type, color, origin, description) AGAINST (? IN NATURAL LANGUAGE MODE) AS score
     FROM gems
     WHERE MATCH(name, gem_type, color, origin, description) AGAINST (? IN NATURAL LANGUAGE MODE)
     ORDER BY score DESC
     LIMIT 5`,
    [q, q]
  );
  return rows;
}

async function searchLocationsFulltext(q) {
  const [rows] = await pool.query(
    `SELECT id, name, location_type, district, address, lat, lng, description,
            MATCH(name, district, address, description) AGAINST (? IN NATURAL LANGUAGE MODE) AS score
     FROM locations
     WHERE MATCH(name, district, address, description) AGAINST (? IN NATURAL LANGUAGE MODE)
     ORDER BY score DESC
     LIMIT 5`,
    [q, q]
  );
  return rows;
}

/* ---------------- LIKE FALLBACK SEARCH ---------------- */

async function searchGemsLike(keywords) {
  if (!keywords || keywords.length === 0) return [];
  const likes = keywords.map((k) => `%${k}%`);
  const where = keywords
    .map(() => `(name LIKE ? OR gem_type LIKE ? OR color LIKE ? OR origin LIKE ? OR description LIKE ?)`)
    .join(" OR ");

  const params = [];
  for (const l of likes) params.push(l, l, l, l, l);

  const [rows] = await pool.query(
    `SELECT id, name, gem_type, color, hardness, origin, description, image_url
     FROM gems
     WHERE ${where}
     LIMIT 5`,
    params
  );
  return rows;
}

async function searchLocationsLike(keywords) {
  if (!keywords || keywords.length === 0) return [];
  const likes = keywords.map((k) => `%${k}%`);

  // ✅ includes location_type LIKE too
  const where = keywords
    .map(() => `(name LIKE ? OR location_type LIKE ? OR district LIKE ? OR address LIKE ? OR description LIKE ?)`)
    .join(" OR ");

  const params = [];
  for (const l of likes) params.push(l, l, l, l, l);

  const [rows] = await pool.query(
    `SELECT id, name, location_type, district, address, lat, lng, description
     FROM locations
     WHERE ${where}
     LIMIT 5`,
    params
  );
  return rows;
}

/* ---------------- ANSWER FORMATTER ---------------- */

function addChunks(out, chunks) {
  if (!chunks || chunks.length === 0) return out;

  out += "\n\n📚 Research Knowledge (Top Matches):\n";
  chunks.slice(0, 3).forEach((c, i) => {
    out += `${i + 1}) ${c.title}\n`;
    out += `Source: ${c.source || "N/A"} | Reliability: ${(c.reliability ?? 3)}/5\n`;
    out += `${c.content}\n\n`;
  });

  return out.trim();
}

function formatLocationDetail(bestLoc, locations, chunks) {
  let out = `📍 Location details (best match):\n`;
  out += `Name: ${bestLoc.name}\n`;
  out += `Type: ${bestLoc.location_type || "-"}\n`;
  out += `District: ${bestLoc.district || "-"}\n`;
  out += `Address: ${bestLoc.address || "-"}\n`;
  out += `Coordinates: ${bestLoc.lat}, ${bestLoc.lng}\n`;
  out += `Details: ${bestLoc.description || "-"}\n`;

  if (locations.length > 1) {
    out += `\nOther close matches:\n`;
    locations.slice(1, 4).forEach((l, i) => {
      out += `${i + 1}) ${l.name} (${l.location_type || "-"}) - ${l.district || "-"}\n`;
    });
  }

  return addChunks(out, chunks);
}

function formatAnswer(message, keywords, gems, locations, chunks) {
  const focus = detectFocus(message);
  const bestGem = gems?.[0];
  const bestLoc = locations?.[0];

  // ✅ if location focus OR only location found => show location details
  if ((focus.where && bestLoc) || (bestLoc && (!gems || gems.length === 0))) {
    return formatLocationDetail(bestLoc, locations, chunks);
  }

  // gems
  if (bestGem) {
    let out = `💎 Gem profile (best match):\n`;
    out += `Name: ${bestGem.name}\n`;
    out += `Type: ${bestGem.gem_type || "-"}\n`;
    out += `Color: ${bestGem.color || "-"}\n`;
    out += `Hardness: ${bestGem.hardness || "-"}\n`;
    out += `Origin: ${bestGem.origin || "-"}\n`;
    out += `Details: ${bestGem.description || "-"}\n`;
    if (bestGem.image_url) out += `Image: ${bestGem.image_url}\n`;

    return addChunks(out, chunks);
  }

  if (chunks && chunks.length > 0) {
    return addChunks("I found relevant knowledge from the research database.", chunks);
  }

  return `I couldn't find matching results in the database.`;
}

/* ---------------- MAIN SEARCH ---------------- */

async function searchDatabase(message) {
  // ✅ clean message first (removes "(shop)" etc.)
  const cleanMessage = normalizeMessageForSearch(message);

  const keywords = extractKeywords(cleanMessage);
  const query = keywords.join(" ");

  // ✅ list intents (LOCATIONS FIRST)
  if (isListLocationsQuery(cleanMessage)) {
    const type = detectLocationType(cleanMessage);
    return await listLocationsFromDb(20, type);
  }

  if (isListGemsQuery(cleanMessage)) {
    return await listGemsFromDb(20);
  }

  // generic input
  if (isGenericQuery(cleanMessage, keywords)) {
    let suggestions = await getSuggestions("");
    return {
      answer:
        "What do you want to know?\n\n" +
        "• For gems: type a gem name (Blue Sapphire, Ruby)\n" +
        "• For locations: type 'shops', 'markets', 'mining', or a place name\n\n" +
        "You can also click a suggestion below:",
      follow_up: true,
      suggestions,
      keywords,
      gems: [],
      locations: [],
      chunks: []
    };
  }

  let chunks = [];
  let gems = [];
  let locations = [];

  // FULLTEXT searches
  try {
    if (query) {
      chunks = await searchChunksFulltext(query);
      gems = await searchGemsFulltext(query);
      locations = await searchLocationsFulltext(query);
    }
  } catch (e) {}

  // LIKE fallback
  if ((gems.length === 0 && locations.length === 0) && keywords.length > 0) {
    gems = await searchGemsLike(keywords);
    locations = await searchLocationsLike(keywords);
  }

  if (isNoMatch(gems, locations, chunks)) {
    const suggestions = await getSuggestions("");
    return {
      answer:
        "I couldn't find that in the GemFindr database.\n\n" +
        "Try: 'available gems', 'available locations', 'shops', 'markets', 'mining', or a gem/location name.",
      follow_up: true,
      no_match: true,
      suggestions,
      keywords,
      gems: [],
      locations: [],
      chunks: []
    };
  }

  const answer = formatAnswer(cleanMessage, keywords, gems, locations, chunks);
  return { answer, keywords, gems, locations, chunks, follow_up: false };
}

module.exports = { searchDatabase };