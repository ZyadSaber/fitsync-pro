"use client";

import { Link } from "@/i18n/navigation";
import Icon from "@/components/ui/Icon";

type Role = "admin" | "coach";

interface SidebarProps {
  active?: string;
  role?: Role;
  locale?: string;
  /** @deprecated use locale instead */
  dir?: "ltr" | "rtl";
  isOpen?: boolean;
  onClose?: () => void;
}

const ADMIN_ITEMS: [string, string, string][] = [
  ["/admin",          "Dashboard",      "home"],
  ["/admin/members",  "Members",        "users"],
  ["/admin/plans",    "Plans",          "card"],
  ["/admin/offers",   "Offers",         "tag"],
  ["/admin/checkins", "Live check-ins", "qr"],
  ["/admin/staff",    "Staff",          "user"],
];

const COACH_ITEMS: [string, string, string][] = [
  ["/coach",           "Dashboard",       "home"],
  ["/coach/clients",   "Clients",         "users"],
  ["/coach/exercises", "Exercise library","dumbbell"],
  ["/coach/workouts",  "Workouts",        "chart"],
  ["/coach/nutrition", "Nutrition",       "flame"],
];

const ADMIN_ITEMS_AR: [string, string, string][] = [
  ["/admin",          "لوحة التحكم",   "home"],
  ["/admin/members",  "الأعضاء",        "users"],
  ["/admin/plans",    "الباقات",         "card"],
  ["/admin/offers",   "العروض",          "tag"],
  ["/admin/checkins", "تسجيل الدخول",   "qr"],
  ["/admin/staff",    "الفريق",          "user"],
];

const COACH_ITEMS_AR: [string, string, string][] = [
  ["/coach",           "لوحة التحكم",    "home"],
  ["/coach/clients",   "العملاء",         "users"],
  ["/coach/exercises", "مكتبة التمارين",  "dumbbell"],
  ["/coach/workouts",  "التمارين",        "chart"],
  ["/coach/nutrition", "التغذية",         "flame"],
];

export default function Sidebar({
  active = "dashboard",
  role = "admin",
  locale,
  dir,
  isOpen = false,
  onClose,
}: SidebarProps) {
  const isRtl = locale ? locale === "ar" : dir === "rtl";
  const items = role === "admin"
    ? (isRtl ? ADMIN_ITEMS_AR : ADMIN_ITEMS)
    : (isRtl ? COACH_ITEMS_AR : COACH_ITEMS);

  const brand       = isRtl ? "فِت‑سِنك برو"         : "FitSync Pro";
  const gym         = isRtl ? "نادي القاهرة الرياضي" : "Cairo Fit · Zamalek";
  const profile     = role === "admin"
    ? (isRtl ? "منى خالد"      : "Mona Khaled")
    : (isRtl ? "أحمد المدرّب" : "Ahmed Coach");
  const profileRole = role === "admin"
    ? (isRtl ? "مديرة النادي" : "Gym admin")
    : (isRtl ? "المدرّب"      : "Coach");

  return (
    <aside
      className={[
        // Layout & size
        "w-[220px] h-full shrink-0",
        "flex flex-col gap-6 px-3 py-5",
        // Colors
        "bg-[var(--ink)] text-[#C7CDD9]",
        // Desktop: static in flow; mobile/tablet: fixed overlay
        "lg:relative lg:translate-x-0",
        "fixed inset-y-0 start-0 z-50",
        // Slide in/out on mobile/tablet
        isOpen ? "translate-x-0" : isRtl ? "translate-x-full" : "-translate-x-full",
        "transition-transform duration-250 ease-in-out",
        !isOpen ? "max-lg:pointer-events-none" : "",
      ].join(" ")}
    >
      {/* Brand + mobile close button */}
      <div className="flex items-center gap-2.5 px-2 py-1">
        <div className="w-7 h-7 rounded-[6px] bg-[var(--accent)] flex items-center justify-center shrink-0">
          <Icon name="logo" size={18} color="#fff" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-bold text-white tracking-[-0.01em]">{brand}</div>
          <div className="text-[10px] text-[#9AA1AE]">{gym}</div>
        </div>
        {/* Close button — mobile/tablet only */}
        {onClose && (
          <button
            onClick={onClose}
            className="flex h-6 w-6 items-center justify-center rounded opacity-60 hover:opacity-100 lg:hidden"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M1 1l10 10M11 1L1 11" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>

      {/* Nav items */}
      <div className="flex flex-col gap-0.5">
        {items.map(([href, label, ico]) => (
          <Link
            key={href}
            href={href}
            onClick={onClose}
            className={`fs-nav ${active === href ? "active" : ""}`}
          >
            <Icon name={ico as Parameters<typeof Icon>[0]["name"]} size={15} />
            <span>{label}</span>
          </Link>
        ))}
      </div>

      {/* Profile footer */}
      <div className="mt-auto flex items-center gap-2.5 px-2 py-3 border-t border-white/[0.08]">
        <div className="fs-av w-8 h-8 text-xs shrink-0">
          {profile.charAt(0)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-xs font-semibold text-white">{profile}</div>
          <div className="text-[10px] text-[#9AA1AE]">{profileRole}</div>
        </div>
        <Icon name="more" size={14} color="#9AA1AE" />
      </div>
    </aside>
  );
}
