"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";
import extractMessage from "@/lib/extractMessage";
import isArrayHasData from "@/lib/isArrayHasData";
import type { CoachListItem, PlatformUser } from "@/types/coaches";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/types/common";
import { coachFormSchema, createCoachSchema, type CoachFormData, type CreateCoachFormData } from "@/validations/coachSchema";
import type { SelectOptions } from "@/types/ui";

// Anon client used only for auth.signUp — does NOT carry the admin session.
const anonClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

const REVALIDATE = () => revalidatePath("/[locale]/management/coaches", "page");

// ---------------------------------------------------------------------------
// Subscription plan options (reused from subscription_plans table)
// ---------------------------------------------------------------------------

export async function getActiveCoachPlanOptions(): Promise<SelectOptions[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("subscription_plans")
    .select("name")
    .eq("is_active", true)
    .order("name");
  if (error || !isArrayHasData(data)) return [];
  return data.map((plan) => ({ key: plan.name, label: plan.name }));
}

// ---------------------------------------------------------------------------
// Platform users that can be promoted to online coach
// ---------------------------------------------------------------------------

export type PlatformUsersResult = { data: PlatformUser[]; error: null | string };

export async function getNonCoachUsers(): Promise<PlatformUsersResult> {
  const supabase = await createServerSupabaseClient();
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, phone, avatar_url, user_type, gym_id, created_at")
      .eq("user_type", "member")
      .order("full_name", { ascending: true });

    if (error) throw error;
    return {
      data: isArrayHasData(data) ? (data as PlatformUser[]) : [],
      error: null,
    };
  } catch (err) {
    return { data: [], error: extractMessage(err, "[getNonCoachUsers]") };
  }
}

export async function promoteToCoach(profileId: string): Promise<ActionResult> {
  const supabase = await createServerSupabaseClient();
  try {
    const [{ error: profileError }, { error: coachError }] = await Promise.all([
      supabase
        .from("profiles")
        .update({ user_type: "coach", gym_id: null })
        .eq("id", profileId),
      supabase.from("coaches").insert({
        profile_id: profileId,
        gym_id: null,
        bio: null,
        specialties: [],
      }),
    ]);

    if (profileError) throw profileError;
    if (coachError) throw coachError;

    REVALIDATE();
    return { success: true, id: profileId };
  } catch (err) {
    return { success: false, error: extractMessage(err, "[promoteToCoach]") };
  }
}

// ---------------------------------------------------------------------------
// Coach list (super admin overview)
// ---------------------------------------------------------------------------

export type CoachesResult = { data: CoachListItem[]; error: null | string };

export async function getCoaches(): Promise<CoachesResult> {
  const supabase = await createServerSupabaseClient();

  try {
    const { data, error } = await supabase
      .from("online_coach_list")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return {
      data: isArrayHasData(data) ? (data as CoachListItem[]) : [],
      error: null,
    };
  } catch (err) {
    return { data: [], error: extractMessage(err, "[getCoaches]") };
  }
}

// ---------------------------------------------------------------------------
// Coach mutations (Server Actions)
// ---------------------------------------------------------------------------

export async function updateCoach(
  coachId: string,
  profileId: string,
  data: CoachFormData
): Promise<ActionResult> {
  const parsed = coachFormSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  const supabase = await createServerSupabaseClient();

  try {
    const [{ error: profileError }, { error: coachError }] = await Promise.all([
      supabase
        .from("profiles")
        .update({
          full_name: parsed.data.full_name,
          phone: parsed.data.phone || null,
        })
        .eq("id", profileId),
      supabase
        .from("coaches")
        .update({
          bio: parsed.data.bio || null,
          specialties: parsed.data.specialties,
        })
        .eq("id", coachId),
    ]);

    if (profileError) throw profileError;
    if (coachError) throw coachError;

    REVALIDATE();
    return { success: true, id: coachId };
  } catch (err) {
    return { success: false, error: extractMessage(err, "[updateCoach]") };
  }
}

export async function createCoach(data: CreateCoachFormData): Promise<ActionResult> {
  const parsed = createCoachSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  // Step 1: sign up the new user with a random password.
  // The trigger auto-creates their profiles row.
  // They'll receive a confirmation email and can set a real password via "forgot password".
  const { data: signUpData, error: signUpError } = await anonClient().auth.signUp({
    email: parsed.data.email,
    password: crypto.randomUUID(),
  });
  if (signUpError) return { success: false, error: signUpError.message };

  const profileId = signUpData.user?.id;
  if (!profileId) return { success: false, error: "Sign-up succeeded but no user ID returned." };

  // Step 2: update the profile and create the coach record using the super admin's session.
  const supabase = await createServerSupabaseClient();
  try {
    const [{ error: profileError }, { error: coachError }] = await Promise.all([
      supabase
        .from("profiles")
        .update({
          full_name: parsed.data.full_name,
          phone: parsed.data.phone || null,
          user_type: "coach",
        })
        .eq("id", profileId),
      supabase.from("coaches").insert({
        profile_id: profileId,
        bio: parsed.data.bio || null,
        specialties: parsed.data.specialties,
        gym_id: null,
      }),
    ]);

    if (profileError) throw profileError;
    if (coachError) throw coachError;

    REVALIDATE();
    return { success: true, id: profileId };
  } catch (err) {
    return { success: false, error: extractMessage(err, "[createCoach]") };
  }
}

export async function deleteCoach(coachId: string): Promise<ActionResult> {
  const supabase = await createServerSupabaseClient();

  try {
    const { error } = await supabase
      .from("coaches")
      .delete()
      .eq("id", coachId);

    if (error) throw error;

    REVALIDATE();
    return { success: true, id: coachId };
  } catch (err) {
    return { success: false, error: extractMessage(err, "[deleteCoach]") };
  }
}
