import type Icon from "@/components/ui/Icon";

export type Role = "admin" | "coach" | "superadmin";

export type AuthRole = "super_admin" | "gym" | "coach" | "member" | "client";

type IconName = Parameters<typeof Icon>[0]["name"];

// A localized string: a single value (same in both languages) or [en, ar].
export type Bilingual = string | [en: string, ar: string];

export const pick = (value: Bilingual, isRtl: boolean) =>
  Array.isArray(value) ? (isRtl ? value[1] : value[0]) : value;

export interface NavItem {
  href: string;
  icon: IconName;
  label: Bilingual;
}

export interface RoleConfig {
  items: NavItem[];
  brand: Bilingual;
  subtitle: Bilingual;
  profile: Bilingual;
  profileRole: Bilingual;
}

// Canonical nav config — the single source of truth for sidebar sections + URLs,
// shared by Sidebar (rendering) and DashboardShell (section → role plumbing).
export const CONFIG: Record<Role, RoleConfig> = {
  superadmin: {
    items: [
      { href: "/management", icon: "home", label: "Overview" },
      { href: "/management/gyms", icon: "users", label: "Gyms" },
      { href: "/management/coaches", icon: "user", label: "Online coaches" },
      { href: "/management/subscriptions", icon: "card", label: "Subscriptions" },
      { href: "/management/activity", icon: "chart", label: "Activity" },
    ],
    brand: "FitSync HQ",
    subtitle: "platform · super admin",
    profile: "Yara Sherif",
    profileRole: "Platform owner",
  },
  admin: {
    items: [
      { href: "/admin", icon: "home", label: ["Dashboard", "لوحة التحكم"] },
      { href: "/admin/members", icon: "users", label: ["Members", "الأعضاء"] },
      { href: "/admin/plans", icon: "card", label: ["Plans", "الباقات"] },
      { href: "/admin/offers", icon: "tag", label: ["Offers", "العروض"] },
      { href: "/admin/checkins", icon: "qr", label: ["Live check-ins", "تسجيل الدخول"] },
      { href: "/admin/staff", icon: "user", label: ["Staff", "الفريق"] },
    ],
    brand: ["FitSync Pro", "فِت‑سِنك برو"],
    subtitle: ["Cairo Fit · Zamalek", "نادي القاهرة الرياضي"],
    profile: ["Mona Khaled", "منى خالد"],
    profileRole: ["Gym admin", "مديرة النادي"],
  },
  coach: {
    items: [
      { href: "/coach", icon: "home", label: ["Dashboard", "لوحة التحكم"] },
      { href: "/coach/clients", icon: "users", label: ["Clients", "العملاء"] },
      { href: "/coach/exercises", icon: "dumbbell", label: ["Exercise library", "مكتبة التمارين"] },
      { href: "/coach/workouts", icon: "chart", label: ["Workouts", "التمارين"] },
      { href: "/coach/nutrition", icon: "flame", label: ["Nutrition", "التغذية"] },
    ],
    brand: ["FitSync Pro", "فِت‑سِنك برو"],
    subtitle: ["Cairo Fit · Zamalek", "نادي القاهرة الرياضي"],
    profile: ["Ahmed Coach", "أحمد المدرّب"],
    profileRole: ["Coach", "المدرّب"],
  },
};

// Where each authenticated role lands after sign-in.
export const ROLE_HOME: Record<AuthRole, string> = {
  super_admin: "/management",
  gym: "/admin",
  coach: "/coach",
  member: "/member",
  client: "/client",
};

// The route section the shell is mounted under maps to a Sidebar role/config.
// A section's nav items are therefore CONFIG[SECTION_ROLE[section]].items.
export const SECTION_ROLE = {
  management: "superadmin",
  admin: "admin",
  coach: "coach",
} satisfies Record<string, Role>;

export type SectionKey = keyof typeof SECTION_ROLE;
