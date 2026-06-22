/**
 * Client-side data-access for Management → Subscriptions.
 *
 * Thin wrappers over the Express REST API (server/src/routes/subscriptions.ts).
 * Mutating helpers keep the legacy `ActionResult` shape and invalidate the
 * relevant React Query caches; the single read helper keeps the legacy
 * `{ data, error }` shape expected by the assign-plan guard.
 */
import { api, ApiError } from "@/apps/dashboard/src/lib/api";
import { queryClient } from "@/apps/dashboard/src/lib/queryClient";
import type { ActionResult } from "@/types/common";
import type { PlanFormData, InvoiceFormData, AssignPlanFormData, InstallmentRow } from "@/validations/subscriptionSchema";
import type { TenantType } from "@/types/subscriptions";

const errorOf = (err: unknown): string =>
  err instanceof ApiError ? err.message : err instanceof Error ? err.message : "Request failed";

const invalidatePlans = () => queryClient.invalidateQueries({ queryKey: ["subscription-plans"] });
const invalidateBilling = () => {
  queryClient.invalidateQueries({ queryKey: ["billing-records"] });
  queryClient.invalidateQueries({ queryKey: ["billing-counts"] });
};

// ── Plans ──────────────────────────────────────────────────────────────────
export async function createSubscriptionPlan(data: PlanFormData): Promise<ActionResult> {
  try {
    const { id } = await api.post<{ id: string }>("/subscriptions/plans", data);
    await invalidatePlans();
    return { success: true, id };
  } catch (err) {
    return { success: false, error: errorOf(err) };
  }
}

export async function updateSubscriptionPlan(id: string, data: PlanFormData): Promise<ActionResult> {
  try {
    await api.put(`/subscriptions/plans/${id}`, data);
    await invalidatePlans();
    return { success: true, id };
  } catch (err) {
    return { success: false, error: errorOf(err) };
  }
}

export async function deleteSubscriptionPlan(id: string): Promise<ActionResult> {
  try {
    await api.del(`/subscriptions/plans/${id}`);
    await invalidatePlans();
    return { success: true, id };
  } catch (err) {
    return { success: false, error: errorOf(err) };
  }
}

// ── Billing records ────────────────────────────────────────────────────────
export async function createCustomBillingRecord(data: InvoiceFormData): Promise<ActionResult> {
  try {
    const { id } = await api.post<{ id: string }>("/subscriptions/billing", data);
    await invalidateBilling();
    return { success: true, id };
  } catch (err) {
    return { success: false, error: errorOf(err) };
  }
}

export async function updateBillingRecord(id: string, data: InvoiceFormData): Promise<ActionResult> {
  try {
    await api.put(`/subscriptions/billing/${id}`, data);
    await invalidateBilling();
    return { success: true, id };
  } catch (err) {
    return { success: false, error: errorOf(err) };
  }
}

export async function markBillingRecordPaid(id: string): Promise<ActionResult> {
  try {
    await api.post(`/subscriptions/billing/${id}/mark-paid`);
    await invalidateBilling();
    return { success: true, id };
  } catch (err) {
    return { success: false, error: errorOf(err) };
  }
}

export async function deleteBillingRecord(id: string): Promise<ActionResult> {
  try {
    await api.del(`/subscriptions/billing/${id}`);
    await invalidateBilling();
    return { success: true, id };
  } catch (err) {
    return { success: false, error: errorOf(err) };
  }
}

// ── Tenant assignment ──────────────────────────────────────────────────────
export interface TenantAssignmentState {
  hasActiveSubscription: boolean;
  openInvoiceCount: number;
}

export async function getTenantAssignmentState(
  tenantType: TenantType,
  tenantId: string
): Promise<{ data: TenantAssignmentState | null; error: string | null }> {
  if (!tenantId) return { data: null, error: null };
  try {
    const data = await api.get<TenantAssignmentState | null>(
      `/subscriptions/tenant/${tenantType}/${tenantId}/assignment-state`
    );
    return { data, error: null };
  } catch (err) {
    return { data: null, error: errorOf(err) };
  }
}

export async function getActiveSubscriptionIdForGym(gymId: string): Promise<string | null> {
  const res = await api.get<{ id: string } | null>(`/subscriptions/gym/${gymId}/active`);
  return res?.id ?? null;
}

export async function assignPlanToTenant(
  data: AssignPlanFormData,
  installments: InstallmentRow[]
): Promise<ActionResult> {
  try {
    const { id } = await api.post<{ id: string }>("/subscriptions/assign-plan", { data, installments });
    await invalidateBilling();
    await invalidatePlans();
    return { success: true, id };
  } catch (err) {
    return { success: false, error: errorOf(err) };
  }
}
