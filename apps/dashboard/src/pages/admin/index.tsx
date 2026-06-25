import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { api } from "@dashboard/lib/api";
import { API } from "@/constants/apiRoutes";
import getTranslations from "@/i18n/lib/getTranslations";
import type { DashboardCheckin, DashboardExpiringMember, DashboardData } from "@/types/dashboard";
import Icon from "@/components/ui/Icon";
import { Avatar, AvatarFallback } from "@/components/ui/Avatar";
import MetricCard from "@/components/ui/MetricCard";
import StatusBadge from "@/components/ui/StatusBadge";
import CheckinHeatmap from "@/components/ui/CheckinHeatmap";
import CheckinBarChart from "@/components/ui/CheckinBarChart";
import HeaderContent from "../../layout/HeaderContent";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function deltaTrend(delta: number): { label: string | undefined; dir: "up" | "down" | "flat" } {
  if (delta === 0) return { label: undefined, dir: "flat" };
  return { label: delta > 0 ? `+${delta}` : `${delta}`, dir: delta > 0 ? "up" : "down" };
}

function revenueTrend(delta: number, locale: string): { label: string | undefined; dir: "up" | "down" | "flat" } {
  if (delta === 0) return { label: undefined, dir: "flat" };
  const fmt = Math.abs(delta).toLocaleString(locale === "ar" ? "ar-EG" : "en-US");
  return { label: delta > 0 ? `+${fmt}` : `-${fmt}`, dir: delta > 0 ? "up" : "down" };
}

function relativeTime(dateStr: string, locale: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const secs = Math.floor(diff / 1000);
  const rtf = new Intl.RelativeTimeFormat(locale === "ar" ? "ar-EG" : "en", { numeric: "auto" });
  if (secs < 60) return rtf.format(-secs, "second");
  const mins = Math.floor(secs / 60);
  if (mins < 60) return rtf.format(-mins, "minute");
  return rtf.format(-Math.floor(mins / 60), "hour");
}

function peakHourLabel(hour: number): string {
  if (hour === 12) return "12pm";
  return hour > 12 ? `${hour - 12}pm` : `${hour}am`;
}

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

export default function AdminDashboard() {
  const t = getTranslations("admin.dashboard");
  const tc = getTranslations("common");
  const { i18n } = useTranslation();
  const locale = i18n.language;

  const { data } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: () => api.get<DashboardData>(API.admin.dashboard),
  });

  const dateLabel = new Intl.DateTimeFormat(
    locale === "ar" ? "ar-EG" : "en-US",
    { weekday: "long", day: "numeric", month: "long", year: "numeric" }
  ).format(new Date());

  return (
    <>
      <HeaderContent
        title={t("title")}
        subtitle={dateLabel}
        noSearch
        actions={
          <>
            <Button variant="ghost">
              <Icon name="tag" size={13} />
              {tc("createOffer")}
            </Button>
            <Button variant="accent">
              <Icon name="plus" size={13} color="#fff" />
              {tc("addMember")}
            </Button>
          </>
        }
      />

      {data && (
        <DashboardBody data={data} t={t} tc={tc} locale={locale} />
      )}
    </>
  );
}

