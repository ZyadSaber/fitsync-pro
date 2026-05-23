import Icon from "@/components/ui/Icon";
import PlanCardActions from "@/components/management/subscriptions/PlanCardActions";
import { PLAN_COLOR } from "@/constants/planColors";
import type { SubscriptionPlanStats } from "@/types/subscriptions";

type T = (key: string, values?: Record<string, string | number | Date>) => string;

export default function PlanCard({ plan, t }: { plan: SubscriptionPlanStats; t: T }) {
  const color = PLAN_COLOR[plan.slug] ?? "accent";

  return (
    <div className="fs-card p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="fs-badge gym" >
          {plan.name}
        </span>
        <div className="flex items-center gap-1.5">
          <span className="fs-mono text-[10px] text-muted">
            {t("plans.tenants", { count: plan.active_tenant_count })}
          </span>
        </div>
      </div>

      <div>
        <div className="fs-num text-[22px] font-bold tracking-[-0.02em]">
          {plan.price_egp === null
            ? t("plans.contact")
            : plan.price_egp === 0
              ? t("plans.free")
              : (
                <>
                  {plan.price_egp.toLocaleString()}{" "}
                  <span className="text-[11px] text-muted font-medium">{t("plans.perMonth")}</span>
                </>
              )}
        </div>
      </div>

      <ul className="m-0 p-0 list-none flex flex-col gap-1 text-[11px]">
        <li className="flex items-center gap-1.5">
          <Icon name="check" size={11} color={color} stroke={2.4} />
          {plan.member_limit === null
            ? t("plans.unlimited")
            : t("plans.members", { count: plan.member_limit.toLocaleString() })}
        </li>
        <li className="flex items-center gap-1.5">
          <Icon name="check" size={11} color={color} stroke={2.4} />
          {t("plans.days", { count: plan.duration_days })}
        </li>
        {plan.features.map((f) => (
          <li key={f} className="flex items-center gap-1.5">
            <Icon name="check" size={11} color={color} stroke={2.4} />
            {f}
          </li>
        ))}
      </ul>

      <div className="border-t border-hairline2 pt-2.5 mt-auto flex items-center justify-between">
        <div>
          <div className="text-[10px] text-muted font-semibold tracking-[0.06em] uppercase">
            {t("plans.mrr")}
          </div>
          <div className="fs-num text-sm font-bold mt-0.5">
            {plan.mrr_egp.toLocaleString()}{" "}
            <span className="text-[10px] text-muted font-medium">{t("currency")}</span>
          </div>
        </div>
        <PlanCardActions plan={plan} />
      </div>
    </div>
  );
}
