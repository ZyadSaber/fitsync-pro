import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@dashboard/lib/api";
import { API } from "@/constants/apiRoutes";
import { formatDistanceToNow } from "date-fns";
import { Download } from "lucide-react";
import HeaderContent from "../../../layout/HeaderContent";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { SelectField, SelectFieldApiData } from "@/components/ui/select";
import UsageBar from "@/components/superadmin/UsageBar";
import getInitials from "@/lib/getInitials";
import getTranslations from "@/i18n/lib/getTranslations";
import useFormManager from "@/hooks/useFormManager";
import CoachRowActions from "./partials/CoachRowActions";
import CoachPromoteDialog from "./partials/CoachPromoteDialog";
import type { CoachListItem, PlatformUser } from "@/types/coaches";

const BILLING_BADGE: Record<string, string> = {
  active: "active",
  suspended: "pending",
  cancelled: "expired",
};

export default function CoachesPage() {
  const t = getTranslations("management.coaches");

  const {
    formData: { plan, active, searchQuery },
    handleToggle,
    handleChange,
  } = useFormManager({
    initialData: {
      plan: "",
      active: "",
    },
  });

  const activeOptions = useMemo(() => [
    { key: "true", label: t("filters.active") },
    { key: "false", label: t("filters.inactive") },
  ], []);

  const { data: coaches, isLoading } = useQuery({
    queryKey: ["coaches", searchQuery.search, plan, active],
    queryFn: () => api.get<CoachListItem[]>(API.coaches.list({ search: searchQuery.search, plan, active })),
  });

  const { data: platformUsers = [] } = useQuery({
    queryKey: ["coach-non-coaches"],
    queryFn: () => api.get<PlatformUser[]>(API.coaches.nonCoaches),
  });

  const totalClients = (coaches ?? []).reduce((sum, c) => sum + (Number(c.client_count) || 0), 0);

  return (
    <>
      <HeaderContent
        title={t("title")}
        subtitle={t("subtitle", { count: coaches?.length ?? 0, clients: totalClients })}
        onChange={handleChange}
        value={searchQuery.value}
        actions={
          <>
            <Button variant="ghost" icon={Download}>
              {t("actions.exportCsv")}
            </Button>
            <CoachPromoteDialog platformUsers={platformUsers} />
          </>
        }
      />

      <div className="p-7 flex flex-col gap-4">

        <div className="flex items-center gap-2 flex-wrap">
          <SelectField
            name="active"
            label={t("filters.billingStatus")}
            options={activeOptions}
            value={active}
            onValueChange={handleToggle("active")}
            hideClear={false}
            containerClassName="w-[20%]"
          />

          <SelectFieldApiData
            name="plan"
            label={t("table.plan")}
            queryApi={API.coaches.planOptions}
            value={plan}
            onValueChange={handleToggle("plan")}
            hideClear={false}
            containerClassName="w-[20%]"
          />
        </div>

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
            <TableBody loading={isLoading}>
              {coaches?.map((coach) => (
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
                          {t(`billing.${coach.billing_status!}` as "billing.active" | "billing.suspended" | "billing.cancelled")}
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
                  <TableCell className="w-[180px]">
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
                  <TableCell className="text-muted-foreground text-xs" suppressHydrationWarning>
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
      </div>
    </>
  );
}
