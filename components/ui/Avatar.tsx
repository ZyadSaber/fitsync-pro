const BG_COLORS = ["#0B0F1A", "#1E293B", "#334155", "#0F172A", "#111827"];

export default function Avatar({
  name = "?",
  size = "md",
  role,
}: {
  name?: string;
  size?: "md" | "lg" | "xl";
  role?: "coach" | "admin" | "client";
}) {
  const cls = size === "lg" ? "fs-av lg" : size === "xl" ? "fs-av xl" : "fs-av";
  const i = ((name.charCodeAt(0) ?? 0) + (name.charCodeAt(1) ?? 0)) % BG_COLORS.length;
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0])
    .join("")
    .toUpperCase();

  const roleColor =
    role === "coach" ? "var(--accent)" : role === "admin" ? "var(--amber)" : "var(--green)";

  return (
    <span className={cls} style={{ background: BG_COLORS[i] }}>
      {initials}
      {role && (
        <span className="role" style={{ background: roleColor }} />
      )}
    </span>
  );
}
