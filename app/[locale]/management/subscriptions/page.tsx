import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { format } from "date-fns";
import { Download } from "lucide-react";
import HeaderContent from "@/components/layout/Topbar";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { getSubscriptionPlanStats, getPlatformBillingRecords, getBillingStatusCounts, getCoachSelectOptions } from "@/services/management/subscriptions";
import { getGyms } from "@/services/management/gyms";
import SubscriptionsFilters from "@/components/management/subscriptions/SubscriptionsFilters";
import BillingRowActions from "@/components/management/subscriptions/BillingRowActions";
import PlanDialog from "@/components/management/subscriptions/PlanDialog";
import PlanCard from "@/components/management/subscriptions/PlanCard";
import PlanTypeTabs from "@/components/management/subscriptions/PlanTypeTabs";
import AssignPlanDialog from "@/components/management/subscriptions/AssignPlanDialog";
import type { SelectOptions } from "@/types/ui";
import type { SubscriptionPlanType } from "@/types/subscriptions";
import isArrayHasData from "@/lib/isArrayHasData";

const BILLING_BADGE: Record<string, string> = {
  paid: "active",
  pending: "frozen",
  failed: "expired",
  refunded: "pending",
};

const fmt = (iso: string | null) =>
  iso ? format(new Date(iso), "d MMM yyyy") : "—";

const invoiceId = (id: string, createdAt: string) =>
  `INV-${new Date(createdAt).getFullYear().toString().slice(-2)}-${id.slice(0, 5).toUpperCase()}`;

export default async function SubscriptionsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; planType?: string }>;
}) {
  const { status: sf, planType: pt } = await searchParams;

  const [t, plansResult, billingResult, countsResult, gymsResult, coachOptions] =
    await Promise.all([
      getTranslations("management.subscriptions"),
      getSubscriptionPlanStats(),
      getPlatformBillingRecords({ status: sf, planType: pt }),
      getBillingStatusCounts(),
      getGyms(),
      getCoachSelectOptions(),
    ]);

  const validTypes: SubscriptionPlanType[] = ["gym", "online_coach"];
  const activePlanType = validTypes.includes(pt as SubscriptionPlanType) ? (pt as SubscriptionPlanType) : null;
  const plans = activePlanType
    ? plansResult.data.filter((p) => p.type === activePlanType)
    : plansResult.data;

  // Rows come back already filtered by the database (see getPlatformBillingRecords).
  const rows = billingResult.data;

  // Counts are exact totals across every record, independent of the row page size.
  const { total: totalRecords, pastDue: pastDueCount, pending: pendingCount } = countsResult.data;

  const gymOptions: SelectOptions[] = (gymsResult.data ?? []).map((g) => ({
    key: g.id,
    label: g.name,
  }));

  const statusOptions: SelectOptions[] = [
    { key: "paid", label: t("status.paid") },
    { key: "pending", label: t("status.pending") },
    { key: "failed", label: t("status.failed") },
    { key: "refunded", label: t("status.refunded") },
  ];

  return (
    <>
      <HeaderContent
        title={t("title")}
        subtitle={t("subtitle")}
        actions={
          <>
            <Button variant="ghost">
              <Download size={13} />
              {t("actions.downloadInvoices")}
            </Button>
            <PlanDialog />
          </>
        }
      />

      <div className="p-7 flex flex-col gap-5">

        {/* Plan tier cards */}
        {plansResult.error ? (
          <p className="text-sm font-mono text-red-600 bg-red-50 border border-red-200 rounded-lg p-4 whitespace-pre-wrap">
            {t("plans.loadError")}
          </p>
        ) : isArrayHasData(plansResult.data) && (
          <div className="flex flex-col gap-3">
            <Suspense>
              <PlanTypeTabs />
            </Suspense>
            {isArrayHasData(plans) ? (
              <div
                className="grid gap-3.5"
                style={{ gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))" }}
              >
                {plans.map((p) => (
                  <PlanCard key={p.id} plan={p} t={t} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted py-4">{t("plans.noResults")}</p>
            )}
          </div>
        )}

        {/* Invoices */}
        <div className="fs-card p-0 overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[var(--hairline)] flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold">{t("invoices.title")}</div>
              <div className="text-[11px] text-muted mt-0.5">
                {t("invoices.subtitle", {
                  cycle: format(new Date(), "MMMM yyyy"),
                  shown: rows.length,
                  total: totalRecords,
                })}
              </div>
            </div>
            <div className="flex gap-2 items-center">
              <Suspense>
                <SubscriptionsFilters statusOptions={statusOptions} />
              </Suspense>
              {pastDueCount > 0 && (
                <span className="fs-badge expired">{t("invoices.pastDue")} · {pastDueCount}</span>
              )}
              {pendingCount > 0 && (
                <span className="fs-badge frozen">{t("invoices.open")} · {pendingCount}</span>
              )}
              <AssignPlanDialog
                gyms={gymOptions}
                coaches={coachOptions}
                plans={plansResult.data}
              />
            </div>
          </div>

          {billingResult.error ? (
            <p className="m-5 text-sm font-mono text-red-600 bg-red-50 border border-red-200 rounded-lg p-4 whitespace-pre-wrap">
              {t("invoices.loadError")}
            </p>
          ) : (
          <div className="max-h-[388px] overflow-y-auto">
          <Table>
            <TableHeader className="sticky top-0 z-10">
              <TableRow>
                <TableHead>{t("invoices.invoice")}</TableHead>
                <TableHead>{t("invoices.tenant")}</TableHead>
                <TableHead>{t("invoices.amount")}</TableHead>
                <TableHead>{t("invoices.status")}</TableHead>
                <TableHead>{t("invoices.due")}</TableHead>
                <TableHead>{t("invoices.paid")}</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((inv) => {
                const badgeClass = BILLING_BADGE[inv.status] ?? "pending";
                return (
                  <TableRow key={inv.id}>
                    <TableCell className="fs-mono text-xs">
                      {invoiceId(inv.id, inv.created_at)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{inv.tenant_name}</span>
                        <span className={`fs-badge ${inv.tenant_type === "gym" ? "gym" : "active"}`}>
                          {t(`invoices.tenantType.${inv.tenant_type}` as "invoices.tenantType.gym" | "invoices.tenantType.online_coach")}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="fs-num font-semibold">
                      {inv.amount_egp.toLocaleString()}{" "}
                      <span className="text-muted text-[10px] font-normal">{t("currency")}</span>
                    </TableCell>
                    <TableCell>
                      <span className={`fs-badge ${badgeClass}`}>
                        <span className="dot" />
                        {t(`status.${inv.status}` as "status.paid" | "status.pending" | "status.failed" | "status.refunded")}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted text-xs">
                      {fmt(inv.next_billing_at)}
                    </TableCell>
                    <TableCell className="text-muted text-xs">
                      {fmt(inv.paid_at)}
                    </TableCell>
                    <TableCell>
                      <BillingRowActions record={inv} gyms={gymOptions} />
                    </TableCell>
                  </TableRow>
                );
              })}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-sm text-muted">
                    {t("invoices.noResults")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          </div>
          )}
        </div>
      </div>
    </>
  );
}
