export default function HeroHeader({ title, subtitle, right }) {
  return (
    <div className="hero">
      <div className="hero-inner">
        <div>
          <h1 className="hero-title">{title}</h1>
          {subtitle && <p className="hero-subtitle">{subtitle}</p>}
        </div>
        {right ? <div className="hero-right">{right}</div> : null}
      </div>
    </div>
  );
}