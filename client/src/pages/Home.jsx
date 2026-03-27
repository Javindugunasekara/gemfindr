import { Link } from "react-router-dom";
import HeroHeader from "../components/HeroHeader";

export default function Home() {
  return (
    <div>
      <HeroHeader
        title="Welcome to GemFindr"
        subtitle="Explore gemstones, find gem locations, and learn using a database-grounded chatbot."
        right={<span className="badge purple">AI Based Education Platform</span>}
      />

      <div className="grid grid-3">
        <div className="glass-card admin-section">
          <div className="kpi">
            <b>Gem Catalogue</b>
            <span style={{ color: "rgba(255,255,255,.78)", fontWeight: 650 }}>
              Browse gem profiles with images and key properties.
            </span>
          </div>
        </div>

        <div className="glass-card admin-section">
          <div className="kpi">
            <b>Location Directory</b>
            <span style={{ color: "rgba(255,255,255,.78)", fontWeight: 650 }}>
              Markets, shops, and mining points with coordinates.
            </span>
          </div>
        </div>

        <div className="glass-card admin-section">
          <div className="kpi">
            <b>Research Chatbot</b>
            <span style={{ color: "rgba(255,255,255,.78)", fontWeight: 650 }}>
              Answers grounded in your database knowledge chunks.
            </span>
          </div>
        </div>
      </div>

      <div className="row" style={{ marginTop: 14 }}>
        <Link className="button" to="/gems">Explore Gems</Link>
        <Link className="button secondary" to="/chat">Ask Chatbot</Link>
      </div>
    </div>
  );
}