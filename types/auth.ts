import type { SupabaseClient } from "@supabase/supabase-js";

export type SessionProfile = {
  id: string;
  full_name: string | null;
  gym_id: string | null;
};

export type SessionContext = {
  supabase: SupabaseClient;
  userId: string;
  profile: SessionProfile | null;
};
