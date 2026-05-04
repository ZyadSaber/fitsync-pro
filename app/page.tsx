import Link from "next/link";
import Icon from "@/components/ui/Icon";

const ROUTES = [
  { href: "/admin",            label: "Admin Dashboard",           sub: "Desktop · LTR",         role: "admin" },
  { href: "/admin/members",    label: "Member List",               sub: "Desktop · filterable",   role: "admin" },
  { href: "/coach",            label: "Coach Dashboard",           sub: "Desktop · 8 clients",    role: "coach" },
  { href: "/coach/exercises",  label: "Exercise Library",          sub: "Desktop · 12 exercises", role: "coach" },
  { href: "/app",              label: "Client Home",               sub: "Mobile · gym + online",  role: "client" },
  { href: "/app/plan",         label: "My Plan",                   sub: "Mobile · workout log",   role: "client" },
];

const ROLE_COLORS: Record<string, string> = {
  admin:  "#2D5BFF",
  coach:  "#D97706",
  client: "#16A34A",
};

export default function IndexPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--ink)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 40,
        gap: 32,
      }}
    >
      {/* Brand header */}
      <div style={{ textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 12 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: "var(--accent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon name="logo" size={26} color="#fff" />
          </div>
          <span style={{ fontSize: 28, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>
            FitSync Pro
          </span>
        </div>
        <p style={{ fontSize: 14, color: "#9AA1AE", margin: 0 }}>
          Egypt-first gym management &amp; online coaching platform
        </p>
      </div>

      {/* Route grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 16,
          maxWidth: 720,
          width: "100%",
        }}
      >
        {ROUTES.map(({ href, label, sub, role }) => (
          <Link
            key={href}
            href={href}
            style={{
              background: "var(--ink2)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 10,
              padding: "18px 20px",
              textDecoration: "none",
              display: "flex",
              flexDirection: "column",
              gap: 8,
              transition: "border-color .15s",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: ROLE_COLORS[role],
                }}
              >
                {role}
              </span>
              <Icon name="arrow-right" size={14} color="#9AA1AE" />
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>{label}</div>
            <div style={{ fontSize: 11, color: "#9AA1AE" }}>{sub}</div>
            <div className="fs-mono" style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", marginTop: 2 }}>
              {href}
            </div>
          </Link>
        ))}
      </div>

      <p style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", margin: 0 }}>
        Stack: Next.js 15 · Supabase · Tailwind CSS · shadcn/ui
      </p>
    </div>
  );
}
