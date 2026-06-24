"use client";

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import { api } from "@/apps/dashboard/src/lib/api";
import { API } from "@/constants/apiRoutes";
import type { PlatformBillingRecord } from "@/types/gyms";

interface Props {
  coachId: string;
}

const billingBadge: Record<string, string> = {
  paid: "active",
  pending: "pending",
  failed: "expired",
  refunded: "frozen",
};

const fmt = (iso: string | null | undefined) =>
  iso ? format(new Date(iso), "d MMM yyyy") : "—";

async function fetchBilling(coachId: string): Promise<PlatformBillingRecord[]> {
  return api.get<PlatformBillingRecord[]>(API.coaches.billing(coachId));
}

export default function CoachBillingTab({ coachId }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: "management.coaches.dialog" });
  const { t: tCoaches } = useTranslation(undefined, { keyPrefix: "management.coaches" });

  const { data: records = [], isFetching } = useQuery({
    queryKey: ["coach-billing", coachId],
    queryFn: () => fetchBilling(coachId),
    staleTime: 30_000,
  });

  const fmtMoney = (n: number) =>
    `${Number(n).toLocaleString("en-EG")} ${tCoaches("currency")}`;

  if (isFetching) return <p className="py-10 text-center text-sm text-[var(--muted)]">{t("loading")}</p>;
  if (records.length === 0) return <p className="py-10 text-center text-sm text-[var(--muted)]">{t("billing.noRecords")}</p>;

  return (
    <div className="flex flex-col divide-y divide-[var(--hairline2)] max-h-72 overflow-y-auto">
      {records.map((r) => (
        <div key={r.id} className="flex items-center justify-between py-3 gap-3">
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="text-sm font-medium fs-num">
              {fmt(r.period_start)} → {fmt(r.period_end)}
            </span>
            {r.paid_at && (
              <span className="text-xs text-[var(--muted)]">
                {t("billing.paidAt")} {fmt(r.paid_at)}
              </span>
            )}
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <span className="text-sm font-semibold fs-num">{fmtMoney(r.amount_egp)}</span>
            <span className={`fs-badge ${billingBadge[r.status] ?? ""}`}>{r.status}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
