export interface PlatformUser {
  id: string;
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  user_type: "member" | "gym" | "coach";
  gym_id: string | null;
  created_at: string;
}

export interface CoachListItem {
  id: string;
  profile_id: string;
  full_name: string;
  phone: string;
  avatar_url: string;
  bio: string;
  specialties: string[];
  created_at: string;

  // clients
  client_count: number;

  // billing
  billing_status: "active" | "suspended" | "cancelled" | null;
  is_billing_active: boolean;
  last_billing_at: string | null;

  // plan
  plan_name: string | null;
  member_limit: number | null;
}
