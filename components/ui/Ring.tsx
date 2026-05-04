export default function Ring({
  value = 0,
  size = 56,
  stroke = 5,
}: {
  value?: number;
  size?: number;
  stroke?: number;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c - (value / 100) * c;
  const color =
    value >= 75 ? "var(--green)" : value >= 40 ? "var(--amber)" : "var(--red)";

  return (
    <div style={{ position: "relative", width: size, height: size, display: "inline-block" }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--hairline)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={c}
          strokeDashoffset={off}
          strokeLinecap="round"
        />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          lineHeight: 1,
        }}
      >
        <span className="fs-num" style={{ fontSize: size > 60 ? 15 : 12, fontWeight: 700, color: "var(--text)" }}>
          {value}
        </span>
        <span style={{ fontSize: 8, color: "var(--muted)", fontWeight: 600, letterSpacing: "0.06em" }}>%</span>
      </div>
    </div>
  );
}
