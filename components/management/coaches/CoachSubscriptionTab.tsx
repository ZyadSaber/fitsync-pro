"use client";

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import { api } from "@/apps/dashboard/src/lib/api";
import { API } from "@/constants/apiRoutes";
import type { PlatformSubscriptionDetails } from "@/types/gyms";

interface Props {
  coachId: string;
}

const subBadge: Record<string, string> = {
  active: "active",
  suspended: "pending",
  cancelled: "expired",
};

const billingBadge: Record<string, string> = {
  paid: "active",
  pending: "pending",
  failed: "expired",
  refunded: "frozen",
};

const fmt = (iso: string | null | undefined) =>
  iso ? format(new Date(iso), "d MMM yyyy") : "—";

async function fetchSubscription(coachId: string): Promise<PlatformSubscriptionDetails | null> {
  return api.get<PlatformSubscriptionDetails | null>(API.coaches.subscription(coachId));
}

export default function CoachSubscriptionTab({ coachId }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: "management.coaches.dialog" });
  const { t: tCoaches } = useTranslation(undefined, { keyPrefix: "management.coaches" });

  const { data: sub, isFetching } = useQuery({
    queryKey: ["coach-subscription", coachId],
    queryFn: () => fetchSubscription(coachId),
    staleTime: 30_000,
  });

  const fmtMoney = (n: number | null | undefined) =>
    n != null ? `${Number(n).toLocaleString("en-EG")} ${tCoaches("currency")}` : "—";

  if (isFetching) return <p className="py-10 text-center text-sm text-[var(--muted)]">{t("loading")}</p>;
  if (!sub) return <p className="py-10 text-center text-sm text-[var(--muted)]">{t("subscription.noSubscription")}</p>;

  const grid = [
    [t("subscription.price"),        fmtMoney(sub.price_egp)],
    [t("subscription.billingCycle"), <span key="bc" className="capitalize">{sub.billing_cycle}</span>],
    [t("subscription.memberLimit"),  sub.member_limit != null ? sub.member_limit.toLocaleString() : t("subscription.unlimited")],
    [t("subscription.startedAt"),    fmt(sub.started_at)],
  ] as const;

  return (
    <div className="flex flex-col gap-4">
      {/* Plan + status */}
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-[var(--muted)]">{t("subscription.plan")}</span>
          <span className="font-semibold text-sm">{sub.plan_name ?? "—"}</span>
        </div>
        <span className={`fs-badge ${subBadge[sub.status] ?? ""}`}>
          {tCoaches(`billing.${sub.status}`)}
        </span>
      </div>

      <div className="h-px bg-[var(--hairline)]" />

      {/* Details grid */}
      <div className="grid grid-cols-2 gap-3">
        {grid.map(([label, value]) => (
          <div key={String(label)} className="flex flex-col gap-0.5">
            <span className="text-xs text-[var(--muted)]">{label}</span>
            <span className="text-sm font-medium fs-num">{value}</span>
          </div>
        ))}
      </div>

      {/* Current period */}
      {sub.current_period_start && (
        <>
          <div className="h-px bg-[var(--hairline)]" />
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-[var(--muted)]">{t("subscription.currentPeriod")}</span>
            <span className="text-sm font-medium">
              {fmt(sub.current_period_start)} → {fmt(sub.current_period_end)}
            </span>
          </div>
        </>
      )}

      {/* Billing status */}
      {sub.billing_status && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-[var(--muted)]">{t("subscription.billingStatus")}</span>
          <span className={`fs-badge ${billingBadge[sub.billing_status] ?? ""}`}>
            {sub.billing_status}
          </span>
        </div>
      )}

      {/* Features */}
      {sub.features?.length > 0 && (
        <>
          <div className="h-px bg-[var(--hairline)]" />
          <div className="flex flex-col gap-1.5">
            <span className="text-xs text-[var(--muted)]">{t("subscription.features")}</span>
            <div className="flex flex-wrap gap-1.5">
              {sub.features.map((f) => <span key={f} className="fs-badge">{f}</span>)}
            </div>
          </div>
        </>
      )}

      {/* Notes */}
      {sub.notes && (
        <p className="text-xs text-[var(--muted)] italic border border-[var(--hairline)] rounded-lg px-3 py-2">
          {sub.notes}
        </p>
      )}
    </div>
  );
}
