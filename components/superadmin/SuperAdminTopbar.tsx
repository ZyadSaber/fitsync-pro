import Icon from "@/components/ui/Icon";

interface SuperAdminTopbarProps {
  title: string;
  subtitle?: string;
  crumbs?: string[];
  actions?: React.ReactNode;
}

export default function SuperAdminTopbar({
  title,
  subtitle,
  crumbs,
  actions,
}: SuperAdminTopbarProps) {
  return (
    <div
      className="shrink-0"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "20px 28px",
        borderBottom: "1px solid var(--hairline)",
        background: "#fff",
      }}
    >
      <div>
        {crumbs && (
          <div
            className="fs-mono"
            style={{
              fontSize: 11,
              color: "var(--muted)",
              marginBottom: 6,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            {crumbs.map((c, i) => (
              <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                {i > 0 && <span style={{ color: "var(--muted2)" }}>/</span>}
                <span style={{ color: i === crumbs.length - 1 ? "var(--ink)" : "var(--muted)" }}>
                  {c}
                </span>
              </span>
            ))}
          </div>
        )}
        <h1
          style={{
            fontSize: 22,
            fontWeight: 700,
            margin: 0,
            letterSpacing: "-0.015em",
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>{subtitle}</div>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ position: "relative" }}>
          <span
            style={{
              position: "absolute",
              left: 10,
              top: 11,
              color: "var(--muted2)",
              pointerEvents: "none",
            }}
          >
            <Icon name="search" size={14} />
          </span>
          <input
            className="fs-input"
            placeholder="Jump to gym, coach, invoice…"
            style={{ paddingLeft: 32, width: 280 }}
          />
          <span
            className="fs-mono"
            style={{
              position: "absolute",
              right: 8,
              top: 8,
              fontSize: 10,
              color: "var(--muted2)",
              border: "1px solid var(--hairline)",
              borderRadius: 4,
              padding: "1px 5px",
              background: "#fff",
            }}
          >
            ⌘K
          </span>
        </div>

        <button className="fs-btn ghost">
          <Icon name="bell" size={14} />
          <span style={{ fontSize: 11, color: "var(--red)", fontWeight: 700 }}>3</span>
        </button>

        {actions}
      </div>
    </div>
  );
}
