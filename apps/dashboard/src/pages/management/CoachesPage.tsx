import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";
import { formatDistanceToNow } from "date-fns";
import { Download } from "lucide-react";
import { api } from "../../lib/api";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import CoachesFilters from "@/components/management/coaches/CoachesFilters";
import CoachPromoteDialog from "@/components/management/coaches/CoachPromoteDialog";
import CoachRowActions from "@/components/management/coaches/CoachRowActions";
import UsageBar from "@/components/superadmin/UsageBar";
import getInitials from "@/lib/getInitials";
import Icon from "@/components/ui/Icon";
import type { CoachListItem, PlatformUser } from "@/types/coaches";
import type { SelectOptions } from "@/types/ui";

const BILLING_BADGE: Record<string, string> = {
  active: "active",
  suspended: "pending",
  cancelled: "expired",
};

export default function CoachesPage() {
  const { t } = useTranslation(undefined, { keyPrefix: "management.coaches" });
  const [searchParams, setSearchParams] = useSearchParams();

  const search = searchParams.get("search")?.toLowerCase() ?? "";
  const planFilter = searchParams.get("plan") ?? "";
  const activeFilter = searchParams.get("active") ?? "";

  const { data: coaches = [], isLoading, error } = useQuery({
    queryKey: ["coaches"],
    queryFn: () => api.get<CoachListItem[]>("/coaches"),
  });
  const { data: planOptions = [] } = useQuery({
    queryKey: ["coach-plan-options"],
    queryFn: () => api.get<SelectOptions[]>("/coaches/plan-options"),
  });
  const { data: platformUsers = [] } = useQuery({
    queryKey: ["coach-non-coaches"],
    queryFn: () => api.get<PlatformUser[]>("/coaches/non-coaches"),
  });

  const rows = useMemo(() => {
    return coaches.filter((c) => {
      if (search && !(c.full_name ?? "").toLowerCase().includes(search) && !(c.phone ?? "").includes(search))
        return false;
      if (planFilter && c.plan_name !== planFilter) return false;
      if (activeFilter === "true" && !c.is_billing_active) return false;
      if (activeFilter === "false" && c.is_billing_active) return false;
      return true;
    });
  }, [coaches, search, planFilter, activeFilter]);

  const totalCoaches = coaches.length;
  const activeBilling = coaches.filter((c) => c.is_billing_active).length;
  const totalClients = coaches.reduce((sum, c) => sum + (Number(c.client_count) || 0), 0);

  const onSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const value = (e.currentTarget.elements.namedItem("search") as HTMLInputElement).value.trim();
    const next = new URLSearchParams(searchParams);
    if (value) next.set("search", value);
    else next.delete("search");
    setSearchParams(next);
  };

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--hairline)] bg-white px-4 py-4 md:px-7 md:py-5 shrink-0">
        <div className="min-w-0">
          <h1 className="text-[18px] font-bold tracking-[-0.015em] m-0 md:text-[22px]">{t("title")}</h1>
          <p className="text-xs text-[var(--muted)] mt-1">
            {t("subtitle", { count: totalCoaches, clients: totalClients })}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <form onSubmit={onSearch} className="relative hidden sm:block">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--muted2)] pointer-events-none">
              <Icon name="search" size={14} />
            </span>
            <input
              name="search"
              defaultValue={searchParams.get("search") ?? ""}
              className="fs-input pl-8 w-[180px] md:w-[220px]"
              placeholder="Search…"
            />
          </form>
          <Button variant="ghost">
            <Download size={13} />
            {t("actions.exportCsv")}
          </Button>
          <CoachPromoteDialog platformUsers={platformUsers} />
        </div>
      </div>

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
          <CoachesFilters planOptions={planOptions} />
        </div>

        {isLoading && <div style={{ color: "var(--muted)" }}>Loading coaches…</div>}
        {error && <div style={{ color: "var(--red-app)" }}>{(error as Error).message}</div>}

        {/* Table */}
        {!isLoading && (
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
                        : <span className="text-xs text-muted-foreground">—</span>}
                    </TableCell>

                    {/* Joined */}
                    <TableCell className="text-muted text-xs">
                      {new Date(coach.created_at).toLocaleDateString("en-GB", {
                        day: "2-digit", month: "short", year: "numeric",
                      })}
                    </TableCell>

                    {/* Last activity */}
                    <TableCell className="text-muted text-xs">
                      {coach.last_activity_at
                        ? formatDistanceToNow(new Date(coach.last_activity_at), { addSuffix: true })
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
        )}
      </div>
    </>
  );
}
