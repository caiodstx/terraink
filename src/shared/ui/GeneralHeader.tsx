export default function GeneralHeader() {
  return (
    <header className="general-header">
      <div className="desktop-brand">
        <img
          className="desktop-brand-logo brand-logo"
          src="/assets/logo.svg"
          alt="Mapagrama logo"
        />
        <div className="desktop-brand-copy brand-copy">
          <h1 className="desktop-brand-title">Mapagrama</h1>
          <p className="desktop-brand-kicker app-kicker">
            Custom Map Posters
          </p>
        </div>
      </div>
    </header>
  );
}
