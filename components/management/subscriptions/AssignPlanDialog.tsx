"use client";

import { useMemo, useRef } from "react";
import { format, addMonths, addYears } from "date-fns";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Textarea from "@/components/ui/textarea";
import { SelectField } from "@/components/ui/select";
import Icon from "@/components/ui/Icon";
import { Trash2, Plus, Sparkles, ChevronUp, ChevronDown, GripVertical } from "lucide-react";
import useVisibility from "@/hooks/useVisibility";
import useFormManager from "@/hooks/useFormManager";
import { assignPlanSchema } from "@/validations/subscriptionSchema";
import { assignPlanToTenant, getTenantAssignmentState } from "@/services/management/subscriptions";
import type { SelectOptions } from "@/types/ui";
import type { SubscriptionPlanStats, AssignPlanForm } from "@/types/subscriptions";
import type { InstallmentRow } from "@/validations/subscriptionSchema";
import { toast } from "sonner";

const today = format(new Date(), "yyyy-MM-dd");

const emptyRow = (due_date = today): InstallmentRow => ({
  due_date,
  amount: "",
  label: "",
});

const EMPTY_FORM: AssignPlanForm = {
  tenant_type: "gym",
  gym_id: "",
  coach_id: "",
  plan_id: "",
  billing_cycle: "monthly",
  started_at: today,
  quantity: "1",
  notes: "",
  custom_price: "",
  custom_member_limit: "",
  custom_coach_limit: "",
  custom_duration_days: "",
  custom_features: [],
  installments: [emptyRow()],
  splitCount: "2",
  newFeature: "",
};

interface Props {
  gyms: SelectOptions[];
  coaches: SelectOptions[];
  plans: SubscriptionPlanStats[];
}

