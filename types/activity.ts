// Known platform event types written to platform_activity_log. The log column
// is a free-form TEXT, so the UI must also tolerate unknown values gracefully.
export type ActivityEventType =
  | "gym_created"
  | "login"
  | "member_add"
  | "member_status_change"
  | "plan_change"
  | "checkin";

// At most one of (gym_id, coach_id) is set; tenant_type/tenant_name resolve
// whichever module owns the event ("platform" when neither is set).
export type ActivityTenantType = "gym" | "online_coach" | "platform";

export interface ActivityListItem {
  id: string;
  gym_id: string | null;
  gym_name: string | null;
  coach_id: string | null;
  coach_name: string | null;
  coach_avatar_url: string | null;
  tenant_type: ActivityTenantType;
  tenant_name: string | null;
  event_type: string;
  actor_id: string | null;
  actor_name: string | null;
  actor_avatar_url: string | null;
  actor_type: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}
