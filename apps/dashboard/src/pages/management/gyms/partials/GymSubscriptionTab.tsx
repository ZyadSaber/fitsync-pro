import { useQuery } from "@tanstack/react-query";
import { api } from "@dashboard/lib/api";
import { API } from "@/constants/apiRoutes";
import getTranslations from "@/i18n/lib/getTranslations";
import currencyFormat from "@/lib/currencyFormat";
import { format } from "date-fns"
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import type { PlatformSubscriptionDetails } from "@/types/gyms";

interface Props {
  gymId: string;
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

export default function GymSubscriptionTab({ gymId }: Props) {
  const t = getTranslations("management.gyms.dialog");
  const tGyms = getTranslations("management.gyms");

  const { data: sub, isFetching } = useQuery({
    queryKey: ["gym-subscription", gymId],
    queryFn: () => api.get<PlatformSubscriptionDetails | null>(API.gyms.subscription(gymId)),
    staleTime: 30_000,
  });

  const grid = sub
    ? ([
      [t("subscription.price"), sub.price_egp != null ? currencyFormat(sub.price_egp, tGyms("currency")) : "—"],
      [t("subscription.billingCycle"), <span key="bc" className="capitalize">{sub.billing_cycle}</span>],
      [t("subscription.memberLimit"), sub.member_limit != null ? sub.member_limit.toLocaleString() : t("subscription.unlimited")],
      [t("subscription.startedAt"), format(sub.started_at, "dd MMM yyyy")],
    ] as const)
    : [];

  return (
    <LoadingOverlay loading={isFetching} containerClassName="min-h-40">
      {!sub ? (
        !isFetching && (
          <p className="py-10 text-center text-sm text-[var(--muted)]">{t("subscription.noSubscription")}</p>
        )
      ) : (
        <div className="flex flex-col gap-4">
          {/* Plan + status */}
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-[var(--muted)]">{t("subscription.plan")}</span>
              <span className="font-semibold text-sm">{sub.plan_name ?? "—"}</span>
            </div>
            <span className={`fs-badge ${subBadge[sub.status] ?? ""}`}>
              {tGyms(`status.${sub.status}`)}
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
                  {format(sub.current_period_start, "dd MMM yyyy")} → {format(sub.current_period_end, "dd MMM yyyy")}
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
                  {sub.features.map((f: string) => <span key={f} className="fs-badge">{f}</span>)}
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
      )}
    </LoadingOverlay>
  );
}
