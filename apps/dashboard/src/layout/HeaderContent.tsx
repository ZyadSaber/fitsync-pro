import React from "react";
import { useIsFetching, useQueryClient } from "@tanstack/react-query";
import MenuButton from "./MenuButton";
import i18n from "@/i18n";
import Icon from "@/components/ui/Icon";
import { Input } from "@/components/ui/input";

interface HeaderContentProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  noSearch?: boolean;
  value?: string;
  onChange?: any;
  onSearch?: (value: string) => void;
}

const HeaderContent = ({ title, subtitle, actions, noSearch, value, onChange, onSearch }: HeaderContentProps) => {
  const local = i18n.language;
  const queryClient = useQueryClient();
  const isFetching = useIsFetching();
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
          <div className="relative hidden sm:block">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--muted2)] pointer-events-none">
              <Icon name="search" size={14} />
            </span>
            <Input
              name="searchQuery.value"
              value={value ?? ""}
              onChange={onChange}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  const { value, type } = e.currentTarget;
                  onChange({ ...e, target: { name: "searchQuery.search", value, type } });
                }
              }}
              className="fs-input pl-8 w-[180px] md:w-[220px]"
              placeholder={local === "ar" ? "بحث…" : "Search…"}
            />
          </div>
        )}
        <button
          className="fs-btn ghost"
          onClick={() => queryClient.invalidateQueries()}
          disabled={isFetching > 0}
          title={local === "ar" ? "تحديث" : "Refresh"}
          aria-label={local === "ar" ? "تحديث" : "Refresh"}
        >
          <span className={isFetching > 0 ? "animate-spin" : undefined}>
            <Icon name="refresh" size={14} />
          </span>
        </button>
        <button className="fs-btn ghost">
          <Icon name="bell" size={14} />
        </button>
        {actions}
      </div>
    </div>
  );
};

export default HeaderContent;
