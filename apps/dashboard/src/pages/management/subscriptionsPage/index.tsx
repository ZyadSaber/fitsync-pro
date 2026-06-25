import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Download } from "lucide-react";
import { api } from "@dashboard/lib/api";
import { API } from "@/constants/apiRoutes";
import getTranslations from "@/i18n/lib/getTranslations";
import useFormManager from "@/hooks/useFormManager";
import HeaderContent from "../../../layout/HeaderContent";
import { Button } from "@/components/ui/button";
import { SelectField } from "@/components/ui/select";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import BillingRowActions from "@/components/management/subscriptions/BillingRowActions";
import PlanDialog from "@/components/management/subscriptions/PlanDialog";
import PlanCard from "@/components/management/subscriptions/PlanCard";
import PlanTypeTabs from "@/components/management/subscriptions/PlanTypeTabs";
import AssignPlanDialog from "@/components/management/subscriptions/AssignPlanDialog";
import isArrayHasData from "@/lib/isArrayHasData";
import type { SelectOptions } from "@/types/ui";
import type { SubscriptionPlanStats, SubscriptionPlanType, BillingRecordListItem } from "@/types/subscriptions";
import type { GymListItem } from "@/types/gyms";

type Tab = "all" | SubscriptionPlanType;

const BILLING_BADGE: Record<string, string> = {
    paid: "active",
    pending: "frozen",
    failed: "expired",
    refunded: "pending",
};

const fmt = (iso: string | null) => (iso ? format(new Date(iso), "d MMM yyyy") : "—");

const invoiceId = (id: string, createdAt: string) =>
    `INV-${new Date(createdAt).getFullYear().toString().slice(-2)}-${id.slice(0, 5).toUpperCase()}`;

export default function SubscriptionsPage() {
    const t = getTranslations("management.subscriptions");

    const {
        formData: { status, planType },
        handleToggle,
    } = useFormManager({
        initialData: { status: "", planType: "all" as Tab },
    });

    const sf = status || undefined;
    const pt = planType === "all" ? undefined : planType;

    const { data: allPlans = [], error: plansError } = useQuery({
        queryKey: ["subscription-plans"],
        queryFn: () => api.get<SubscriptionPlanStats[]>(API.subscriptions.plans),
    });
    const { data: rows = [], error: billingError } = useQuery({
        queryKey: ["billing-records", sf ?? "", pt ?? ""],
        queryFn: () => {
            const qs = new URLSearchParams();
            if (sf) qs.set("status", sf);
            if (pt) qs.set("planType", pt);
            const suffix = qs.toString() ? `?${qs}` : "";
            return api.get<BillingRecordListItem[]>(`${API.subscriptions.billing}${suffix}`);
        },
    });
    const { data: counts = { total: 0, pastDue: 0, pending: 0 } } = useQuery({
        queryKey: ["billing-counts"],
        queryFn: () => api.get<{ total: number; pastDue: number; pending: number }>(API.subscriptions.billingCounts),
    });
    const { data: gyms = [] } = useQuery({
        queryKey: ["gyms"],
        queryFn: () => api.get<GymListItem[]>(API.gyms.list()),
    });
    const { data: coachOptions = [] } = useQuery({
        queryKey: ["coach-options"],
        queryFn: () => api.get<SelectOptions[]>(API.subscriptions.coachOptions),
    });

    const plans = pt ? allPlans.filter((p) => p.type === pt) : allPlans;

    const gymOptions: SelectOptions[] = useMemo(
        () => gyms.map((g) => ({ key: g.id, label: g.name })),
        [gyms]
    );

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
                noSearch
                actions={
                    <>
                        <Button variant="ghost" icon={Download}>
                            {t("actions.downloadInvoices")}
                        </Button>
                        <PlanDialog />
                    </>
                }
            />

            <div className="p-7 flex flex-col gap-5">
                {/* Plan tier cards */}
                {plansError ? (
                    <p className="text-sm font-mono text-red-600 bg-red-50 border border-red-200 rounded-lg p-4 whitespace-pre-wrap">
                        {t("plans.loadError")}
                    </p>
                ) : isArrayHasData(allPlans) && (
                    <div className="flex flex-col gap-3">
                        <PlanTypeTabs active={planType} onSelect={handleToggle("planType")} />
                        {isArrayHasData(plans) ? (
                            <div className="grid gap-3.5 grid-cols-[repeat(auto-fill,minmax(180px,1fr))]">
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
                                    total: counts.total,
                                })}
                            </div>
                        </div>
                        <div className="flex gap-2 items-center">
                            <SelectField
                                name="status"
                                label={t("invoices.status")}
                                options={statusOptions}
                                value={status}
                                onValueChange={handleToggle("status")}
                                hideClear={false}
                                containerClassName="w-36"
                            />
                            {counts.pastDue > 0 && (
                                <span className="fs-badge expired">{t("invoices.pastDue")} · {counts.pastDue}</span>
                            )}
                            {counts.pending > 0 && (
                                <span className="fs-badge frozen">{t("invoices.open")} · {counts.pending}</span>
                            )}
                            <AssignPlanDialog gyms={gymOptions} coaches={coachOptions} plans={allPlans} />
                        </div>
                    </div>

                    {billingError ? (
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
                                        <TableHead>{t("invoices.paid")}</TableHead>
                                        <TableHead className="w-12" />
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {rows.map((inv) => {
                                        const badgeClass = BILLING_BADGE[inv.status] ?? "pending";
                                        return (
                                            <TableRow key={inv.id}>
                                                <TableCell className="fs-mono text-xs">{invoiceId(inv.id, inv.created_at)}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold">{inv.tenant_name}</span>
                                                        <span className={`fs-badge ${inv.tenant_type === "gym" ? "gym" : "active"}`}>
                                                            {t(`invoices.tenantType.${inv.tenant_type}`)}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="fs-num font-semibold">
                                                    {Number(inv.amount_egp).toLocaleString()}{" "}
                                                    <span className="text-muted text-[10px] font-normal">{t("currency")}</span>
                                                </TableCell>
                                                <TableCell>
                                                    <span className={`fs-badge ${badgeClass}`}>
                                                        <span className="dot" />
                                                        {t(`status.${inv.status}`)}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-muted text-xs">{fmt(inv.paid_at)}</TableCell>
                                                <TableCell>
                                                    <BillingRowActions record={inv} gyms={gymOptions} />
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                    {rows.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-10 text-sm text-muted">
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
