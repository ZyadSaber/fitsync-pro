import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { SessionProfile, SessionContext } from "@/types/auth";

export type { SessionProfile, SessionContext };

export async function getSessionContext(): Promise<SessionContext> {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userId = user?.id ?? "";

  if (!userId) return { supabase, userId, profile: null };

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, gym_id")
    .eq("id", userId)
    .single();

  return { supabase, userId, profile };
}
