import { differenceInDays, startOfDay, endOfDay, addDays, subDays, getHours, format } from "date-fns";
import { getSessionContext } from "@/lib/getSessionUser";
import type { DashboardCheckin, DashboardExpiringMember, DashboardData } from "@/types/dashboard";

export type { DashboardCheckin, DashboardExpiringMember, DashboardData };

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

export async function getAdminDashboardData(): Promise<DashboardData> {
  const { supabase, profile } = await getSessionContext();
  const gymId = profile?.gym_id ?? "";
  const now = new Date();
  const today = format(now, "yyyy-MM-dd");
  const weekFromNow = format(addDays(now, 7), "yyyy-MM-dd");
  const twelveWeeksAgo = format(subDays(now, 83), "yyyy-MM-dd");

  const [
    { data: metrics },
    { data: rawCheckins },
    { data: rawExpiring },
    { data: todayCheckinRows },
    { data: heatmapRows },
  ] = await Promise.all([
    supabase
      .from("admin_dashboard_metrics")
      .select("active_members, active_members_delta, active_today, active_today_delta, expiring_count, expiring_delta, revenue, revenue_delta")
      .eq("gym_id", gymId)
      .single(),

    supabase
      .from("gym_checkins")
      .select("checked_in_at, clients(membership_status, profiles(full_name))")
      .eq("gym_id", gymId)
      .order("checked_in_at", { ascending: false })
      .limit(5),

    supabase
      .from("clients")
      .select("end_date, membership_type, profiles(full_name)")
      .eq("gym_id", gymId)
      .eq("membership_status", "active")
      .gte("end_date", today)
      .lte("end_date", weekFromNow)
      .order("end_date", { ascending: true })
      .limit(4),

    supabase
      .from("gym_checkins")
      .select("checked_in_at")
      .eq("gym_id", gymId)
      .gte("checked_in_at", startOfDay(now).toISOString())
      .lte("checked_in_at", endOfDay(now).toISOString()),

    supabase
      .from("gym_checkins")
      .select("checked_in_at")
      .eq("gym_id", gymId)
      .gte("checked_in_at", twelveWeeksAgo),
  ]);

  const { data: gymPlans } = await supabase
    .from("gym_plans")
    .select("name, price_egp")
    .eq("gym_id", gymId);

  const planPriceMap = new Map((gymPlans ?? []).map((p) => [p.name, Number(p.price_egp)]));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recentCheckins: DashboardCheckin[] = (rawCheckins ?? []).map((c: any) => ({
    checkedInAt: c.checked_in_at,
    memberName: c.clients?.profiles?.full_name ?? "Unknown",
    membershipStatus: (c.clients?.membership_status ?? "active") as DashboardCheckin["membershipStatus"],
  }));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const expiringMembers: DashboardExpiringMember[] = (rawExpiring ?? []).map((e: any) => {
    const plan: string = e.membership_type ?? "—";
    const price = planPriceMap.get(plan);
    return {
      name: e.profiles?.full_name ?? "Unknown",
      planLabel: price != null ? `${plan} · ${price.toLocaleString()} EGP` : plan,
      daysUntilExpiry: differenceInDays(new Date(e.end_date ?? ""), now),
    };
  });

  const hourlyCheckins = Array.from({ length: 17 }, (_, i) =>
    (todayCheckinRows ?? []).filter((c) => getHours(new Date(c.checked_in_at)) === i + 6).length
  );
  const maxHourly = Math.max(...hourlyCheckins, 0);
  const peakIdx = maxHourly > 0 ? hourlyCheckins.indexOf(maxHourly) : -1;
  const peakHour = peakIdx >= 0 ? peakIdx + 6 : getHours(now);

  const startDay = subDays(now, 83);
  const byDate = new Map<string, number>();
  for (const c of heatmapRows ?? []) {
    const d = format(new Date(c.checked_in_at), "yyyy-MM-dd");
    byDate.set(d, (byDate.get(d) ?? 0) + 1);
  }
  const toIntensity = normalizeHeatmap(byDate);
  const heatmapData = Array.from({ length: 84 }, (_, i) =>
    toIntensity(format(addDays(startDay, i), "yyyy-MM-dd"))
  );

  return {
    activeMembers:      metrics?.active_members       ?? 0,
    activeMembersDelta: metrics?.active_members_delta ?? 0,
    activeToday:        metrics?.active_today         ?? 0,
    activeTodayDelta:   metrics?.active_today_delta   ?? 0,
    expiringCount:      metrics?.expiring_count       ?? 0,
    expiringDelta:      metrics?.expiring_delta       ?? 0,
    revenue:            metrics?.revenue              ?? 0,
    revenueDelta:       metrics?.revenue_delta        ?? 0,
    recentCheckins,
    expiringMembers,
    hourlyCheckins,
    peakHour,
    heatmapData,
    currentHour: getHours(now),
  };
}
