"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import extractMessage from "@/lib/extractMessage";
import type { SubscriptionPlanStats, BillingRecordListItem, TenantType } from "@/types/subscriptions";
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
        description: parsed.data.description,
        price_egp: parsed.data.price_egp === "" ? null : parseFloat(parsed.data.price_egp) || 0,
        billing_cycle: parsed.data.billing_cycle,
        duration_days: parseInt(parsed.data.duration_days) || 30,
        member_limit: parsed.data.member_limit === "" ? null : parseInt(parsed.data.member_limit) || null,
        coach_limit: parsed.data.type === "gym"
          ? (parsed.data.coach_limit === "" ? null : parseInt(parsed.data.coach_limit) || null)
          : null,
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
        description: parsed.data.description || null,
        price_egp: parsed.data.price_egp === "" ? null : parseFloat(parsed.data.price_egp) || 0,
        billing_cycle: parsed.data.billing_cycle,
        duration_days: parseInt(parsed.data.duration_days) || 30,
        member_limit: parsed.data.member_limit === "" ? null : parseInt(parsed.data.member_limit) || null,
        coach_limit: parsed.data.type === "gym"
          ? (parsed.data.coach_limit === "" ? null : parseInt(parsed.data.coach_limit) || null)
          : null,
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
  planType?: string;
}): Promise<BillingListResult> {
  const supabase = await createServerSupabaseClient();

  try {
    let query = supabase
      .from("platform_billing_records")
      .select("id, subscription_id, gym_id, coach_id, amount_egp, billing_cycle, period_start, period_end, next_billing_at, status, paid_at, notes, created_at, gyms(name), coaches(profiles(full_name))")
      .order("created_at", { ascending: false })
      .limit(100);

    if (filter?.status && filter.status !== "all") {
      query = query.eq("status", filter.status) as typeof query;
    }

    // planType maps to the tenant that owns the record: a gym subscription
    // always carries a gym plan, a coach subscription an online_coach plan.
    // Exactly one of (gym_id, coach_id) is set on every row, so filtering by
    // the *other* column being NULL selects the requested plan type.
    const emptyTenantCol =
      filter?.planType === "gym" ? "coach_id"
      : filter?.planType === "online_coach" ? "gym_id"
      : null;
    if (emptyTenantCol) {
      query = query.is(emptyTenantCol, null) as typeof query;
    }

    const { data, error } = await query;

    if (error) throw error;

    return {
      data: (data ?? []).map((row) => {
        // Embedded relations can be inferred as either an object or a
        // single-element array depending on PostgREST; normalise both.
        const first = <T,>(rel: T | T[] | null): T | null =>
          Array.isArray(rel) ? rel[0] ?? null : rel ?? null;
        const gym = first(row.gyms);
        const profile = first(first(row.coaches)?.profiles ?? null);
        // Exactly one of (gym_id, coach_id) is set, so resolve the tenant name
        // from whichever owner the record carries.
        return {
          ...row,
          tenant_name: gym?.name ?? profile?.full_name ?? "Unknown",
          tenant_type: row.gym_id ? "gym" : "online_coach",
        };
      }) as BillingRecordListItem[],
      error: null,
    };
  } catch (err) {
    return { data: [], error: extractMessage(err, "[getPlatformBillingRecords]") };
  }
}

// ---------------------------------------------------------------------------
// Billing status counts (accurate totals, independent of the row page size)
// ---------------------------------------------------------------------------

export type BillingCounts = { total: number; pastDue: number; pending: number };

