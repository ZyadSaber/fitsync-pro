import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import Icon from "@/components/ui/Icon";
import HeaderContent from "@/components/layout/Topbar";
import UsageBar from "@/components/superadmin/UsageBar";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { getGyms, getActiveSubscriptionPlanOptions } from "@/services/management/gyms";
import { formatDistanceToNow } from "date-fns";
import GymsFilters from "@/components/management/GymsFilters";
import { Button } from "@/components/ui/button";
import getInitials from "@/lib/getInitials"

const STATUS_BADGE: Record<string, string> = {
  active: "active",
  suspended: "frozen",
  cancelled: "expired",
};

export default async function GymsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string; plan?: string }>;
}) {
  const [t, { status: sf, search: sq, plan: spPlan }, planOptions] = await Promise.all([
    getTranslations("management.gyms"),
    searchParams,
    getActiveSubscriptionPlanOptions(),
  ]);

  const result = await getGyms();

  if (result.error) {
    return (
      <div className="p-7">
        <p className="text-sm font-mono text-red-600 bg-red-50 border border-red-200 rounded-lg p-4 whitespace-pre-wrap">
          {result.error}
        </p>
      </div>
    );
  }

  const gyms = result.data;
  const rows = gyms
    .filter((g) => !sf || sf === "all" || g.status === sf)
    .filter((g) => !sq || g.name.toLowerCase().includes(sq.toLowerCase()))
    .filter((g) => !spPlan || g.plan === spPlan);

  const planNameMap = Object.fromEntries(planOptions.map((p) => [p.key, p.label]));
  const totalMembers = gyms.reduce((s, g) => s + g.memberCount, 0);

  return (
    <>
      <HeaderContent
        title={t("title")}
        subtitle={t("subtitle", { count: gyms.length, members: totalMembers.toLocaleString() })}
        actions={
          <>
            <button className="fs-btn ghost">
              <Icon name="filter" size={13} />
              {t("actions.exportCsv")}
            </button>
            <Button variant="accent">
              <Icon name="plus" size={13} color="#fff" />
              {t("actions.addGym")}
            </Button>
          </>
        }
      />

      <div className="p-7 flex flex-col gap-4">

        <div className="flex items-center gap-2 flex-wrap">
          <Suspense>
            <GymsFilters
              planOptions={planOptions}
            />
          </Suspense>
        </div>

        <div className="border border-[var(--hairline)] rounded-[8px] overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("table.gym")}</TableHead>
                <TableHead>{t("table.plan")}</TableHead>
                <TableHead>{t("table.members")}</TableHead>
                <TableHead>{t("table.mrr")}</TableHead>
                <TableHead>{t("table.status")}</TableHead>
                <TableHead>{t("table.lastActivity")}</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((g) => {
                const badge = STATUS_BADGE[g.status ?? ""] ?? "pending";
                const statusLabel = t(`status.${g.status ?? "unknown"}` as "status.active" | "status.suspended" | "status.cancelled" | "status.unknown");
                return (
                  <TableRow key={g.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-[7px] bg-ink text-white flex items-center justify-center text-xs font-bold shrink-0">
                          {getInitials(g.name)}
                        </div>
                        <div>
                          <span className="font-semibold">{g.name}</span>
                          <div className="text-[11px] text-[var(--muted)] mt-0.5 flex items-center gap-1.5">
                            <span>{g.address}</span><span className="text-muted2">·</span>
                            <span className="font-mono text-[10px]">{g.id}</span>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{g.plan}</TableCell>
                    <TableCell className="w-[180px]">
                      <UsageBar used={g.memberCount} limit={0} compact />
                    </TableCell>
                    <TableCell className="tabular-nums font-semibold">
                      {
                        `${(g.planPriceEgp || 0).toLocaleString()} ${t("currency")}`
                      }
                    </TableCell>
                    <TableCell>
                      <span className={`fs-badge ${badge}`}><span className="dot" />{statusLabel}</span>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">{formatDistanceToNow(new Date(g.lastActivityAt || ""), { addSuffix: true })}</TableCell>
                    <TableCell><Icon name="more" size={16} color="var(--muted)" /></TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}
