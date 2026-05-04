import Icon from "./Icon";

const DIFF_COLORS: Record<string, string> = {
  Beginner: "var(--green)",
  Intermediate: "var(--amber)",
  Advanced: "var(--red)",
};

export default function ExerciseCard({
  name,
  muscles = [],
  difficulty = "Intermediate",
  equip,
}: {
  name: string;
  muscles?: string[];
  difficulty?: string;
  equip?: string;
}) {
  return (
    <div className="fs-card" style={{ overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <div
        style={{
          height: 110,
          background: "repeating-linear-gradient(135deg, var(--hairline2) 0 8px, var(--paper) 8px 16px)",
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: "50%",
            background: "rgba(11,15,26,0.92)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon name="play" size={14} color="#fff" />
        </div>
        <span
          className="fs-mono"
          style={{ position: "absolute", bottom: 6, left: 8, fontSize: 9, color: "var(--muted)" }}
        >
          YT_THUMB
        </span>
      </div>
      <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", lineHeight: 1.2 }}>{name}</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {muscles.map((m) => (
            <span
              key={m}
              style={{
                fontSize: 10,
                fontWeight: 500,
                padding: "2px 6px",
                borderRadius: 3,
                background: "var(--hairline2)",
                color: "var(--text)",
              }}
            >
              {m}
            </span>
          ))}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 11,
            color: "var(--muted)",
            borderTop: "1px solid var(--hairline2)",
            paddingTop: 8,
          }}
        >
          <span style={{ color: DIFF_COLORS[difficulty] ?? "var(--amber)", fontWeight: 600 }}>{difficulty}</span>
          <span>{equip}</span>
        </div>
      </div>
    </div>
  );
}
