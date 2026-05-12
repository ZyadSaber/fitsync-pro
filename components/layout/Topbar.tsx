import React from "react";
import MenuButton from "@/components/layout/MenuButton";
import SearchForm from "@/components/layout/SearchForm";
import { getLocale } from "next-intl/server";
import Icon from "../ui/Icon";

interface HeaderContentProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  noSearch?: boolean;
}

const HeaderContent = async ({ title, subtitle, actions, noSearch }: HeaderContentProps) => {
  const local = await getLocale();
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
