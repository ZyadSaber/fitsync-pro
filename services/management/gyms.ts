"use server";

import isArrayHasData from "@/lib/isArrayHasData";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type {
  GymListItem,
  PlatformSubscriptionDetails,
  PlatformBillingRecord,
  BillingRecordStatus,
} from "@/types/gyms";
import type { ActionResult } from "@/types/common";
import type { SelectOptions } from "@/types/ui";
import { gymSchema, type GymFormData } from "@/validations/gymSchema";
import extractMessage from "@/lib/extractMessage";


// ---------------------------------------------------------------------------
// Subscription plan catalog
// ---------------------------------------------------------------------------

export async function getActiveSubscriptionPlanOptions(): Promise<SelectOptions[]> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("subscription_plans")
    .select("slug, name")
    .eq("is_active", true)
    .order("name");

  if (error || !isArrayHasData(data)) return [];

  return data.map((plan) => ({ key: plan.slug, label: plan.name }));
}

// ---------------------------------------------------------------------------
// Gym list (super admin overview)
// ---------------------------------------------------------------------------

export type GymsResult = { data: GymListItem[]; error: null | string };

export async function getGyms(): Promise<GymsResult> {
  const supabase = await createServerSupabaseClient();

  try {
    const { data, error } = await supabase
      .from("gym_list")
      .select("id, name, address, phone, logo_url, created_at, plan_name, price_egp, subscription_status, member_count, last_activity_at, member_limit, plan_id");

    if (error) throw error;

    const computedData = !isArrayHasData(data) ? [] :
      data.map(item => ({
        id: item.id,
        name: item.name,
        address: item.address ?? "",
        phone: item.phone ?? "",
        logo_url: item.logo_url ?? "",
        joinedAt: item.created_at,
        plan: item.plan_name ?? "",
        plan_id: item.plan_id ?? "",
        planPriceEgp: item.price_egp != null ? Number(item.price_egp) : ("" as ""),
        status: item.subscription_status ?? "unknown",
        memberCount: Number(item.member_count ?? 0),
        lastActivityAt: item.last_activity_at ?? "",
        member_limit: Number(item.member_limit ?? 0),
      }));

    return { data: computedData, error: null };
  } catch (err) {
    return { data: [], error: extractMessage(err, "[getGyms]") };
  }
}

// ---------------------------------------------------------------------------
// Gym mutations (Server Actions)
// ---------------------------------------------------------------------------

export async function createGym(data: GymFormData): Promise<ActionResult> {
  const parsed = gymSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Unauthenticated" };

  const { data: gym, error } = await supabase
    .from("gyms")
    .insert({
      name: parsed.data.name,
      address: parsed.data.address || null,
      phone: parsed.data.phone || null,
      logo_url: parsed.data.logo_url || null,
      owner_id: user.id,
    })
    .select("id")
    .single();

  if (error) return { success: false, error: error.message };

  revalidatePath("/[locale]/management/gyms", "page");
  return { success: true, id: gym.id };
}

export async function updateGym(id: string, data: GymFormData): Promise<ActionResult> {
  const parsed = gymSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const supabase = await createServerSupabaseClient();

  const { error } = await supabase
    .from("gyms")
    .update({
      name: parsed.data.name,
      address: parsed.data.address || null,
      phone: parsed.data.phone || null,
      logo_url: parsed.data.logo_url || null,
    })
    .eq("id", id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/[locale]/management/gyms", "page");
  return { success: true, id };
}

export async function deleteGym(id: string): Promise<ActionResult> {
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase.from("gyms").delete().eq("id", id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/[locale]/management/gyms", "page");
  return { success: true, id };
}

// ---------------------------------------------------------------------------
// Platform subscription details (per gym)
// ---------------------------------------------------------------------------

export type SubscriptionResult =
  | { data: PlatformSubscriptionDetails; error: null }
  | { data: null; error: string };

export async function getGymSubscription(gymId: string): Promise<SubscriptionResult> {
  const supabase = await createServerSupabaseClient();

  try {
    const { data, error } = await supabase
      .from("platform_subscription_details")
      .select("*")
      .eq("gym_id", gymId)
      .order("started_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    if (!data) return { data: null, error: "No subscription found" };

    return { data: data as PlatformSubscriptionDetails, error: null };
  } catch (err) {
    return { data: null, error: extractMessage(err, "[getGymSubscription]") };
  }
}

// ---------------------------------------------------------------------------
// Billing records
// ---------------------------------------------------------------------------

export type BillingHistoryResult = { data: PlatformBillingRecord[]; error: null | string };

export async function getGymBillingHistory(gymId: string): Promise<BillingHistoryResult> {
  const supabase = await createServerSupabaseClient();

  try {
    const { data, error } = await supabase
      .from("platform_billing_records")
      .select("*")
      .eq("gym_id", gymId)
      .order("period_start", { ascending: false });

    if (error) throw error;

    return {
      data: (data ?? []) as PlatformBillingRecord[],
      error: null,
    };
  } catch (err) {
    return { data: [], error: extractMessage(err, "[getGymBillingHistory]") };
  }
}

export type BillingRecordResult =
  | { data: PlatformBillingRecord; error: null }
  | { data: null; error: string };

export async function createBillingRecord(
  record: Omit<PlatformBillingRecord, "id" | "created_at">
): Promise<BillingRecordResult> {
  const supabase = await createServerSupabaseClient();

  try {
    const { data, error } = await supabase
      .from("platform_billing_records")
      .insert(record)
      .select()
      .single();

    if (error) throw error;

    return { data: data as PlatformBillingRecord, error: null };
  } catch (err) {
    return { data: null, error: extractMessage(err, "[createBillingRecord]") };
  }
}

export async function updateBillingRecordStatus(
  recordId: string,
  status: BillingRecordStatus,
  paidAt?: string
): Promise<{ error: null | string }> {
  const supabase = await createServerSupabaseClient();

  try {
    const { error } = await supabase
      .from("platform_billing_records")
      .update({
        status,
        ...(status === "paid" && paidAt ? { paid_at: paidAt } : {}),
      })
      .eq("id", recordId);

    if (error) throw error;

    return { error: null };
  } catch (err) {
    return { error: extractMessage(err, "[updateBillingRecordStatus]") };
  }
}

