import Icon from "@/components/ui/Icon";

type IconName = Parameters<typeof Icon>[0]["name"];

export default function EmptyState({
  icon,
  title,
  body,
  primary,
  secondary,
}: {
  icon: IconName;
  title: string;
  body: string;
  primary?: { label: string; icon: IconName };
  secondary?: { label: string; icon: IconName };
}) {
  return (
    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 40 }}>
      <div
        style={{
          maxWidth: 420,
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
        }}
      >
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 16,
            background: "#fff",
            border: "1px solid var(--hairline)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          <Icon name={icon} size={28} color="var(--text)" />
          <div
            style={{
              position: "absolute",
              inset: -16,
              borderRadius: 22,
              background: "repeating-linear-gradient(135deg, transparent 0 6px, var(--hairline2) 6px 7px)",
              zIndex: -1,
              opacity: 0.6,
            }}
          />
        </div>
        <div className="fs-eyebrow">Empty state</div>
        <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0, letterSpacing: "-0.01em" }}>{title}</h2>
        <p style={{ fontSize: 13, color: "var(--muted)", margin: 0, lineHeight: 1.55 }}>{body}</p>
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          {primary && (
            <button className="fs-btn accent">
              <Icon name={primary.icon} size={13} color="#fff" />
              {primary.label}
            </button>
          )}
          {secondary && (
            <button className="fs-btn ghost">
              <Icon name={secondary.icon} size={13} />
              {secondary.label}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
