"use client";

const HOURS = Array.from({ length: 17 }, (_, i) => i + 6); // 6 am – 10 pm

const DEMO: number[] = [2, 8, 14, 22, 31, 27, 19, 12, 24, 38, 42, 35, 18, 9, 15, 21, 11];

export default function CheckinBarChart({
  data = DEMO,
  currentHour = new Date().getHours(),
}: {
  data?: number[];
  currentHour?: number;
}) {
  const max = Math.max(...data, 1);
  const CHART_H = 72;
  const BAR_W = 14;
  const GAP = 5;
  const TOTAL_W = HOURS.length * (BAR_W + GAP) - GAP;

  return (
    <svg
      viewBox={`0 0 ${TOTAL_W} ${CHART_H + 18}`}
      preserveAspectRatio="none"
      style={{ width: "100%", height: CHART_H + 18, overflow: "visible", display: "block" }}
    >
      {HOURS.map((h, i) => {
        const count = data[i] ?? 0;
        const barH = Math.max((count / max) * CHART_H, count > 0 ? 3 : 0);
        const x = i * (BAR_W + GAP);
        const isCurrent = h === currentHour;
        const isPast = h < currentHour;

        return (
          <g key={h}>
            <rect
              x={x}
              y={CHART_H - barH}
              width={BAR_W}
              height={barH}
              rx={3}
              fill={
                isCurrent
                  ? "var(--accent)"
                  : isPast
                  ? "#C7D2FE"
                  : "var(--hairline)"
              }
            />
            {h % 4 === 0 && (
              <text
                x={x + BAR_W / 2}
                y={CHART_H + 13}
                textAnchor="middle"
                fontSize={8.5}
                fill="var(--muted2)"
              >
                {h === 12 ? "12p" : h > 12 ? `${h - 12}p` : `${h}a`}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
