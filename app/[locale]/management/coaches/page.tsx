import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import HeaderContent from "@/components/layout/Topbar";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { getCoachesPageData, getActiveCoachPlanOptions, getNonCoachUsers } from "@/services/management/coaches";
import CoachesFilters from "@/components/management/coaches/CoachesFilters";
import CoachPromoteDialog from "@/components/management/coaches/CoachPromoteDialog";
import CoachRowActions from "@/components/management/coaches/CoachRowActions";
import getInitials from "@/lib/getInitials";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import UsageBar from "@/components/superadmin/UsageBar";

const BILLING_BADGE: Record<string, string> = {
  active: "active",
  suspended: "pending",
  cancelled: "expired",
};

export default async function CoachesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; plan?: string; active?: string }>;
}) {
  const [t, filters, planOptions, platformUsersResult] = await Promise.all([
    getTranslations("management.coaches"),
    searchParams,
    getActiveCoachPlanOptions(),
    getNonCoachUsers(),
  ]);

  const { data, error } = await getCoachesPageData(filters);

  if (error || !data) {
    return (
      <div className="p-7">
        <p className="text-sm font-mono text-red-600 bg-red-50 border border-red-200 rounded-lg p-4 whitespace-pre-wrap">
          {error}
        </p>
      </div>
    );
  }

  const { rows, totalCoaches, activeBilling, totalClients } = data;

  return (
    <>
      <HeaderContent
        title={t("title")}
        subtitle={t("subtitle", { count: totalCoaches, clients: totalClients })}
        actions={
          <>
            <Button variant="ghost">
              <Download size={13} />
              {t("actions.exportCsv")}
            </Button>
            <CoachPromoteDialog platformUsers={platformUsersResult.data} />
          </>
        }
      />

      <div className="p-7 flex flex-col gap-4">

        {/* KPI row */}
        <div className="grid grid-cols-3 gap-3.5">
          {[
            { label: t("kpis.total"), value: String(totalCoaches), sub: t("kpis.totalSub") },
            { label: t("kpis.activeBilling"), value: String(activeBilling), sub: t("kpis.activeBillingSub") },
            { label: t("kpis.clients"), value: totalClients.toLocaleString(), sub: t("kpis.clientsSub") },
          ].map((card) => (
            <div key={card.label} className="fs-card pad flex flex-col justify-between min-h-[88px]">
              <div className="fs-eyebrow">{card.label}</div>
              <div className="flex items-baseline gap-2.5">
                <div className="fs-num text-[26px] font-bold tracking-tight">{card.value}</div>
                <div className="text-[11px] text-muted">{card.sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <Suspense>
            <CoachesFilters planOptions={planOptions} />
          </Suspense>
        </div>

        {/* Table */}
        <div className="border border-[var(--hairline)] rounded-[8px] overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("table.coach")}</TableHead>
                <TableHead>{t("table.plan")}</TableHead>
                <TableHead>{t("table.price")}</TableHead>
                <TableHead>{t("table.clients")}</TableHead>
                <TableHead>{t("table.joined")}</TableHead>
                <TableHead>{t("table.lastActivity")}</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted py-8">
                    {t("empty")}
                  </TableCell>
                </TableRow>
              ) : rows.map((coach) => (
                <TableRow key={coach.id}>

                  {/* Coach */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="fs-av shrink-0">
                        {coach.avatar_url
                          ? <img src={coach.avatar_url} alt={coach.full_name} className="w-full h-full object-cover rounded-full" />
                          : getInitials(coach.full_name || "?")}
                      </div>
                      <div>
                        <div className="font-semibold">{coach.full_name || "—"}</div>
                        {coach.phone && (
                          <div className="font-mono text-[11px] text-muted mt-0.5" dir="ltr">{coach.phone}</div>
                        )}
                        {!coach.phone && coach.specialties.length > 0 && (
                          <div className="text-[11px] text-muted mt-0.5">
                            {coach.specialties.slice(0, 2).join(" · ")}
                            {coach.specialties.length > 2 && ` +${coach.specialties.length - 2}`}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  {/* Plan + billing status */}
                  <TableCell>
                    {coach.plan_name ? (
                      <div className="flex flex-col gap-1">
                        <span className="font-medium text-[13px]">{coach.plan_name}</span>
                        <span className={`fs-badge ${BILLING_BADGE[coach.billing_status!] ?? "pending"}`}>
                          <span className="dot" />
                          {t(`billing.${coach.billing_status!}`)}
                        </span>
                      </div>
                    ) : (
                      <span className="fs-badge frozen">
                        <span className="dot" />
                        {t("billing.none")}
                      </span>
                    )}
                  </TableCell>

                  {/* Price */}
                  <TableCell className="tabular-nums font-semibold">
                    {coach.price_egp != null
                      ? `${Number(coach.price_egp).toLocaleString()} ${t("currency")}`
                      : "—"}
                  </TableCell>

                  {/* Clients / limit */}
                  <TableCell>
                    {coach.member_limit != null
                      ? <UsageBar used={coach.client_count} limit={+coach.member_limit} />
                      : <span className="text-xs text-muted-foreground">—</span>
                    }
                  </TableCell>

                  {/* Joined */}
                  <TableCell className="text-muted text-xs">
                    {new Date(coach.created_at).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </TableCell>

                  {/* Last activity */}
                  <TableCell className="text-muted text-xs" suppressHydrationWarning>
                    {coach.last_activity_at
                      ? formatDistanceToNow(coach.last_activity_at, { addSuffix: true })
                      : "—"}
                  </TableCell>

                  <TableCell>
                    <CoachRowActions coach={coach} />
                  </TableCell>

                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}
