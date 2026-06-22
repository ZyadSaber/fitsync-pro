import { query, queryOne } from "../pool.js";
import type { ActivityListItem } from "@/types/activity";
import type { ActivityFilters } from "@/validations/activitySchema";

export interface ActivityPageData {
  rows: ActivityListItem[];
  // KPI totals are over ALL events, independent of the active filters.
  totalEvents: number;
  logins: number;
  memberAdds: number;
  checkins: number;
}

// Reads from the platform_activity_log_list view (gym + actor names joined).
// Gym / coach / event / date-range filters run on the database; the free-text
// search runs in memory over the page of rows so it can match nested metadata.
export async function getActivityPageData(
  filters: ActivityFilters
): Promise<ActivityPageData> {
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (filters.gym) {
    params.push(filters.gym);
    conditions.push(`gym_id = $${params.length}`);
  }
  if (filters.coach) {
    params.push(filters.coach);
    conditions.push(`coach_id = $${params.length}`);
  }
  if (filters.event && filters.event !== "all") {
    params.push(filters.event);
    conditions.push(`event_type = $${params.length}`);
  }
  if (filters.from) {
    params.push(filters.from);
    conditions.push(`created_at >= $${params.length}`);
  }
  if (filters.to) {
    // `to` is a date-only string; include the whole day.
    params.push(`${filters.to}T23:59:59`);
    conditions.push(`created_at <= $${params.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const { rows } = await query<ActivityListItem>(
    `SELECT id, gym_id, gym_name, coach_id, coach_name, coach_avatar_url,
            tenant_type, tenant_name, event_type, actor_id, actor_name,
            actor_avatar_url, actor_type, metadata, created_at
       FROM platform_activity_log_list
       ${where}
       ORDER BY created_at DESC
       LIMIT 200`,
    params
  );

  let filtered = rows;
  const q = filters.search?.toLowerCase().trim();
  if (q) {
    filtered = rows.filter(
      (r) =>
        (r.actor_name ?? "").toLowerCase().includes(q) ||
        (r.tenant_name ?? "").toLowerCase().includes(q) ||
        r.event_type.toLowerCase().includes(q) ||
        JSON.stringify(r.metadata ?? {}).toLowerCase().includes(q)
    );
  }

  // Exact totals across every row, independent of the row page size / filters.
  const counts = await queryOne<{
    total: string;
    logins: string;
    member_adds: string;
    checkins: string;
  }>(
    `SELECT
       count(*)                                      AS total,
       count(*) FILTER (WHERE event_type = 'login')      AS logins,
       count(*) FILTER (WHERE event_type = 'member_add') AS member_adds,
       count(*) FILTER (WHERE event_type = 'checkin')    AS checkins
     FROM platform_activity_log`
  );

  return {
    rows: filtered,
    totalEvents: Number(counts?.total ?? 0),
    logins: Number(counts?.logins ?? 0),
    memberAdds: Number(counts?.member_adds ?? 0),
    checkins: Number(counts?.checkins ?? 0),
  };
}
