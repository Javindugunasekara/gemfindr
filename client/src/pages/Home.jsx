export default function Home() {
  return (
    <div className="grid" style={{ gap: 16 }}>
      <div className="card card-pad">
        <div className="page-head">
          <div>
            <h1 className="page-title">Welcome to GemFindr</h1>
            <p className="page-subtitle">
              Explore gemstones, find gem locations, and learn using a database-grounded chatbot.
            </p>
          </div>

          <span className="badge purple">AI Based Education Platform</span>
        </div>

        <div className="grid grid-3">
          <div className="card card-pad">
            <div className="kpi">
              <b>Gem Catalogue</b>
              <span>Browse gem profiles with images and key properties.</span>
            </div>
          </div>
          <div className="card card-pad">
            <div className="kpi">
              <b>Location Directory</b>
              <span>Markets, shops, and mining points with coordinates.</span>
            </div>
          </div>
          <div className="card card-pad">
            <div className="kpi">
              <b>Research Chatbot</b>
              <span>Answers grounded in your database knowledge chunks.</span>
            </div>
          </div>
        </div>

        <div className="row" style={{ marginTop: 14 }}>
          <a className="button" href="/gems">Explore Gems</a>
          <a className="button secondary" href="/chat">Ask Chatbot</a>
        </div>
      </div>
    </div>
  );
}