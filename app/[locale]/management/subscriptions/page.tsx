import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { format } from "date-fns";
import { Download } from "lucide-react";
import HeaderContent from "@/components/layout/Topbar";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { getSubscriptionPlanStats, getPlatformBillingRecords } from "@/services/management/subscriptions";
import { getGyms } from "@/services/management/gyms";
import SubscriptionsFilters from "@/components/management/subscriptions/SubscriptionsFilters";
import BillingRowActions from "@/components/management/subscriptions/BillingRowActions";
import PlanDialog from "@/components/management/subscriptions/PlanDialog";
import InvoiceDialog from "@/components/management/subscriptions/InvoiceDialog";
import PlanCard from "@/components/management/subscriptions/PlanCard";
import PlanTypeTabs from "@/components/management/subscriptions/PlanTypeTabs";
import type { SelectOptions } from "@/types/ui";
import type { SubscriptionPlanType } from "@/types/subscriptions";
import isArrayHasData from "@/lib/isArrayHasData";

const BILLING_BADGE: Record<string, { badge: string; label: string }> = {
  paid: { badge: "active", label: "Paid" },
  pending: { badge: "frozen", label: "Open" },
  failed: { badge: "expired", label: "Past due" },
  refunded: { badge: "pending", label: "Refunded" },
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
  const
    [t,
      {
        status: sf,
        planType: pt
      },
      plansResult,
      billingResult,
      gymsResult
    ] = await Promise.all([
      getTranslations("management.subscriptions"),
      searchParams,
      getSubscriptionPlanStats(),
      getPlatformBillingRecords(),
      getGyms(),
    ]);

  if (plansResult.error && billingResult.error) {
    return (
      <div className="p-7">
        <p className="text-sm font-mono text-red-600 bg-red-50 border border-red-200 rounded-lg p-4 whitespace-pre-wrap">
          {plansResult.error}
        </p>
      </div>
    );
  }

  const validTypes: SubscriptionPlanType[] = ["gym", "online_coach", "both"];
  const activePlanType = validTypes.includes(pt as SubscriptionPlanType) ? (pt as SubscriptionPlanType) : null;
  const plans = activePlanType
    ? plansResult.data.filter((p) => p.type === activePlanType)
    : plansResult.data;
  const allRecords = billingResult.data;
  const rows = allRecords.filter((r) => !sf || sf === "all" || r.status === sf);

  const pastDueCount = allRecords.filter((r) => r.status === "failed").length;
  const pendingCount = allRecords.filter((r) => r.status === "pending").length;

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
        {isArrayHasData(plansResult.data) && (
          <div className="flex flex-col gap-3">
            <Suspense>
              <PlanTypeTabs />
            </Suspense>
            {isArrayHasData(plans) ? (
              <div
                className="grid gap-3.5"
                style={{ gridTemplateColumns: `repeat(7, 1fr)` }}
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
                  total: allRecords.length,
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
              <InvoiceDialog gyms={gymOptions} />
            </div>
          </div>

          <Table>
            <TableHeader>
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
                const st = BILLING_BADGE[inv.status] ?? { badge: "pending", label: inv.status };
                return (
                  <TableRow key={inv.id}>
                    <TableCell className="fs-mono text-xs">
                      {invoiceId(inv.id, inv.created_at)}
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold">{inv.gym_name}</span>
                    </TableCell>
                    <TableCell className="fs-num font-semibold">
                      {inv.amount_egp.toLocaleString()}{" "}
                      <span className="text-muted text-[10px] font-normal">{t("currency")}</span>
                    </TableCell>
                    <TableCell>
                      <span className={`fs-badge ${st.badge}`}>
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
                    No billing records found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}
