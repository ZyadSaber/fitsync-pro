"use client";

import getTranslations from "@/i18n/lib/getTranslations";
import type { SubscriptionPlanType } from "@/types/subscriptions";

type Tab = "all" | SubscriptionPlanType;

const TABS: Tab[] = ["all", "gym", "online_coach"];

interface Props {
  active: Tab;
  onSelect: (tab: Tab) => void;
}

export default function PlanTypeTabs({ active, onSelect }: Props) {
  const t = getTranslations("management.subscriptions");

  return (
    <div className="flex items-center gap-1 p-1 bg-[var(--hairline2)] rounded-lg w-fit">
      {TABS.map((tab) => (
        <button
          key={tab}
          onClick={() => onSelect(tab)}
          className={[
            "px-3 py-1 text-xs font-medium rounded-md transition-colors",
            active === tab
              ? "bg-white text-[var(--ink)] shadow-sm"
              : "text-muted hover:text-[var(--ink)]",
          ].join(" ")}
        >
          {t(`plans.type.${tab}` as `plans.type.all`)}
        </button>
      ))}
    </div>
  );
}
