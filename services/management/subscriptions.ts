"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import extractMessage from "@/lib/extractMessage";
import type { SubscriptionPlanStats, BillingRecordListItem } from "@/types/subscriptions";
import type { SelectOptions } from "@/types/ui";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/types/common";
import { planFormSchema, invoiceFormSchema, assignPlanSchema, installmentRowSchema, type PlanFormData, type InvoiceFormData, type AssignPlanFormData, type InstallmentRow } from "@/validations/subscriptionSchema";

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
        features: parsed.data.features,
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
        features: parsed.data.features,
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

// ---------------------------------------------------------------------------
// Assign a plan to a gym or online coach
// ---------------------------------------------------------------------------

export async function assignPlanToTenant(
  data: AssignPlanFormData,
  installments: InstallmentRow[],
): Promise<ActionResult> {
  const parsed = assignPlanSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  if (!installments.length) return { success: false, error: "At least one payment installment is required" };

  const rowsValidation = installments.map((r) => installmentRowSchema.safeParse(r));
  const badRow = rowsValidation.find((r) => !r.success);
  if (badRow && !badRow.success) return { success: false, error: badRow.error.issues[0].message };

  const supabase = await createServerSupabaseClient();

  const { data: plan, error: planError } = await supabase
    .from("subscription_plans")
    .select("slug, price_egp, duration_days")
    .eq("id", parsed.data.plan_id)
    .single();

  if (planError || !plan) return { success: false, error: "Plan not found" };

  const qty = Math.max(1, parseInt(parsed.data.quantity) || 1);
  const cycleDays = parsed.data.billing_cycle === "yearly" ? 365 : 30;
  const totalDays = plan.duration_days * qty;

  const started = new Date(parsed.data.started_at);
  const ended = new Date(started);
  ended.setDate(ended.getDate() + totalDays);

  // Sort installments by due date for next_billing_at
  const sorted = [...installments].sort((a, b) => a.due_date.localeCompare(b.due_date));
  const lastDue = sorted[sorted.length - 1]?.due_date ?? null;

  try {
    const { data: sub, error: subError } = await supabase
      .from("platform_subscriptions")
      .insert({
        gym_id:         parsed.data.tenant_type === "gym" ? parsed.data.gym_id : null,
        coach_id:       parsed.data.tenant_type === "online_coach" ? parsed.data.coach_id : null,
        plan_id:        parsed.data.plan_id,
        plan_name:      plan.slug,
        price_egp:      plan.price_egp ?? 0,
        billing_cycle:  parsed.data.billing_cycle,
        status:         "active",
        started_at:     parsed.data.started_at,
        next_billing_at: lastDue,
        notes:          parsed.data.notes || "",
      })
      .select("id")
      .single();

    if (subError) throw subError;

    const billingRows = installments.map((inst) => ({
      subscription_id: sub.id,
      gym_id:          parsed.data.tenant_type === "gym" ? parsed.data.gym_id : null,
      coach_id:        parsed.data.tenant_type === "online_coach" ? parsed.data.coach_id : null,
      amount_egp:      parseFloat(inst.amount),
      billing_cycle:   parsed.data.billing_cycle,
      period_start:    parsed.data.started_at,
      period_end:      ended.toISOString().slice(0, 10),
      next_billing_at: inst.due_date,
      status:          "pending" as const,
      notes:           inst.label || null,
    }));

    const { error: billError } = await supabase
      .from("platform_billing_records")
      .insert(billingRows);

    if (billError) throw billError;

    REVALIDATE();
    return { success: true, id: sub.id };
  } catch (err) {
    return { success: false, error: extractMessage(err, "[assignPlanToTenant]") };
  }
}

// ---------------------------------------------------------------------------
// Coach options for assign-plan dialog
// ---------------------------------------------------------------------------

export async function getCoachSelectOptions(): Promise<SelectOptions[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("online_coach_list")
    .select("id, full_name")
    .order("full_name");
  if (error || !data) return [];
  return data.map((c) => ({ key: c.id, label: c.full_name }));
}
