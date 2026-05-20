export type Plan =
  | "Trial"
  | "Starter"
  | "Pro"
  | "Elite"
  | "Custom"
  | "Coach Solo"
  | "Coach Pro";

const PLAN_COLOR: Record<Plan, string> = {
  "Trial":      "#D97706",
  "Starter":    "#475569",
  "Pro":        "#2D5BFF",
  "Elite":      "#0B0F1A",
  "Custom":     "#6D28D9",
  "Coach Solo": "#059669",
  "Coach Pro":  "#047857",
};

interface PlanBadgeProps {
  plan: Plan;
}

export default function PlanBadge({ plan }: PlanBadgeProps) {
  const color = PLAN_COLOR[plan] ?? "var(--muted)";
  return (
    <span
      className="fs-badge"
      style={{
        background: `${color}18`,
        color,
        borderColor: `${color}30`,
      }}
    >
      {plan}
    </span>
  );
}
