"use client";

import { usePathname } from "next/navigation";
import { Link } from "@/i18n/navigation";
import Icon from "@/components/ui/Icon";

type NavItem = [string, string, string, string?];

const PLATFORM: NavItem[] = [
  ["/management", "Overview", "home"],
];

const TENANTS: NavItem[] = [
  ["/management/gyms",    "Gyms",           "home",  "142"],
  ["/management/coaches", "Online coaches", "users", "318"],
];

const BILLING: NavItem[] = [
  ["/management/subscriptions", "Subscriptions",  "card"],
  ["/management/quotas",        "Quotas & usage", "chart"],
  ["/management/revenue",       "Revenue",        "tag"],
];

const SYSTEM: NavItem[] = [
  ["/management/audit",    "Audit log", "filter"],
  ["/management/settings", "Settings",  "user"],
];

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

interface SuperAdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function SuperAdminSidebar({
  isOpen = false,
  onClose,
}: SuperAdminSidebarProps) {
  const pathname = usePathname();

  function isActive(href: string) {
    const clean = pathname.replace(/^\/(ar|en)/, "");
    if (href === "/management") return clean === "/management";
    return clean.startsWith(href);
  }

  function NavGroup({
    label,
    items,
  }: {
    label: string;
    items: NavItem[];
  }) {
    return (
      <div>
        <div
          style={{
            fontSize: 10,
            color: "#5C636F",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            padding: "12px 12px 4px",
            fontWeight: 700,
          }}
        >
          {label}
        </div>
        {items.map(([href, itemLabel, ico, count]) => (
          <Link
            key={href}
            href={href as "/management"}
            onClick={onClose}
            className={`fs-nav ${isActive(href) ? "active" : ""}`}
            style={
              count
                ? {
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }
                : {}
            }
          >
            <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
              <Icon
                name={ico as Parameters<typeof Icon>[0]["name"]}
                size={15}
              />
              <span>{itemLabel}</span>
            </span>
            {count && (
              <span
                className="fs-mono"
                style={{ fontSize: 10, color: "#9AA1AE" }}
              >
                {count}
              </span>
            )}
          </Link>
        ))}
      </div>
    );
  }

  return (
    <aside
      className={[
        "shrink-0 h-full",
        "flex flex-col gap-[22px] py-5 px-3",
        "bg-[var(--ink)] text-[#C7CDD9]",
        "lg:relative lg:translate-x-0",
        "fixed inset-y-0 start-0 z-50",
        isOpen ? "translate-x-0" : "-translate-x-full",
        "transition-transform duration-250 ease-in-out",
        !isOpen ? "max-lg:pointer-events-none" : "",
      ].join(" ")}
      style={{ width: 232 }}
    >
      {/* Brand */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 8px" }}>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 6,
            background: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Icon name="logo" size={18} color="var(--ink)" />
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", letterSpacing: "-0.01em" }}>
            FitSync HQ
          </div>
          <div className="fs-mono" style={{ fontSize: 10, color: "#9AA1AE" }}>
            platform · super admin
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="ms-auto flex h-6 w-6 items-center justify-center rounded opacity-60 hover:opacity-100 lg:hidden"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M1 1l10 10M11 1L1 11" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>

      {/* Env switcher */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 10px",
          background: "rgba(255,255,255,0.04)",
          borderRadius: 6,
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "var(--green)",
            flexShrink: 0,
          }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, color: "#fff", fontWeight: 600 }}>Production</div>
          <div className="fs-mono" style={{ fontSize: 9, color: "#9AA1AE" }}>
            eg-cairo-1 · v4.18.2
          </div>
        </div>
        <Icon name="arrow-right" size={12} color="#9AA1AE" />
      </div>

      {/* Nav groups */}
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <NavGroup label="Platform" items={PLATFORM} />
        <NavGroup label="Tenants" items={TENANTS} />
        <NavGroup label="Billing" items={BILLING} />
        <NavGroup label="System" items={SYSTEM} />
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
        <div className="fs-av" style={{ background: "#4B3F8A", flexShrink: 0 }}>
          {initials("Yara Sherif")}
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#fff" }}>Yara Sherif</div>
          <div style={{ fontSize: 10, color: "#9AA1AE" }}>Platform owner · 2FA on</div>
        </div>
        <Icon name="more" size={14} color="#9AA1AE" />
      </div>
    </aside>
  );
}
