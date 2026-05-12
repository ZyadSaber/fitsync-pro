import Avatar from "./Avatar";
import Ring from "./Ring";
import SparkLine from "./SparkLine";

export default function ClientCard({
  name,
  plan,
  week,
  compliance = 0,
  lastSeen = "",
  weight = [],
  flag = false,
  online = false,
}: {
  name: string;
  plan: string;
  week?: number;
  compliance?: number;
  lastSeen?: string;
  weight?: number[];
  flag?: boolean;
  online?: boolean;
}) {
  const trendUp = weight.length > 1 && weight[weight.length - 1] > weight[0];
  const delta =
    weight.length > 1
      ? Math.abs(weight[weight.length - 1] - weight[0]).toFixed(1)
      : "0.0";

  return (
    <div className="fs-card" style={{ padding: 16, position: "relative", display: "flex", flexDirection: "column", gap: 14 }}>
      {flag && (
        <span
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "var(--red)",
          }}
          title="3+ days inactive"
        />
      )}
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <Avatar name={name} size="lg" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", lineHeight: 1.2 }}>{name}</div>
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2, display: "flex", gap: 6, alignItems: "center" }}>
            <span>{plan}</span>
            {week != null && (
              <>
                <span>·</span>
                <span>Week {week}</span>
              </>
            )}
          </div>
        </div>
        <Ring value={compliance} size={42} stroke={4} />
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderTop: "1px solid var(--hairline2)",
          paddingTop: 12,
        }}
      >
        <div>
          <div style={{ fontSize: 10, fontWeight: 600, color: "var(--muted)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Weight
          </div>
          <div className="fs-num" style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginTop: 2 }}>
            {weight[weight.length - 1] ?? "—"} kg{" "}
            {weight.length > 1 && (
              <span style={{ color: trendUp ? "var(--red)" : "var(--green)", fontSize: 11 }}>
                {trendUp ? "↑" : "↓"} {delta}
              </span>
            )}
          </div>
        </div>
        <SparkLine data={weight} width={80} height={24} />
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 11, color: "var(--muted)" }}>
        <span>Last seen {lastSeen}</span>
        {online && (
          <span style={{ color: "var(--accent)", fontWeight: 600 }}>Online client</span>
        )}
      </div>
    </div>
  );
}
