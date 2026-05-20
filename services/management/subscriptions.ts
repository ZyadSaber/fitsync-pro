"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import extractMessage from "@/lib/extractMessage";
import type { SubscriptionPlanStats, BillingRecordListItem } from "@/types/subscriptions";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/types/common";
import { planFormSchema, invoiceFormSchema, type PlanFormData, type InvoiceFormData } from "@/validations/subscriptionSchema";

const REVALIDATE = () => revalidatePath("/[locale]/management/subscriptions", "page");

// ---------------------------------------------------------------------------
// Subscription plan stats (plan catalog + tenant counts + MRR)
// ---------------------------------------------------------------------------

export type PlanStatsResult = { data: SubscriptionPlanStats[]; error: null | string };

export async function getSubscriptionPlanStats(): Promise<PlanStatsResult> {
  const supabase = await createServerSupabaseClient();

  try {
    const { data, error } = await supabase
      .from("subscription_plan_stats")
      .select("*");

    if (error) throw error;

    return { data: (data ?? []) as SubscriptionPlanStats[], error: null };
  } catch (err) {
    return { data: [], error: extractMessage(err, "[getSubscriptionPlanStats]") };
  }
}

// ---------------------------------------------------------------------------
// Plan CRUD
// ---------------------------------------------------------------------------

export async function createSubscriptionPlan(data: PlanFormData): Promise<ActionResult> {
  const parsed = planFormSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  const supabase = await createServerSupabaseClient();

  try {
    const { data: row, error } = await supabase
      .from("subscription_plans")
      .insert({
        name: parsed.data.name,
        slug: parsed.data.slug,
        description: parsed.data.description,
        price_egp: parseFloat(parsed.data.price_egp) || 0,
        billing_cycle: parsed.data.billing_cycle,
        duration_days: parseInt(parsed.data.duration_days) || 30,
        member_limit: parseInt(parsed.data.member_limit),
        type: parsed.data.type,
        features: parsed.data.features.split("\n").map((f) => f.trim()).filter(Boolean),
        is_active: parsed.data.is_active,
      })
      .select("id")
      .single();

    if (error) throw error;

    REVALIDATE();
    return { success: true, id: row.id };
  } catch (err) {
    return { success: false, error: extractMessage(err, "[createSubscriptionPlan]") };
  }
}

