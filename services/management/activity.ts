"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import extractMessage from "@/lib/extractMessage";
import isArrayHasData from "@/lib/isArrayHasData";
import type { ActivityListItem } from "@/types/activity";

// ---------------------------------------------------------------------------
// Activity feed (super admin platform-wide audit log)
// ---------------------------------------------------------------------------
// Reads from the platform_activity_log_list view (gym + actor names joined).
// Gym / event / date-range filters run on the database; the free-text search
// runs in memory over the page of rows so it can match nested metadata too.
// ---------------------------------------------------------------------------

export type ActivityPageFilters = {
  gym?: string;
  coach?: string;
  event?: string;
  from?: string;
  to?: string;
  search?: string;
};

export type ActivityPageData = {
  rows: ActivityListItem[];
  // KPI totals are over ALL events, independent of the active filters.
  totalEvents: number;
  logins: number;
  memberAdds: number;
  checkins: number;
};

export async function getActivityPageData(
  filters: ActivityPageFilters
): Promise<{ data: ActivityPageData | null; error: null | string }> {
  const supabase = await createServerSupabaseClient();

  try {
    let query = supabase
      .from("platform_activity_log_list")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);

    if (filters.gym) {
      query = query.eq("gym_id", filters.gym) as typeof query;
    }
    if (filters.coach) {
      query = query.eq("coach_id", filters.coach) as typeof query;
    }
    if (filters.event && filters.event !== "all") {
      query = query.eq("event_type", filters.event) as typeof query;
    }
    if (filters.from) {
      query = query.gte("created_at", filters.from) as typeof query;
    }
    if (filters.to) {
      // `to` is a date-only string; include the whole day.
      query = query.lte("created_at", `${filters.to}T23:59:59`) as typeof query;
    }

    const { data, error } = await query;
    if (error) throw error;

    let rows = isArrayHasData(data) ? (data as ActivityListItem[]) : [];

    const q = filters.search?.toLowerCase().trim();
    if (q) {
      rows = rows.filter(
        (r) =>
          (r.actor_name ?? "").toLowerCase().includes(q) ||
          (r.tenant_name ?? "").toLowerCase().includes(q) ||
          r.event_type.toLowerCase().includes(q) ||
          JSON.stringify(r.metadata ?? {}).toLowerCase().includes(q)
      );
    }

    // Exact totals across every row, independent of the row page size / filters.
    const base = () =>
      supabase.from("platform_activity_log").select("*", { count: "exact", head: true });

    const [total, logins, memberAdds, checkins] = await Promise.all([
      base(),
      base().eq("event_type", "login"),
      base().eq("event_type", "member_add"),
      base().eq("event_type", "checkin"),
    ]);

    if (total.error) throw total.error;

    return {
      data: {
        rows,
        totalEvents: total.count ?? 0,
        logins: logins.count ?? 0,
        memberAdds: memberAdds.count ?? 0,
        checkins: checkins.count ?? 0,
      },
      error: null,
    };
  } catch (err) {
    return { data: null, error: extractMessage(err, "[getActivityPageData]") };
  }
}
