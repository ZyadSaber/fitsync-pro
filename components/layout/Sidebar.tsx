import Link from "next/link";
import Icon from "@/components/ui/Icon";
import Avatar from "@/components/ui/Avatar";

type Role = "admin" | "coach";

interface SidebarProps {
  active?: string;
  role?: Role;
  dir?: "ltr" | "rtl";
}

const ADMIN_ITEMS: [string, string, string][] = [
  ["/admin",              "Dashboard",      "home"],
  ["/admin/members",      "Members",        "users"],
  ["/admin/plans",        "Plans",          "card"],
  ["/admin/offers",       "Offers",         "tag"],
  ["/admin/checkins",     "Live check-ins", "qr"],
  ["/admin/staff",        "Staff",          "user"],
];

const COACH_ITEMS: [string, string, string][] = [
  ["/coach",              "Dashboard",      "home"],
  ["/coach/clients",      "Clients",        "users"],
  ["/coach/exercises",    "Exercise library","dumbbell"],
  ["/coach/workouts",     "Workouts",       "chart"],
  ["/coach/nutrition",    "Nutrition",      "flame"],
];

const ADMIN_ITEMS_AR: [string, string, string][] = [
  ["/admin",              "لوحة التحكم",   "home"],
  ["/admin/members",      "الأعضاء",        "users"],
  ["/admin/plans",        "الباقات",         "card"],
  ["/admin/offers",       "العروض",          "tag"],
  ["/admin/checkins",     "تسجيل الدخول",   "qr"],
  ["/admin/staff",        "الفريق",          "user"],
];

export default function Sidebar({ active = "dashboard", role = "admin", dir = "ltr" }: SidebarProps) {
  const isRtl = dir === "rtl";
  const items = role === "admin"
    ? (isRtl ? ADMIN_ITEMS_AR : ADMIN_ITEMS)
    : COACH_ITEMS;

  const brand   = isRtl ? "فِت‑سِنك برو"          : "FitSync Pro";
  const gym     = isRtl ? "نادي القاهرة الرياضي"  : "Cairo Fit · Zamalek";
  const profile = role === "admin"
    ? (isRtl ? "منى خالد" : "Mona Khaled")
    : (isRtl ? "أحمد المدرّب" : "Ahmed Coach");
  const profileRole = role === "admin"
    ? (isRtl ? "مديرة النادي" : "Gym admin")
    : (isRtl ? "المدرّب" : "Coach");

  return (
    <aside
      style={{
        width: 220,
        background: "var(--ink)",
        color: "#C7CDD9",
        padding: "20px 12px",
        display: "flex",
        flexDirection: "column",
        gap: 24,
        height: "100%",
        flexShrink: 0,
      }}
    >
      {/* Brand */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 8px" }}>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 6,
            background: "var(--accent)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon name="logo" size={18} color="#fff" />
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", letterSpacing: "-0.01em" }}>{brand}</div>
          <div style={{ fontSize: 10, color: "#9AA1AE" }}>{gym}</div>
        </div>
      </div>

      {/* Nav items */}
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {items.map(([href, label, ico]) => (
          <Link
            key={href}
            href={href}
            className={`fs-nav ${active === href ? "active" : ""}`}
          >
            <Icon name={ico as Parameters<typeof Icon>[0]["name"]} size={15} />
            <span>{label}</span>
          </Link>
        ))}
      </div>

      {/* Profile footer */}
      <div
        style={{
          marginTop: "auto",
          padding: "12px 8px",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <Avatar name={profile} size="md" />
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#fff" }}>{profile}</div>
          <div style={{ fontSize: 10, color: "#9AA1AE" }}>{profileRole}</div>
        </div>
        <Icon name="more" size={14} color="#9AA1AE" />
      </div>
    </aside>
  );
}
