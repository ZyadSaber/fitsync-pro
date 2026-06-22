"use client";

import { useRouter, usePathname } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import type { SubscriptionPlanType } from "@/types/subscriptions";

type Tab = "all" | SubscriptionPlanType;

const TABS: Tab[] = ["all", "gym", "online_coach"];

export default function PlanTypeTabs() {
  const { t } = useTranslation(undefined, { keyPrefix: "management.subscriptions" });
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const active = (searchParams.get("planType") ?? "all") as Tab;

  function select(tab: Tab) {
    const params = new URLSearchParams(searchParams.toString());
    if (tab === "all") {
      params.delete("planType");
    } else {
      params.set("planType", tab);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex items-center gap-1 p-1 bg-[var(--hairline2)] rounded-lg w-fit">
      {TABS.map((tab) => (
        <button
          key={tab}
          onClick={() => select(tab)}
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
