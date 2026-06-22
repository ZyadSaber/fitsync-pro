import { Link } from "@/i18n/navigation";
import Icon from "@/components/ui/Icon";
import { CONFIG, pick, type Role } from "@/constants/navigation";

interface SidebarProps {
  active?: string;
  role?: Role;
  locale?: string;
  /** @deprecated use locale instead */
  dir?: "ltr" | "rtl";
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({
  active = "dashboard",
  role = "admin",
  locale,
  dir,
  isOpen = false,
  onClose,
}: SidebarProps) {
  const isRtl = locale ? locale === "ar" : dir === "rtl";
  const isSuper = role === "superadmin";
  const cfg = CONFIG[role];
  const profile = pick(cfg.profile, isRtl);

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
        <div
          className="w-7 h-7 rounded-[6px] flex items-center justify-center shrink-0"
          style={{ background: isSuper ? "#fff" : "var(--accent)" }}
        >
          <Icon name="logo" size={18} color={isSuper ? "var(--ink)" : "#fff"} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-bold text-white tracking-[-0.01em]">{pick(cfg.brand, isRtl)}</div>
          <div className="text-[10px] text-[#9AA1AE]">{pick(cfg.subtitle, isRtl)}</div>
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
        {cfg.items.map(({ href, icon, label }) => (
          <Link
            key={href}
            href={href}
            onClick={onClose}
            className={`fs-nav ${active === href ? "active" : ""}`}
          >
            <Icon name={icon} size={15} />
            <span>{pick(label, isRtl)}</span>
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
          <div className="text-[10px] text-[#9AA1AE]">{pick(cfg.profileRole, isRtl)}</div>
        </div>
        <Icon name="more" size={14} color="#9AA1AE" />
      </div>
    </aside>
  );
}