export default function AssignPlanDialog({ gyms, coaches, plans }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: "management.subscriptions.assignDialog" });
  const { visible: open, handleOpen, handleClose, handleStateChange } = useVisibility();

  const featureInputRef = useRef<HTMLInputElement>(null);

  const TENANT_TYPE_OPTIONS: SelectOptions[] = [
    { key: "gym", label: t("tenantType.gym") },
    { key: "online_coach", label: t("tenantType.online_coach") },
  ];

  const BILLING_OPTIONS: SelectOptions[] = [
    { key: "monthly", label: t("billing.monthly") },
    { key: "yearly", label: t("billing.yearly") },
  ];

  const {
    formData: form,
    errors,
    handleChange,
    handleFieldChange,
    handleChangeMultiInputs,
    resetForm,
    handleSubmit,
    loading: isPending,
  } = useFormManager<AssignPlanForm>({
    initialData: EMPTY_FORM,
    schema: assignPlanSchema,
    onSubmit: async (data, resetFormFn) => {
      const tenantId = data.tenant_type === "gym" ? data.gym_id : data.coach_id;
      const state = await getTenantAssignmentState(data.tenant_type, tenantId);
      if (state.data && (state.data.hasActiveSubscription || state.data.openInvoiceCount > 0)) {
        toast.error(t("toast.tenantBlocked")); return;
      }

      const plan = plans.find((p) => p.id === data.plan_id);
      if (plan?.price_egp === null && !(parseFloat(data.custom_price) > 0)) {
        toast.error(t("toast.needPrice")); return;
      }
      if (data.installments.some((r) => !r.due_date || !(parseFloat(r.amount) > 0))) {
        toast.error(t("toast.needRows")); return;
      }

      const res = await assignPlanToTenant(data, data.installments);
      if (!res.success) { toast.error(res.error); return; }

      toast.success(t("toast.success"));
      resetFormFn();
      handleClose();
    },
  });

  // Thin setters over the form manager so the schedule + UI-helper fields live
  // in the same form state as everything else.
  const setInstallments = (next: InstallmentRow[]) =>
    handleFieldChange({ name: "installments", value: next });
  const setSplitCount = (value: string) =>
    handleFieldChange({ name: "splitCount", value });
  const setNewFeature = (value: string) =>
    handleFieldChange({ name: "newFeature", value });

  const installments = form.installments;
  const splitCount = form.splitCount;
  const newFeature = form.newFeature;

  // ── Derived ────────────────────────────────────────────────────────────────

  const planOptions = useMemo((): SelectOptions[] =>
    plans
      .filter((p) => p.is_active && p.type === form.tenant_type)
      .map((p) => ({ key: p.id, label: p.name })),
    [plans, form.tenant_type]
  );

  const selectedPlan = useMemo(
    () => plans.find((p) => p.id === form.plan_id),
    [plans, form.plan_id]
  );

  const isGym = form.tenant_type === "gym";
  const isContactPlan = selectedPlan?.price_egp === null;

  // ── Existing-subscription guard ──────────────────────────────────────────────
  // A tenant that already has a live subscription or unpaid invoices can't be
  // assigned a fresh plan — resolve those first to avoid double-billing.
  const selectedTenantId = isGym ? form.gym_id : form.coach_id;

  const { data: tenantState, isFetching: checkingTenant } = useQuery({
    queryKey: ["tenant-assignment-state", form.tenant_type, selectedTenantId],
    queryFn: async () => {
      const res = await getTenantAssignmentState(form.tenant_type, selectedTenantId);
      if (res.error) throw new Error(res.error);
      return res.data;
    },
    enabled: open && !!selectedTenantId,
  });

  const isTenantBlocked =
    !!tenantState &&
    (tenantState.hasActiveSubscription || tenantState.openInvoiceCount > 0);
  const qty = Math.max(1, parseInt(form.quantity) || 1);
  const customPrice = parseFloat(form.custom_price) || 0;

  // Unit price is null when it isn't known yet — no plan picked, or a contact
  // plan whose negotiated price hasn't been entered. That's distinct from 0.
  const unitPrice = isContactPlan
    ? (customPrice > 0 ? customPrice : null)
    : (selectedPlan?.price_egp ?? null);

  const billed = installments.reduce((s, r) => s + (parseFloat(r.amount) || 0), 0);
  const planTotal = unitPrice === null ? null : unitPrice * qty;
  const remaining = planTotal === null ? null : planTotal - billed;
  const isBalanced = planTotal !== null && Math.abs(planTotal - billed) < 0.01;

  const cycleDays = form.billing_cycle === "yearly" ? 365 : 30;
  const effectiveDuration = isContactPlan
    ? (parseInt(form.custom_duration_days) || selectedPlan?.duration_days || cycleDays)
    : (selectedPlan?.duration_days ?? cycleDays);
  const coverageDays = effectiveDuration * qty;

  // ── Helpers ─────────────────────────────────────────────────────────────────

  const handleClose_ = () => { resetForm(); handleClose(); };

  // ── Plan selection ──────────────────────────────────────────────────────────
  // Picking a contact-pricing plan seeds the negotiable terms from the template
  // so the admin tweaks rather than re-types them. Any other plan clears them.

  const handlePlanChange = (v: string) => {
    const plan = plans.find((p) => p.id === v);
    if (plan && plan.price_egp === null) {
      handleChangeMultiInputs({
        plan_id: v,
        custom_member_limit: plan.member_limit === null ? "" : String(plan.member_limit),
        custom_coach_limit: plan.coach_limit === null ? "" : String(plan.coach_limit),
        custom_duration_days: String(plan.duration_days),
        custom_features: [...plan.features],
      });
    } else {
      handleChangeMultiInputs({
        plan_id: v,
        custom_price: "",
        custom_member_limit: "",
        custom_coach_limit: "",
        custom_duration_days: "",
        custom_features: [],
      });
    }
  };

  // ── Custom-plan feature editor ──────────────────────────────────────────────

  const features = form.custom_features ?? [];
  const setFeatures = (next: string[]) =>
    handleFieldChange({ name: "custom_features", value: next });

  const addFeature = () => {
    const trimmed = newFeature.trim();
    if (!trimmed) return;
    setFeatures([...features, trimmed]);
    setNewFeature("");
    featureInputRef.current?.focus();
  };

  const removeFeature = (i: number) =>
    setFeatures(features.filter((_, idx) => idx !== i));

  const moveFeature = (i: number, direction: -1 | 1) => {
    const next = [...features];
    const target = i + direction;
    if (target < 0 || target >= next.length) return;
    [next[i], next[target]] = [next[target], next[i]];
    setFeatures(next);
  };

  // ── Installment mutations ───────────────────────────────────────────────────

  const updateRow = (i: number, key: keyof InstallmentRow, value: string) =>
    setInstallments(installments.map((r, idx) => idx === i ? { ...r, [key]: value } : r));

  const addRow = () => {
    const last = installments[installments.length - 1];
    const nextDate = last?.due_date
      ? format(addMonths(new Date(last.due_date), 1), "yyyy-MM-dd")
      : today;
    setInstallments([...installments, emptyRow(nextDate)]);
  };

  const removeRow = (i: number) => {
    if (installments.length > 1) setInstallments(installments.filter((_, idx) => idx !== i));
  };

  // ── Auto-generate equal installments ───────────────────────────────────────

  const handleGenerate = () => {
    const n = Math.max(1, parseInt(splitCount) || 1);
    const start = new Date(form.started_at);
    const each = planTotal !== null ? (planTotal / n).toFixed(2) : "";

    const generated: InstallmentRow[] = Array.from({ length: n }, (_, i) => {
      const due = form.billing_cycle === "yearly"
        ? addYears(start, i)
        : addMonths(start, i);
      return {
        due_date: format(due, "yyyy-MM-dd"),
        amount: each,
        label: n > 1 ? t("schedule.installmentLabel", { n: i + 1 }) : t("schedule.fullPayment"),
      };
    });

    setInstallments(generated);
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose_(); else handleStateChange(v); }}>
      <Button variant="outline" onClick={handleOpen}>
        <Icon name="tag" size={13} />
        {t("trigger")}
      </Button>

      <DialogContent className="sm:max-w-2xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3 mt-1">

          {/* ── Subscription details ──────────────────────────────────────── */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--muted)]">
              {t("sections.subscription")}
            </span>

            <div className="grid grid-cols-2 gap-2">
              <SelectField
                name="tenant_type"
                label={t("fields.tenantType")}
                options={TENANT_TYPE_OPTIONS}
                value={form.tenant_type}
                onValueChange={(v) =>
                  handleChangeMultiInputs({ tenant_type: v, gym_id: "", coach_id: "", plan_id: "", custom_price: "" })
                }
                hideClear
                containerClassName="w-full"
              />

              {isGym ? (
                <SelectField
                  name="gym_id"
                  label={t("fields.gym")}
                  options={gyms}
                  value={form.gym_id}
                  onValueChange={(v) => handleFieldChange({ name: "gym_id", value: v })}
                  error={errors.gym_id}
                  showSearch
                  searchPlaceholder={t("placeholders.searchGyms")}
                  containerClassName="w-full"
                />
              ) : (
                <SelectField
                  name="coach_id"
                  label={t("fields.onlineCoach")}
                  options={coaches}
                  value={form.coach_id}
                  onValueChange={(v) => handleFieldChange({ name: "coach_id", value: v })}
                  error={errors.coach_id}
                  showSearch
                  searchPlaceholder={t("placeholders.searchCoaches")}
                  containerClassName="w-full"
                />
              )}
            </div>

            {/* Existing-subscription guard */}
            {selectedTenantId && checkingTenant && (
              <div className="flex items-center gap-1.5 text-[11px] text-[var(--muted)] px-0.5">
                <Loader2 size={12} className="animate-spin" />
                {t("guard.checking")}
              </div>
            )}
            {isTenantBlocked && (
              <div className="flex items-start gap-2 rounded-lg border border-[var(--amber)]/30 bg-amber-50 p-2.5">
                <AlertTriangle size={14} className="text-[var(--amber)] shrink-0 mt-0.5" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-[11px] font-semibold text-[var(--amber)]">
                    {t("guard.title")}
                  </span>
                  <span className="text-[11px] text-[var(--muted)]">
                    {tenantState?.hasActiveSubscription && t("guard.activeSubscription")}
                    {tenantState?.hasActiveSubscription && tenantState.openInvoiceCount > 0 && " "}
                    {!!tenantState && tenantState.openInvoiceCount > 0 &&
                      t("guard.openInvoices", { count: tenantState.openInvoiceCount })}
                  </span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-[1fr_80px_120px_120px] gap-2">
              <SelectField
                name="plan_id"
                label={t("fields.plan")}
                options={planOptions}
                value={form.plan_id}
                onValueChange={handlePlanChange}
                error={errors.plan_id}
                containerClassName="w-full"
              />

              <Input
                name="quantity"
                label={t("fields.qty")}
                type="text"
                inputMode="numeric"
                value={form.quantity}
                onChange={handleChange}
                className="text-center"
              />

              <SelectField
                name="billing_cycle"
                label={t("fields.billingCycle")}
                options={BILLING_OPTIONS}
                value={form.billing_cycle}
                onValueChange={(v) => handleFieldChange({ name: "billing_cycle", value: v })}
                hideClear
                containerClassName="w-full"
              />

              <Input
                name="started_at"
                label={t("fields.startDate")}
                type="date"
                value={form.started_at}
                onChange={handleChange}
                error={errors.started_at}
              />
            </div>

            {/* Negotiated terms — only for contact-pricing ("Custom") plans.
                These build the private plan created for this tenant on submit. */}
            {selectedPlan && isContactPlan && (
              <div className="flex flex-col gap-3 mt-1 rounded-lg border border-[var(--accent-soft)] bg-[var(--accent-soft)]/30 p-3">
                <div className="flex items-center gap-1.5">
                  <Sparkles size={12} className="text-[var(--accent)]" />
                  <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--accent)]">
                    {t("sections.negotiatedTerms")}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Input
                    name="custom_price"
                    label={t("fields.price")}
                    type="text"
                    inputMode="decimal"
                    placeholder={t("placeholders.price")}
                    value={form.custom_price}
                    onChange={handleChange}
                  />

                  <Input
                    name="custom_duration_days"
                    label={t("fields.duration")}
                    type="text"
                    inputMode="numeric"
                    placeholder={t("placeholders.duration")}
                    value={form.custom_duration_days}
                    onChange={handleChange}
                  />

                  <Input
                    name="custom_member_limit"
                    label={t("fields.memberLimit")}
                    type="text"
                    inputMode="numeric"
                    placeholder={t("placeholders.unlimitedHint")}
                    value={form.custom_member_limit}
                    onChange={handleChange}
                  />

                  {/* Coach limit — gym plans only */}
                  {isGym && (
                    <Input
                      name="custom_coach_limit"
                      label={t("fields.coachLimit")}
                      type="text"
                      inputMode="numeric"
                      placeholder={t("placeholders.unlimitedHint")}
                      value={form.custom_coach_limit}
                      onChange={handleChange}
                    />
                  )}
                </div>

                {/* Features */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--muted)] px-0.5">
                    {t("fields.features")}
                  </label>
                  <div className="flex gap-2 items-center rounded-md border border-dashed border-[var(--hairline)] bg-white px-2.5 h-9">
                    <Plus size={14} className="text-[var(--accent)] shrink-0" />
                    <input
                      ref={featureInputRef}
                      type="text"
                      value={newFeature}
                      onChange={(e) => setNewFeature(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addFeature())}
                      placeholder={t("placeholders.feature")}
                      className="flex-1 bg-transparent text-[12px] outline-none placeholder:text-[var(--muted2)]"
                    />
                    <button
                      type="button"
                      onClick={addFeature}
                      disabled={!newFeature.trim()}
                      className="text-[11px] font-semibold text-[var(--accent)] disabled:text-[var(--muted2)] disabled:cursor-not-allowed hover:underline"
                    >
                      {t("featuresActions.add")}
                    </button>
                  </div>
                  {features.length > 0 && (
                    <div className="flex flex-col gap-1">
                      {features.map((feature, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 rounded-md border border-[var(--hairline)] bg-white px-2.5 py-1.5"
                        >
                          <GripVertical size={13} className="text-[var(--muted2)] shrink-0" />
                          <span className="flex-1 text-[12px]">{feature}</span>
                          <div className="flex items-center gap-0.5">
                            <button
                              type="button"
                              onClick={() => moveFeature(i, -1)}
                              disabled={i === 0}
                              className="p-1 rounded hover:bg-[var(--hairline2)] disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <ChevronUp size={12} />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveFeature(i, 1)}
                              disabled={i === features.length - 1}
                              className="p-1 rounded hover:bg-[var(--hairline2)] disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <ChevronDown size={12} />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeFeature(i)}
                              className="p-1 rounded hover:bg-red-50 text-[var(--muted2)] hover:text-[var(--red)] transition-colors"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <span className="text-[11px] text-[var(--muted)]">
                  {isGym
                    ? t("customNoteGym", { plan: selectedPlan.name })
                    : t("customNoteCoach", { plan: selectedPlan.name })}
                </span>
              </div>
            )}

            {/* Coverage summary pill */}
            {selectedPlan && (
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <span className="text-[11px] text-[var(--muted)]">
                  {t("coverage.label")}
                </span>
                <span className="fs-badge active text-[10px]">
                  {qty} × {selectedPlan.name}
                </span>
                <span className="text-[11px] text-[var(--muted)]">
                  {t("coverage.days", { days: coverageDays })}
                </span>
                {planTotal !== null && (
                  <>
                    <span className="text-[var(--hairline)]">·</span>
                    <span className="text-[11px] font-semibold text-[var(--text)]">
                      {planTotal.toLocaleString()} EGP
                    </span>
                    <span className="text-[11px] text-[var(--muted)]">
                      {t("coverage.listPrice")}
                    </span>
                  </>
                )}
                {unitPrice === null && (
                  <span className="text-[11px] text-[var(--amber)] italic">
                    {isContactPlan ? t("coverage.enterPriceHint") : t("coverage.customPricing")}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* ── Payment schedule ──────────────────────────────────────────── */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--muted)]">
                {t("sections.paymentSchedule")}
              </span>

              {/* Quick generate */}
              <div className="flex items-center gap-1.5">
                <Sparkles size={12} className="text-[var(--accent)]" />
                <span className="text-[11px] text-[var(--muted)]">{t("schedule.splitInto")}</span>
                <input
                  type="number"
                  min="1"
                  max="36"
                  value={splitCount}
                  onChange={(e) => setSplitCount(e.target.value)}
                  className="w-12 h-7 rounded-md border border-[var(--hairline)] bg-white text-center text-[12px] font-semibold outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)] transition-[border-color,box-shadow]"
                />
                <span className="text-[11px] text-[var(--muted)]">{t("schedule.equalPayments")}</span>
                <button
                  type="button"
                  onClick={handleGenerate}
                  className="h-7 px-2.5 rounded-md text-[11px] font-semibold text-[var(--accent)] border border-[var(--accent-soft)] bg-[var(--accent-soft)] hover:bg-blue-100 transition-colors"
                >
                  {t("schedule.generate")}
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="rounded-lg border border-[var(--hairline)] overflow-hidden">

              {/* Header */}
              <div className="grid grid-cols-[28px_130px_1fr_130px_32px] gap-2 items-center px-3 py-2 bg-[#FBFBFA] border-b border-[var(--hairline)]">
                <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">{t("schedule.colNumber")}</span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">{t("schedule.colDueDate")}</span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">{t("schedule.colLabel")}</span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)] text-end">{t("schedule.colAmount")}</span>
                <span />
              </div>

              {/* Rows */}
              <div className="divide-y divide-[var(--hairline2)] max-h-[260px] overflow-y-auto">
                {installments.map((row, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-[28px_130px_1fr_130px_32px] gap-2 items-center px-3 py-2 hover:bg-[var(--paper)] transition-colors"
                  >
                    <span className="text-[11px] text-[var(--muted2)] font-mono">{i + 1}</span>

                    <input
                      type="date"
                      value={row.due_date}
                      onChange={(e) => updateRow(i, "due_date", e.target.value)}
                      className="h-8 w-full rounded-md border border-[var(--hairline)] bg-white px-2 text-[12px] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)] transition-[border-color,box-shadow]"
                    />

                    <input
                      type="text"
                      placeholder={t("schedule.labelPlaceholder")}
                      value={row.label}
                      onChange={(e) => updateRow(i, "label", e.target.value)}
                      className="h-8 w-full rounded-md border border-[var(--hairline)] bg-white px-2.5 text-[12px] placeholder:text-[var(--muted2)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)] transition-[border-color,box-shadow]"
                    />

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={row.amount}
                      onChange={(e) => updateRow(i, "amount", e.target.value)}
                      className="h-8 w-full rounded-md border border-[var(--hairline)] bg-white px-2.5 text-[12px] text-end font-semibold placeholder:text-[var(--muted2)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)] transition-[border-color,box-shadow]"
                    />

                    <button
                      type="button"
                      onClick={() => removeRow(i)}
                      disabled={installments.length === 1}
                      className="flex items-center justify-center size-7 rounded-md text-[var(--muted2)] hover:text-[var(--red)] hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add row */}
              <div className="px-3 py-2 border-t border-[var(--hairline2)]">
                <button
                  type="button"
                  onClick={addRow}
                  className="flex items-center gap-1.5 text-[12px] font-medium text-[var(--accent)] hover:underline"
                >
                  <Plus size={13} />
                  {t("schedule.addInstallment")}
                </button>
              </div>

              {/* Totals footer */}
              <div className="grid grid-cols-[28px_130px_1fr_130px_32px] gap-2 items-center px-3 py-2.5 bg-[#FBFBFA] border-t border-[var(--hairline)]">
                <span />
                <span className="text-[11px] font-semibold text-[var(--muted)] col-span-2">
                  {installments.length} {installments.length === 1 ? t("schedule.payment") : t("schedule.payments")}
                </span>
                <span className="text-end">
                  <span className="text-[14px] font-bold fs-num">
                    {billed > 0 ? billed.toLocaleString() : "—"}
                  </span>
                </span>
                <span />
              </div>
            </div>

            {/* Balance indicator */}
            {planTotal !== null && billed > 0 && (
              <div className={`flex items-center gap-2 px-1 ${isBalanced ? "text-[var(--green)]" : "text-[var(--amber)]"}`}>
                <div className={`size-1.5 rounded-full ${isBalanced ? "bg-[var(--green)]" : "bg-[var(--amber)]"}`} />
                <span className="text-[11px] font-medium">
                  {isBalanced
                    ? t("schedule.balanced")
                    : remaining! > 0
                      ? t("schedule.unscheduled", { amount: remaining!.toLocaleString() })
                      : t("schedule.overPlan", { amount: Math.abs(remaining!).toLocaleString() })
                  }
                </span>
              </div>
            )}
          </div>

          {/* ── Notes ─────────────────────────────────────────────────────── */}
          <Textarea
            name="notes"
            label={t("sections.notes")}
            rows={2}
            placeholder={t("fields.notesPlaceholder")}
            value={form.notes}
            onChange={handleChange}
            className="resize-none"
          />

          {/* ── Actions ───────────────────────────────────────────────────── */}
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={handleClose_} isLoading={isPending}>
              {t("actions.cancel")}
            </Button>
            <Button
              variant="accent"
              type="submit"
              isLoading={isPending}
              disabled={isTenantBlocked || checkingTenant}
              onClick={handleSubmit}
            >
              {isPending ? t("actions.saving") : t("actions.submit")}
            </Button>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}
