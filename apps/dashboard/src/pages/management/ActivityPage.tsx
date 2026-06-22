import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";
import { format, formatDistanceToNow } from "date-fns";
import { api } from "../../lib/api";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import Icon from "@/components/ui/Icon";
import getInitials from "@/lib/getInitials";
import ActivityFilters from "@/components/management/activity/ActivityFilters";
import type { SelectOptions } from "@/types/ui";
import type { ActivityEventType, ActivityListItem } from "@/types/activity";
import type { GymListItem } from "@/types/gyms";

type IconName = Parameters<typeof Icon>[0]["name"];

const EVENT_META: Record<ActivityEventType, { icon: IconName; badge: string }> = {
  gym_created:          { icon: "plus",  badge: "gym" },
  login:                { icon: "user",  badge: "pending" },
  member_add:           { icon: "users", badge: "active" },
  member_status_change: { icon: "user",  badge: "frozen" },
  plan_change:          { icon: "card",  badge: "gym" },
  checkin:              { icon: "qr",    badge: "active" },
};

const DEFAULT_EVENT = { icon: "flame" as IconName, badge: "pending" };

const KNOWN_EVENTS: ActivityEventType[] = [
  "login", "member_add", "checkin", "plan_change", "member_status_change", "gym_created",
];

function metaDetail(event: string, meta: Record<string, unknown> | null): string {
  if (!meta) return "—";
  const m = meta as Record<string, string | undefined>;
  switch (event) {
    case "member_add":
      return m.name ? `${m.name}${m.plan ? ` · ${m.plan}` : ""}` : "—";
    case "member_status_change":
      return m.name ? `${m.name} → ${m.status ?? "?"}` : "—";
    case "plan_change":
      return m.from && m.to ? `${m.from} → ${m.to}` : "—";
    case "login":
      return m.role ?? "—";
    case "gym_created":
      return m.gym_name ? `${m.gym_name}${m.plan ? ` · ${m.plan}` : ""}` : "—";
    case "checkin":
      return m.qr_code ?? "—";
    default: {
      const vals = Object.values(meta).filter((v) => typeof v === "string") as string[];
      return vals.slice(0, 2).join(" · ") || "—";
    }
  }
}

interface ActivityPageData {
  rows: ActivityListItem[];
  totalEvents: number;
  logins: number;
  memberAdds: number;
  checkins: number;
}

export default function ActivityPage() {
  const { t } = useTranslation(undefined, { keyPrefix: "management.activity" });
  const [searchParams] = useSearchParams();

  const qsString = searchParams.toString();

  const { data, error } = useQuery({
    queryKey: ["activity", qsString],
    queryFn: () => api.get<ActivityPageData>(`/activity${qsString ? `?${qsString}` : ""}`),
  });

  const { data: gyms = [] } = useQuery({
    queryKey: ["gyms"],
    queryFn: () => api.get<GymListItem[]>("/gyms"),
  });
  const { data: coachOptions = [] } = useQuery({
    queryKey: ["coach-options"],
    queryFn: () => api.get<SelectOptions[]>("/subscriptions/coach-options"),
  });

  const gymOptions: SelectOptions[] = gyms.map((g) => ({ key: g.id, label: g.name }));
  const eventOptions: SelectOptions[] = KNOWN_EVENTS.map((e) => ({ key: e, label: t(`events.${e}`) }));

  const eventLabel = (event: string) =>
    KNOWN_EVENTS.includes(event as ActivityEventType)
      ? t(`events.${event as ActivityEventType}`)
      : event.replace(/_/g, " ");

  const rows = data?.rows ?? [];

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--hairline)] bg-white px-4 py-4 md:px-7 md:py-5 shrink-0">
        <div className="min-w-0">
          <h1 className="text-[18px] font-bold tracking-[-0.015em] m-0 md:text-[22px]">{t("title")}</h1>
          <p className="text-xs text-[var(--muted)] mt-1">{t("subtitle")}</p>
        </div>
      </div>

      {error ? (
        <div className="p-7">
          <p className="text-sm font-mono text-red-600 bg-red-50 border border-red-200 rounded-lg p-4 whitespace-pre-wrap">
            {(error as Error).message ?? t("loadError")}
          </p>
        </div>
      ) : (
        <div className="p-7 flex flex-col gap-4">
          {/* KPI row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            {[
              { label: t("kpis.total"), value: (data?.totalEvents ?? 0).toLocaleString(), sub: t("kpis.totalSub") },
              { label: t("kpis.logins"), value: (data?.logins ?? 0).toLocaleString(), sub: t("kpis.loginsSub") },
              { label: t("kpis.members"), value: (data?.memberAdds ?? 0).toLocaleString(), sub: t("kpis.membersSub") },
              { label: t("kpis.checkins"), value: (data?.checkins ?? 0).toLocaleString(), sub: t("kpis.checkinsSub") },
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
            <ActivityFilters gymOptions={gymOptions} coachOptions={coachOptions} eventOptions={eventOptions} />
          </div>

          {/* Activity table */}
          <div className="border border-[var(--hairline)] rounded-[8px] overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("table.event")}</TableHead>
                  <TableHead>{t("table.actor")}</TableHead>
                  <TableHead>{t("table.tenant")}</TableHead>
                  <TableHead>{t("table.details")}</TableHead>
                  <TableHead>{t("table.when")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted py-8">
                      {t("empty")}
                    </TableCell>
                  </TableRow>
                ) : rows.map((row) => {
                  const meta = EVENT_META[row.event_type as ActivityEventType] ?? DEFAULT_EVENT;
                  return (
                    <TableRow key={row.id}>
                      {/* Event */}
                      <TableCell>
                        <span className={`fs-badge ${meta.badge} gap-1.5`}>
                          <Icon name={meta.icon} size={12} />
                          {eventLabel(row.event_type)}
                        </span>
                      </TableCell>

                      {/* Actor */}
                      <TableCell>
                        {row.actor_name ? (
                          <div className="flex items-center gap-2.5">
                            <div className="fs-av w-7 h-7 text-[11px] shrink-0">
                              {row.actor_avatar_url
                                ? <img src={row.actor_avatar_url} alt={row.actor_name} className="w-full h-full object-cover rounded-full" />
                                : getInitials(row.actor_name)}
                            </div>
                            <span className="font-medium text-[13px]">{row.actor_name}</span>
                          </div>
                        ) : (
                          <span className="text-muted text-xs">{t("system")}</span>
                        )}
                      </TableCell>

                      {/* Tenant */}
                      <TableCell className="text-[13px]">
                        {row.tenant_type === "platform" || !row.tenant_name ? (
                          <span className="text-muted">{t("tenant.platform")}</span>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="truncate">{row.tenant_name}</span>
                            <span className={`fs-badge ${row.tenant_type === "gym" ? "gym" : "active"}`}>
                              {t(`tenant.${row.tenant_type}`)}
                            </span>
                          </div>
                        )}
                      </TableCell>

                      {/* Details */}
                      <TableCell className="text-muted text-xs max-w-[260px] truncate">
                        {metaDetail(row.event_type, row.metadata)}
                      </TableCell>

                      {/* When */}
                      <TableCell className="text-muted text-xs whitespace-nowrap">
                        <span title={format(new Date(row.created_at), "d MMM yyyy, HH:mm")}>
                          {formatDistanceToNow(new Date(row.created_at), { addSuffix: true })}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </>
  );
}
