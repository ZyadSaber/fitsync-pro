import React from "react";
import MenuButton from "./MenuButton";
import SearchForm from "@/components/layout/SearchForm";
import i18n from "@/i18n";
import Icon from "@/components/ui/Icon";

interface HeaderContentProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  noSearch?: boolean;
}

const HeaderContent = ({ title, subtitle, actions, noSearch }: HeaderContentProps) => {
  const local = i18n.language;
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--hairline)] bg-white px-4 py-4 md:px-7 md:py-5 shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        <MenuButton />
        <div className="min-w-0">
          <h1 className="text-[18px] font-bold tracking-[-0.015em] m-0 md:text-[22px]">{title}</h1>
          {subtitle && <p className="text-xs text-[var(--muted)] mt-1">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {!noSearch && (
          <SearchForm placeholder={local === "ar" ? "بحث…" : "Search…"} />
        )}
        <button className="fs-btn ghost">
          <Icon name="bell" size={14} />
        </button>
        {actions}
      </div>
    </div>
  );
};

export default HeaderContent;
