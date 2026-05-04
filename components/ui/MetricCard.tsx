import Icon from "./Icon";

export default function MetricCard({
  label,
  value,
  trend,
  trendDir = "up",
  sub,
}: {
  label: string;
  value: string;
  trend?: string;
  trendDir?: "up" | "down" | "flat";
  sub?: string;
}) {
  return (
    <div className="fs-metric">
      <div className="metric-label">{label}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
        <div className="metric-value fs-num">{value}</div>
        {trend && (
          <div className={`metric-trend ${trendDir} fs-num`}>
            <Icon
              name={trendDir === "up" ? "arrow-up" : trendDir === "down" ? "arrow-down" : "arrow-right"}
              size={12}
            />
            {trend}
          </div>
        )}
      </div>
      {sub && <div className="metric-sub">{sub}</div>}
    </div>
  );
}
