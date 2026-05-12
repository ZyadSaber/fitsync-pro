export type Plan = "Trial" | "Starter" | "Pro" | "Elite" | "Custom";

const STYLES: Record<Plan, { bg: string; fg: string }> = {
  Trial:   { bg: "#FBF1E0", fg: "#D97706" },
  Starter: { bg: "#EEF1F4", fg: "#475569" },
  Pro:     { bg: "#EAF0FF", fg: "#2D5BFF" },
  Elite:   { bg: "#0B0F1A", fg: "#ffffff" },
  Custom:  { bg: "#F4EFFF", fg: "#6D28D9" },
};

export default function PlanBadge({ plan }: { plan: Plan }) {
  const s = STYLES[plan] ?? STYLES.Starter;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        height: 22,
        padding: "0 8px",
        borderRadius: 4,
        background: s.bg,
        color: s.fg,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.02em",
        whiteSpace: "nowrap",
      }}
    >
      {plan}
    </span>
  );
}