export async function getBillingStatusCounts(): Promise<{ data: BillingCounts; error: null | string }> {
  const supabase = await createServerSupabaseClient();

  try {
    const base = () =>
      supabase.from("platform_billing_records").select("*", { count: "exact", head: true });

    const [total, pastDue, pending] = await Promise.all([
      base(),
      base().eq("status", "failed"),
      base().eq("status", "pending"),
    ]);

    if (total.error) throw total.error;
    if (pastDue.error) throw pastDue.error;
    if (pending.error) throw pending.error;

    return {
      data: {
        total: total.count ?? 0,
        pastDue: pastDue.count ?? 0,
        pending: pending.count ?? 0,
      },
      error: null,
    };
  } catch (err) {
    return { data: { total: 0, pastDue: 0, pending: 0 }, error: extractMessage(err, "[getBillingStatusCounts]") };
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
// Tenant assignability check (active subscription / open invoices)
// ---------------------------------------------------------------------------
// Before assigning a new plan we surface whether the chosen gym/coach already
// has a live subscription (status = active) or any unpaid invoices
// (status = pending | failed). Either blocks a fresh assignment.

export type TenantAssignmentState = {
  hasActiveSubscription: boolean;
  openInvoiceCount: number;
};

export async function getTenantAssignmentState(
  tenantType: TenantType,
  tenantId: string,
): Promise<{ data: TenantAssignmentState | null; error: null | string }> {
  if (!tenantId) return { data: null, error: null };

  const supabase = await createServerSupabaseClient();
  const ownerColumn = tenantType === "gym" ? "gym_id" : "coach_id";

  try {
    const [activeSub, openInvoices] = await Promise.all([
      supabase
        .from("platform_subscriptions")
        .select("id", { count: "exact", head: true })
        .eq(ownerColumn, tenantId)
        .eq("status", "active"),
      supabase
        .from("platform_billing_records")
        .select("id", { count: "exact", head: true })
        .eq(ownerColumn, tenantId)
        .in("status", ["pending", "failed"]),
    ]);

    if (activeSub.error) throw activeSub.error;
    if (openInvoices.error) throw openInvoices.error;

    return {
      data: {
        hasActiveSubscription: (activeSub.count ?? 0) > 0,
        openInvoiceCount: openInvoices.count ?? 0,
      },
      error: null,
    };
  } catch (err) {
    return { data: null, error: extractMessage(err, "[getTenantAssignmentState]") };
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
    .select("id, name, description, price_egp, duration_days, member_limit, coach_limit, type, features")
    .eq("id", parsed.data.plan_id)
    .single();

  if (planError || !plan) return { success: false, error: "Plan not found" };

  const isGym = parsed.data.tenant_type === "gym";
  const ownerGymId = isGym ? parsed.data.gym_id || null : null;
  const ownerCoachId = !isGym ? parsed.data.coach_id || null : null;

  // Re-check on the server: a tenant with a live subscription or unpaid invoices
  // can't be assigned a fresh plan (the client UI blocks this, but guard races).
  const tenantId = (isGym ? ownerGymId : ownerCoachId) ?? "";
  const tenantState = await getTenantAssignmentState(parsed.data.tenant_type, tenantId);
  if (tenantState.data && (tenantState.data.hasActiveSubscription || tenantState.data.openInvoiceCount > 0)) {
    return {
      success: false,
      error: "This tenant already has an active subscription or unpaid invoices",
    };
  }

  // A contact-pricing template (price_egp = null) must be turned into a
  // private, tenant-specific plan carrying the fully negotiated terms.
  const isContactPlan = plan.price_egp === null;

  // Resolve the private plan's terms: negotiated values for a contact plan,
  // the template's own values otherwise. "" member/coach limits mean unlimited.
  let unitPrice    = plan.price_egp ?? 0;
  let memberLimit  = plan.member_limit;
  let coachLimit   = plan.coach_limit;
  let durationDays = plan.duration_days;
  let features     = plan.features;

  if (isContactPlan) {
    const custom = parseFloat(parsed.data.custom_price ?? "");
    if (!custom || custom <= 0) {
      return { success: false, error: "Enter a negotiated price for this custom plan" };
    }
    unitPrice = custom;

    const ml = parsed.data.custom_member_limit ?? "";
    memberLimit = ml === "" ? null : parseInt(ml) || null;

    const cl = parsed.data.custom_coach_limit ?? "";
    coachLimit = plan.type === "gym" ? (cl === "" ? null : parseInt(cl) || null) : null;

    durationDays = parseInt(parsed.data.custom_duration_days ?? "") || plan.duration_days;
    features     = parsed.data.custom_features ?? [];
  }

  const qty = Math.max(1, parseInt(parsed.data.quantity) || 1);
  const totalDays = durationDays * qty;

  const started = new Date(parsed.data.started_at);
  const ended = new Date(started);
  ended.setDate(ended.getDate() + totalDays);

  // Track partial writes so we can roll them back on any later failure.
  let createdPrivatePlanId: string | null = null;
  let createdSubId: string | null = null;

  try {
    let planId = plan.id;

    if (isContactPlan) {
      const { data: priv, error: privError } = await supabase
        .from("subscription_plans")
        .insert({
          name:           plan.name,
          description:    plan.description,
          price_egp:      unitPrice,
          billing_cycle:  parsed.data.billing_cycle,
          duration_days:  durationDays,
          member_limit:   memberLimit,
          coach_limit:    coachLimit,
          type:           plan.type,
          features:       features,
          is_active:      true,
          is_private:     true,
          owner_gym_id:   ownerGymId,
          owner_coach_id: ownerCoachId,
        })
        .select("id")
        .single();

      if (privError || !priv) throw privError ?? new Error("Failed to create private plan");

      createdPrivatePlanId = priv.id;
      planId = priv.id;
    }

    const { data: sub, error: subError } = await supabase
      .from("platform_subscriptions")
      .insert({
        gym_id:         ownerGymId,
        coach_id:       ownerCoachId,
        plan_id:        planId,
        price_egp:      unitPrice,
        status:         "active",
        started_at:     parsed.data.started_at,
        notes:          parsed.data.notes || "",
      })
      .select("id")
      .single();

    if (subError) throw subError;
    createdSubId = sub.id;

    const billingRows = installments.map((inst) => ({
      subscription_id: sub.id,
      gym_id:          ownerGymId,
      coach_id:        ownerCoachId,
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
    // Compensate for any partial writes so we never leave an orphan
    // subscription or a private plan with no subscription behind it.
    if (createdSubId) {
      await supabase.from("platform_subscriptions").delete().eq("id", createdSubId);
    }
    if (createdPrivatePlanId) {
      await supabase.from("subscription_plans").delete().eq("id", createdPrivatePlanId);
    }
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
