const COLORS = ["#EEF0F4", "#C7D2FE", "#6B85FF", "#2D5BFF"];

export default function CheckinHeatmap({
  weeks = 12,
  data,
}: {
  weeks?: number;
  data?: number[];
}) {
  const cells = data ?? Array.from({ length: weeks * 7 }, (_, i) =>
    [0, 1, 2, 3, 2, 1, 0, 3, 2, 1, 3, 0, 2, 3, 1, 2, 0, 3, 1, 2, 3][i % 21]
  );

  return (
    <div
      style={{
        display: "grid",
        gridTemplateRows: "repeat(7, 12px)",
        gridAutoFlow: "column",
        gridAutoColumns: "12px",
        gap: 3,
      }}
    >
      {cells.map((v, i) => (
        <div key={i} style={{ background: COLORS[v], borderRadius: 2 }} />
      ))}
    </div>
  );
}
