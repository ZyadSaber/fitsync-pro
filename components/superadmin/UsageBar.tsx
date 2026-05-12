export default function UsageBar({
  used,
  limit,
  height = 6,
  showLabel = true,
  compact = false,
}: {
  used: number;
  limit: number;
  height?: number;
  showLabel?: boolean;
  compact?: boolean;
}) {
  const pct = Math.min(100, Math.round((used / limit) * 100));
  const color =
    pct >= 95 ? "var(--red)" : pct >= 80 ? "var(--amber)" : "var(--accent)";

  return (
    <div style={{ width: "100%" }}>
      {showLabel && (
        <div
          className="fs-mono"
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: compact ? 10 : 11,
            marginBottom: 4,
            color: "var(--muted)",
          }}
        >
          <span style={{ color: pct >= 80 ? color : "var(--ink)", fontWeight: 600 }}>
            {used.toLocaleString()} / {limit.toLocaleString()}
          </span>
          <span style={{ color, fontWeight: 600 }}>{pct}%</span>
        </div>
      )}
      <div
        style={{
          height,
          background: "var(--hairline2)",
          borderRadius: 999,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: color,
            borderRadius: 999,
          }}
        />
      </div>
    </div>
  );
}
