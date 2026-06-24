import { useQuery } from "@tanstack/react-query";
import { api } from "@dashboard/lib/api";
import { API } from "@/constants/apiRoutes";
import getTranslations from "@/i18n/lib/getTranslations";
import currencyFormat from "@/lib/currencyFormat";
import { format } from "date-fns";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import type { PlatformBillingRecord } from "@/types/gyms";

interface Props {
  gymId: string;
}

const billingBadge: Record<string, string> = {
  paid: "active",
  pending: "pending",
  failed: "expired",
  refunded: "frozen",
};

const fmt = (iso: string | null | undefined) => iso ? format(iso, "d MMM yyyy") : "—";

export default function GymBillingTab({ gymId }: Props) {
  const t = getTranslations("management.gyms.dialog");
  const tGyms = getTranslations("management.gyms");

  const { data: records = [], isFetching } = useQuery({
    queryKey: ["gym-billing", gymId],
    queryFn: () => api.get<PlatformBillingRecord[]>(API.gyms.billing(gymId)),
    staleTime: 30_000,
  });

  return (
    <LoadingOverlay loading={isFetching} containerClassName="min-h-40">
      {records.length === 0 ? (
        !isFetching && (
          <p className="py-10 text-center text-sm text-[var(--muted)]">{t("billing.noRecords")}</p>
        )
      ) : (
        <div className="flex flex-col divide-y divide-[var(--hairline2)] max-h-72 overflow-y-auto">
          {records.map((r: PlatformBillingRecord) => (
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
                <span className="text-sm font-semibold fs-num">
                  {currencyFormat(r.amount_egp, tGyms("currency"))}
                </span>
                <span className={`fs-badge ${billingBadge[r.status] ?? ""}`}>{r.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </LoadingOverlay>
  );
}