function DashboardBody({
  data,
  t,
  tc,
  locale,
}: {
  data: DashboardData;
  t: ReturnType<typeof getTranslations>;
  tc: ReturnType<typeof getTranslations>;
  locale: string;
}) {
  const {
    activeMembers, activeMembersDelta,
    activeToday, activeTodayDelta,
    expiringCount, expiringDelta,
    revenue, revenueDelta,
    recentCheckins, expiringMembers,
    hourlyCheckins, peakHour, heatmapData, currentHour,
  } = data;

  const membersTrend = deltaTrend(activeMembersDelta);
  const todayTrend = deltaTrend(activeTodayDelta);
  // More expiring = worse, so invert the direction for display
  const expiringTrend = { ...deltaTrend(expiringDelta), dir: deltaTrend(-expiringDelta).dir } as ReturnType<typeof deltaTrend>;
  const revTrend = revenueTrend(revenueDelta, locale);

  const revenueStr = revenue > 0
    ? revenue.toLocaleString(locale === "ar" ? "ar-EG" : "en-US")
    : "—";

  return (
    <div className="flex flex-col gap-5 p-4 md:p-7">

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <MetricCard
          label={t("activeMembers")}
          value={String(activeMembers)}
          trend={membersTrend.label}
          trendDir={membersTrend.dir}
          sub={t("vsLastMonth")}
        />
        <MetricCard
          label={t("activeToday")}
          value={String(activeToday)}
          trend={todayTrend.label}
          trendDir={todayTrend.dir}
          sub={t("avgLabel")}
        />
        <MetricCard
          label={t("expiringThisWeek")}
          value={String(expiringCount)}
          trend={expiringTrend.label}
          trendDir={expiringTrend.dir}
          sub={t("renewalNeeded")}
        />
        <MetricCard
          label={t("revenue")}
          value={revenueStr}
          trend={revTrend.label}
          trendDir={revTrend.dir}
          sub="EGP"
        />
      </div>

      {/* Two-col: live feed + expiring */}
      <div className="grid gap-5 grid-cols-1 lg:grid-cols-[1.4fr_1fr]">

        {/* Live check-ins */}
        <Card className="gap-0 rounded-xl border-[var(--hairline)] py-0 shadow-none">
          <div className="flex items-center justify-between border-b border-[var(--hairline)] px-5 py-4">
            <div>
              <p className="text-[14px] font-semibold">{t("liveFeed")}</p>
              <p className="mt-0.5 text-[11px] text-[var(--muted)]">{t("membersToday", { count: activeToday })}</p>
            </div>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[var(--green)]">
              <span className="fs-blink size-1.5 rounded-full bg-[var(--green)]" />
              {t("live")}
            </div>
          </div>
          <CardContent className="px-0 pb-0">
            {recentCheckins.length > 0 ? recentCheckins.map((c: DashboardCheckin, i, arr) => (
              <div
                key={i}
                className={`flex items-center gap-3 px-5 py-3.5 ${i < arr.length - 1 ? "border-b border-[var(--hairline2)]" : ""}`}
              >
                <Avatar>
                  <AvatarFallback className="bg-[var(--accent-soft)] text-xs font-semibold text-[var(--accent)]">
                    {initials(c.memberName)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-semibold">{c.memberName}</p>
                  <p className="mt-0.5 text-[11px] text-[var(--muted)]">{relativeTime(c.checkedInAt, locale)}</p>
                </div>
                <StatusBadge status={c.membershipStatus} />
                <Icon name="qr" size={14} color="var(--muted)" />
              </div>
            )) : (
              <p className="py-8 text-center text-[13px] text-[var(--muted)]">No check-ins today yet</p>
            )}
          </CardContent>
        </Card>

        {/* Expiring memberships */}
        <Card className="gap-0 rounded-xl border-[var(--hairline)] py-0 shadow-none">
          <div className="flex items-center justify-between border-b border-[var(--hairline)] px-5 py-4">
            <p className="text-[14px] font-semibold">{t("expiringTitle")}</p>
            <span className="cursor-pointer text-[11px] font-semibold text-[var(--accent)]">{tc("viewAll")}</span>
          </div>
          <CardContent className="px-0 pb-0">
            {expiringMembers.length > 0 ? expiringMembers.map((e: DashboardExpiringMember, i, arr) => (
              <div
                key={i}
                className={`flex items-center gap-3 px-5 py-3.5 ${i < arr.length - 1 ? "border-b border-[var(--hairline2)]" : ""}`}
              >
                <Avatar>
                  <AvatarFallback className="bg-[var(--accent-soft)] text-xs font-semibold text-[var(--accent)]">
                    {initials(e.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-semibold">{e.name}</p>
                  <p className="mt-0.5 text-[11px] text-[var(--muted)]">{e.planLabel}</p>
                </div>
                <span className="fs-badge expired">
                  <span className="dot" />
                  {e.daysUntilExpiry <= 1 ? "1 day" : `${e.daysUntilExpiry} days`}
                </span>
                <button className="fs-btn ghost sm">
                  <Icon name="whatsapp" size={12} color="var(--whatsapp)" />
                  {tc("remind")}
                </button>
              </div>
            )) : (
              <p className="py-8 text-center text-[13px] text-[var(--muted)]">No expiring memberships this week</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom row: hourly chart + weekly heatmap */}
      <div className="grid gap-5 grid-cols-1 lg:grid-cols-[1.4fr_1fr]">

        {/* Today's check-in chart */}
        <Card className="rounded-xl border-[var(--hairline)] shadow-none">
          <div className="flex items-center justify-between px-6 pt-6">
            <div>
              <p className="text-[14px] font-semibold">{t("checkinChartTitle")}</p>
              <p className="mt-0.5 text-[11px] text-[var(--muted)]">
                {t("checkinChartSub", { count: activeToday, peak: peakHourLabel(peakHour) })}
              </p>
            </div>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[var(--green)]">
              <span className="fs-blink size-1.5 rounded-full bg-[var(--green)]" />
              {t("live")}
            </div>
          </div>
          <CardContent>
            <CheckinBarChart data={hourlyCheckins} currentHour={currentHour} />
            <div className="mt-3 flex items-center gap-3 text-[10px] text-[var(--muted)]">
              {([
                ["var(--accent)", t("currentHour")],
                ["#C7D2FE", t("earlierToday")],
                ["var(--hairline)", t("upcoming")],
              ] as [string, string][]).map(([bg, label]) => (
                <span key={label} className="flex items-center gap-1">
                  <span className="size-2.5 rounded-sm" style={{ background: bg }} />
                  {label}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Weekly heatmap */}
        <Card className="rounded-xl border-[var(--hairline)] shadow-none">
          <div className="flex items-center justify-between px-6 pt-6">
            <div>
              <p className="text-[14px] font-semibold">{t("attendanceTitle")}</p>
              <p className="mt-0.5 text-[11px] text-[var(--muted)]">{t("heatmapSub")}</p>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-[var(--muted)]">
              <span>{tc("less")}</span>
              {["#EEF0F4", "#C7D2FE", "#6B85FF", "#2D5BFF"].map((c) => (
                <span key={c} className="size-2.5 rounded-sm" style={{ background: c }} />
              ))}
              <span>{tc("more")}</span>
            </div>
          </div>
          <CardContent>
            <CheckinHeatmap weeks={12} data={heatmapData} />
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
