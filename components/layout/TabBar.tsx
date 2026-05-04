import Icon from "@/components/ui/Icon";

type TabKey = "home" | "plan" | "qr" | "card" | "progress" | "checkin";

const GYM_TABS: [TabKey, string, string][] = [
  ["home",     "Home",     "home"],
  ["plan",     "Plan",     "dumbbell"],
  ["qr",       "Check-in", "qr"],
  ["card",     "Card",     "card"],
  ["progress", "Progress", "chart"],
];

const ONLINE_TABS: [TabKey, string, string][] = [
  ["home",     "Home",     "home"],
  ["plan",     "Plan",     "dumbbell"],
  ["checkin",  "Check-in", "check"],
  ["progress", "Progress", "chart"],
];

export default function TabBar({
  active = "home",
  online = false,
  dark = false,
}: {
  active?: TabKey;
  online?: boolean;
  dark?: boolean;
}) {
  const tabs = online ? ONLINE_TABS : GYM_TABS;

  return (
    <div
      style={{
        flexShrink: 0,
        display: "flex",
        justifyContent: "space-around",
        padding: "8px 8px 14px",
        background: dark ? "var(--ink2)" : "#fff",
        borderTop: `1px solid ${dark ? "rgba(255,255,255,0.06)" : "var(--hairline)"}`,
      }}
    >
      {tabs.map(([k, label, ico]) => {
        const isActive = active === k;
        const color = isActive
          ? dark ? "#fff" : "var(--text)"
          : dark ? "#6B7280" : "var(--muted)";
        return (
          <div
            key={k}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "4px 8px" }}
          >
            <Icon
              name={ico as Parameters<typeof Icon>[0]["name"]}
              size={18}
              color={color}
              stroke={isActive ? 2 : 1.6}
            />
            <span style={{ fontSize: 10, fontWeight: 600, color }}>{label}</span>
          </div>
        );
      })}
    </div>
  );
}
