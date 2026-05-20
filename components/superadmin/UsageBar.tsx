import { Progress } from "@/components/ui/progress";

export default function UsageBar({
  used,
  limit,
  height = 6,
  showLabel = true,
  compact,
}: {
  used: number;
  limit: number;
  height?: number;
  showLabel?: boolean;
  compact?: boolean;
}) {
  const pct = limit === 0 ? 0 : Math.min(100, Math.round((used / limit) * 100));

  const indicatorColor =
    pct >= 95 ? "bg-red-600" : pct >= 80 ? "bg-amber-600" : "bg-[var(--accent)]";

  const labelColor =
    pct >= 95
      ? "text-red-600"
      : pct >= 80
      ? "text-amber-600"
      : "text-[var(--accent)]";

  const effectiveShowLabel = showLabel && !compact;

  return (
    <div className="w-full space-y-1">
      {effectiveShowLabel && (
        <div className="fs-mono flex items-center justify-between text-[11px]">
          <span
            className={`font-semibold ${pct >= 80 ? labelColor : "text-[var(--ink)]"}`}
          >
            {used.toLocaleString()}
            <span className="text-[var(--muted)] font-normal mx-0.5">/</span>
            {limit.toLocaleString()}
          </span>
          <span className={`font-semibold tabular-nums ${labelColor}`}>
            {pct}%
          </span>
        </div>
      )}

      <Progress
        value={pct}
        className="bg-[var(--hairline2)]"
        indicatorClassName={indicatorColor}
        style={{ height }}
      />
    </div>
  );
}