export async function updateSubscriptionPlan(id: string, data: PlanFormData): Promise<ActionResult> {
  const parsed = planFormSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  const supabase = await createServerSupabaseClient();

  try {
    const { error } = await supabase
      .from("subscription_plans")
      .update({
        name: parsed.data.name,
        slug: parsed.data.slug,
        description: parsed.data.description || null,
        price_egp: parsed.data.price_egp === "" ? null : parseFloat(parsed.data.price_egp) || 0,
        billing_cycle: parsed.data.billing_cycle,
        duration_days: parseInt(parsed.data.duration_days) || 30,
        member_limit: parsed.data.member_limit === "" ? null : parseInt(parsed.data.member_limit) || null,
        type: parsed.data.type,
        features: parsed.data.features.split("\n").map((f) => f.trim()).filter(Boolean),
        is_active: parsed.data.is_active,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) throw error;

    REVALIDATE();
    return { success: true, id };
  } catch (err) {
    return { success: false, error: extractMessage(err, "[updateSubscriptionPlan]") };
  }
}

export async function deleteSubscriptionPlan(id: string): Promise<ActionResult> {
  const supabase = await createServerSupabaseClient();

  try {
    const { error } = await supabase
      .from("subscription_plans")
      .delete()
      .eq("id", id);

    if (error) throw error;

    REVALIDATE();
    return { success: true, id };
  } catch (err) {
    return { success: false, error: extractMessage(err, "[deleteSubscriptionPlan]") };
  }
}

// ---------------------------------------------------------------------------
// Platform billing records (invoice list)
// ---------------------------------------------------------------------------

export type BillingListResult = { data: BillingRecordListItem[]; error: null | string };

export async function getPlatformBillingRecords(filter?: {
  status?: string;
}): Promise<BillingListResult> {
  const supabase = await createServerSupabaseClient();

  try {
    let query = supabase
      .from("platform_billing_records")
      .select("id, subscription_id, gym_id, amount_egp, billing_cycle, period_start, period_end, next_billing_at, status, paid_at, notes, created_at, gyms(name)")
      .order("created_at", { ascending: false })
      .limit(100);

    if (filter?.status && filter.status !== "all") {
      query = query.eq("status", filter.status) as typeof query;
    }

    const { data, error } = await query;

    if (error) throw error;

    return {
      data: (data ?? []).map((row) => ({
        ...row,
        gym_name: row.gyms?.name ?? "Unknown",
      })) as BillingRecordListItem[],
      error: null,
    };
  } catch (err) {
    return { data: [], error: extractMessage(err, "[getPlatformBillingRecords]") };
  }
}

// ---------------------------------------------------------------------------
// Invoice (billing record) CRUD
// ---------------------------------------------------------------------------

export async function createCustomBillingRecord(data: InvoiceFormData): Promise<ActionResult> {
  const parsed = invoiceFormSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  const supabase = await createServerSupabaseClient();

  try {
    const { data: row, error } = await supabase
      .from("platform_billing_records")
      .insert({
        subscription_id: parsed.data.subscription_id,
        gym_id: parsed.data.gym_id,
        amount_egp: parseFloat(parsed.data.amount_egp),
        billing_cycle: parsed.data.billing_cycle,
        period_start: parsed.data.period_start,
        period_end: parsed.data.period_end,
        next_billing_at: parsed.data.next_billing_at || null,
        status: parsed.data.status,
        paid_at: parsed.data.paid_at || null,
        notes: parsed.data.notes || null,
      })
      .select("id")
      .single();

    if (error) throw error;

    REVALIDATE();
    return { success: true, id: row.id };
  } catch (err) {
    return { success: false, error: extractMessage(err, "[createCustomBillingRecord]") };
  }
}

export async function updateBillingRecord(id: string, data: InvoiceFormData): Promise<ActionResult> {
  const parsed = invoiceFormSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  const supabase = await createServerSupabaseClient();

  try {
    const { error } = await supabase
      .from("platform_billing_records")
      .update({
        amount_egp: parseFloat(parsed.data.amount_egp),
        billing_cycle: parsed.data.billing_cycle,
        period_start: parsed.data.period_start,
        period_end: parsed.data.period_end,
        next_billing_at: parsed.data.next_billing_at || null,
        status: parsed.data.status,
        paid_at: parsed.data.paid_at || null,
        notes: parsed.data.notes || null,
      })
      .eq("id", id);

    if (error) throw error;

    REVALIDATE();
    return { success: true, id };
  } catch (err) {
    return { success: false, error: extractMessage(err, "[updateBillingRecord]") };
  }
}

// ---------------------------------------------------------------------------
// Mark billing record as paid
// ---------------------------------------------------------------------------

export async function markBillingRecordPaid(recordId: string): Promise<ActionResult> {
  const supabase = await createServerSupabaseClient();

  try {
    const { error } = await supabase
      .from("platform_billing_records")
      .update({ status: "paid", paid_at: new Date().toISOString() })
      .eq("id", recordId);

    if (error) throw error;

    REVALIDATE();
    return { success: true, id: recordId };
  } catch (err) {
    return { success: false, error: extractMessage(err, "[markBillingRecordPaid]") };
  }
}

// ---------------------------------------------------------------------------
// Delete billing record
// ---------------------------------------------------------------------------

export async function deleteBillingRecord(recordId: string): Promise<ActionResult> {
  const supabase = await createServerSupabaseClient();

  try {
    const { error } = await supabase
      .from("platform_billing_records")
      .delete()
      .eq("id", recordId);

    if (error) throw error;

    REVALIDATE();
    return { success: true, id: recordId };
  } catch (err) {
    return { success: false, error: extractMessage(err, "[deleteBillingRecord]") };
  }
}
