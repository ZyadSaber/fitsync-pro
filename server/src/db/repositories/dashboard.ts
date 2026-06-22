import { differenceInDays, startOfDay, endOfDay, addDays, subDays, getHours, format } from "date-fns";
import { query, queryOne } from "../pool.js";
import type { DashboardCheckin, DashboardExpiringMember, DashboardData } from "@/types/dashboard";

function normalizeHeatmap(counts: Map<string, number>): (date: string) => number {
  const max = Math.max(...counts.values(), 1);
  return (date) => {
    const n = counts.get(date) ?? 0;
    if (n === 0) return 0;
    if (n <= max * 0.33) return 1;
    if (n <= max * 0.66) return 2;
    return 3;
  };
}

export async function getAdminDashboardData(gymId: string): Promise<DashboardData> {
  const now = new Date();
  const today = format(now, "yyyy-MM-dd");
  const weekFromNow = format(addDays(now, 7), "yyyy-MM-dd");
  const twelveWeeksAgo = format(subDays(now, 83), "yyyy-MM-dd");

  const [metrics, rawCheckins, rawExpiring, todayCheckinRows, heatmapRows, gymPlans] =
    await Promise.all([
      queryOne<{
        active_members: number; active_members_delta: number;
        active_today: number; active_today_delta: number;
        expiring_count: number; expiring_delta: number;
        revenue: number; revenue_delta: number;
      }>(
        `SELECT active_members, active_members_delta, active_today, active_today_delta,
                expiring_count, expiring_delta, revenue, revenue_delta
           FROM admin_dashboard_metrics WHERE gym_id = $1`,
        [gymId]
      ),
      query<{ checked_in_at: string; full_name: string | null; membership_status: string | null }>(
        `SELECT ch.checked_in_at, p.full_name, cl.membership_status
           FROM gym_checkins ch
           JOIN clients cl ON cl.id = ch.client_id
           LEFT JOIN profiles p ON p.id = cl.profile_id
          WHERE ch.gym_id = $1
          ORDER BY ch.checked_in_at DESC LIMIT 5`,
        [gymId]
      ),
      query<{ end_date: string | null; membership_type: string | null; full_name: string | null }>(
        `SELECT cl.end_date, cl.membership_type, p.full_name
           FROM clients cl
           LEFT JOIN profiles p ON p.id = cl.profile_id
          WHERE cl.gym_id = $1 AND cl.membership_status = 'active'
            AND cl.end_date >= $2 AND cl.end_date <= $3
          ORDER BY cl.end_date ASC LIMIT 4`,
        [gymId, today, weekFromNow]
      ),
      query<{ checked_in_at: string }>(
        `SELECT checked_in_at FROM gym_checkins
          WHERE gym_id = $1 AND checked_in_at >= $2 AND checked_in_at <= $3`,
        [gymId, startOfDay(now).toISOString(), endOfDay(now).toISOString()]
      ),
      query<{ checked_in_at: string }>(
        `SELECT checked_in_at FROM gym_checkins WHERE gym_id = $1 AND checked_in_at >= $2`,
        [gymId, twelveWeeksAgo]
      ),
      query<{ name: string; price_egp: string | number }>(
        `SELECT name, price_egp FROM gym_plans WHERE gym_id = $1`,
        [gymId]
      ),
    ]);

  const planPriceMap = new Map(gymPlans.rows.map((p) => [p.name, Number(p.price_egp)]));

  const recentCheckins: DashboardCheckin[] = rawCheckins.rows.map((c) => ({
    checkedInAt: c.checked_in_at,
    memberName: c.full_name ?? "Unknown",
    membershipStatus: (c.membership_status ?? "active") as DashboardCheckin["membershipStatus"],
  }));

  const expiringMembers: DashboardExpiringMember[] = rawExpiring.rows.map((e) => {
    const plan = e.membership_type ?? "—";
    const price = planPriceMap.get(plan);
    return {
      name: e.full_name ?? "Unknown",
      planLabel: price != null ? `${plan} · ${price.toLocaleString()} EGP` : plan,
      daysUntilExpiry: differenceInDays(new Date(e.end_date ?? ""), now),
    };
  });

  const hourlyCheckins = Array.from({ length: 17 }, (_, i) =>
    todayCheckinRows.rows.filter((c) => getHours(new Date(c.checked_in_at)) === i + 6).length
  );
  const maxHourly = Math.max(...hourlyCheckins, 0);
  const peakIdx = maxHourly > 0 ? hourlyCheckins.indexOf(maxHourly) : -1;
  const peakHour = peakIdx >= 0 ? peakIdx + 6 : getHours(now);

  const startDay = subDays(now, 83);
  const byDate = new Map<string, number>();
  for (const c of heatmapRows.rows) {
    const d = format(new Date(c.checked_in_at), "yyyy-MM-dd");
    byDate.set(d, (byDate.get(d) ?? 0) + 1);
  }
  const toIntensity = normalizeHeatmap(byDate);
  const heatmapData = Array.from({ length: 84 }, (_, i) =>
    toIntensity(format(addDays(startDay, i), "yyyy-MM-dd"))
  );

  return {
    activeMembers: metrics?.active_members ?? 0,
    activeMembersDelta: metrics?.active_members_delta ?? 0,
    activeToday: metrics?.active_today ?? 0,
    activeTodayDelta: metrics?.active_today_delta ?? 0,
    expiringCount: metrics?.expiring_count ?? 0,
    expiringDelta: metrics?.expiring_delta ?? 0,
    revenue: metrics?.revenue ?? 0,
    revenueDelta: metrics?.revenue_delta ?? 0,
    recentCheckins,
    expiringMembers,
    hourlyCheckins,
    peakHour,
    heatmapData,
    currentHour: getHours(now),
  };
}
