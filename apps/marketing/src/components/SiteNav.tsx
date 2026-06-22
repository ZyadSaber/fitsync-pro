import { Link } from "react-router";

export default function SiteNav() {
  return (
    <header
      style={{
        borderBottom: "1px solid var(--hairline)",
        background: "var(--surface)",
      }}
    >
      <nav
        style={{
          maxWidth: 1080,
          margin: "0 auto",
          padding: "16px 24px",
          display: "flex",
          alignItems: "center",
          gap: 24,
        }}
      >
        <Link to="/" style={{ fontWeight: 800, fontSize: 18, color: "var(--ink)", textDecoration: "none" }}>
          FitSync<span style={{ color: "var(--accent)" }}> Pro</span>
        </Link>
        <div style={{ display: "flex", gap: 18, marginInlineStart: "auto", alignItems: "center" }}>
          <Link to="/features" className="fs-nav" style={{ color: "var(--muted)" }}>
            Features
          </Link>
          <Link to="/pricing" className="fs-nav" style={{ color: "var(--muted)" }}>
            Pricing
          </Link>
          {/* Leaving the SSR marketing app to the dashboard SPA. */}
          <a href="/application" className="fs-btn accent">
            Open app
          </a>
        </div>
      </nav>
    </header>
  );
}
