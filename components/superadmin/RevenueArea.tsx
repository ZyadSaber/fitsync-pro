export default function RevenueArea({
  data,
  height = 150,
}: {
  data: number[];
  height?: number;
}) {
  const w = 660;
  const min = Math.min(...data) * 0.9;
  const max = Math.max(...data) * 1.05;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = height - ((v - min) / (max - min)) * (height - 16) - 8;
    return [x, y] as [number, number];
  });
  const linePath = pts
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`)
    .join(" ");
  const areaPath = `${linePath} L${w},${height} L0,${height} Z`;
  const last = pts[pts.length - 1];

  return (
    <svg
      width="100%"
      height={height}
      viewBox={`0 0 ${w} ${height}`}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="sa-rev-grad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="var(--accent)" stopOpacity="0.18" />
          <stop offset="1" stopColor="var(--accent)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((g) => (
        <line
          key={g}
          x1="0"
          x2={w}
          y1={height * g}
          y2={height * g}
          stroke="var(--hairline2)"
          strokeDasharray="2 4"
        />
      ))}
      <path d={areaPath} fill="url(#sa-rev-grad)" />
      <path
        d={linePath}
        fill="none"
        stroke="var(--accent)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx={last[0]}
        cy={last[1]}
        r="4"
        fill="#fff"
        stroke="var(--accent)"
        strokeWidth="2"
      />
    </svg>
  );
}
