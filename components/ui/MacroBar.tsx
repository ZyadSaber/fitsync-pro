function Macro({ color, label, value }: { color: string; label: string; value: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <span style={{ width: 6, height: 6, borderRadius: 1, background: color }} />
      <span style={{ color: "var(--muted)", fontWeight: 500 }}>{label}</span>
      <span className="fs-num" style={{ fontWeight: 600, color: "var(--text)" }}>{value}g</span>
    </div>
  );
}

export default function MacroBar({
  protein = 0,
  carbs = 0,
  fats = 0,
}: {
  protein?: number;
  carbs?: number;
  fats?: number;
}) {
  const total = protein + carbs + fats || 1;
  const seg = (v: number) => `${(v / total) * 100}%`;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%" }}>
      <div style={{ display: "flex", height: 8, borderRadius: 4, overflow: "hidden", background: "var(--hairline2)" }}>
        <div style={{ width: seg(protein), background: "var(--accent)" }} />
        <div style={{ width: seg(carbs), background: "#F59E0B" }} />
        <div style={{ width: seg(fats), background: "var(--text)" }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
        <Macro color="var(--accent)" label="Protein" value={protein} />
        <Macro color="#F59E0B" label="Carbs" value={carbs} />
        <Macro color="var(--text)" label="Fats" value={fats} />
      </div>
    </div>
  );
}
