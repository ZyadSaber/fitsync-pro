export default function SiteFooter() {
  return (
    <footer style={{ borderTop: "1px solid var(--hairline)", background: "var(--surface)", marginTop: 64 }}>
      <div
        style={{
          maxWidth: 1080,
          margin: "0 auto",
          padding: "28px 24px",
          color: "var(--muted)",
          fontSize: 13,
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <span>© {new Date().getFullYear()} FitSync Pro — Egypt-first gym & coaching platform.</span>
        <span>Built with Vite SSR + Express.</span>
      </div>
    </footer>
  );
}
