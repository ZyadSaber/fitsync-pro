"use client";

import { z } from "zod";
import { useState, useRef } from "react";
import { useTranslations } from "next-intl";
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
import { Switch } from "@/components/ui/switch";
import Icon from "@/components/ui/Icon";
import { Plus, Trash2, ChevronUp, ChevronDown, GripVertical } from "lucide-react";
import useFormManager from "@/hook/useFormManager";
import useVisibility from "@/hook/useVisibility";
import { planFormSchema, type PlanFormData } from "@/validations/subscriptionSchema";
import { createSubscriptionPlan, updateSubscriptionPlan } from "@/services/management/subscriptions";
import type { SubscriptionPlanStats } from "@/types/subscriptions";
import { toast } from "sonner";

interface Props {
  plan?: SubscriptionPlanStats;
}

export default function PlanDialog({ plan }: Props) {
  const t = useTranslations("management.subscriptions.dialog");
  const isEdit = !!plan;
  const { visible: open, handleOpen, handleClose, handleStateChange } = useVisibility();
  const [newFeature, setNewFeature] = useState("");
  const addInputRef = useRef<HTMLInputElement>(null);

  const BILLING_OPTIONS = [
    { key: "monthly", label: t("billing.monthly") },
    { key: "yearly", label: t("billing.yearly") },
  ];

  const TYPE_OPTIONS = [
    { key: "gym", label: t("types.gym") },
    { key: "online_coach", label: t("types.online_coach") },
  ];

  const { formData, handleChange, handleFieldChange, handleToggle, errors, handleSubmit, loading } =
    useFormManager<PlanFormData>({
      initialData: {
        name: plan?.name ?? "",
        description: plan?.description ?? "",
        price_egp: String(plan?.price_egp || ""),
        billing_cycle: plan?.billing_cycle ?? "monthly",
        duration_days: String(plan?.duration_days || "30"),
        member_limit: String(plan?.member_limit || ""),
        coach_limit: String(plan?.coach_limit || ""),
        type: plan?.type ?? "gym",
        features: plan?.features ?? [],
        is_active: plan?.is_active ?? true,
      },
      schema: planFormSchema as z.ZodSchema<PlanFormData>,
      onSubmit: async (data, reset) => {
        const result = isEdit
          ? await updateSubscriptionPlan(plan.id, data)
          : await createSubscriptionPlan(data);
        if (!result.success) { toast.error(result.error); return; }
        toast.success(isEdit ? t("toast.updated") : t("toast.created"));
        reset();
        handleClose();
      },
    });

  const isContactPricing = formData.price_egp === "";
  const isUnlimited = formData.member_limit === "";
  const isGym = formData.type === "gym";

  const features = (formData.features as string[]) ?? [];

  const setFeatures = (next: string[]) =>
    handleFieldChange({ name: "features", value: next });

  const addFeature = () => {
    const trimmed = newFeature.trim();
    if (!trimmed) return;
    setFeatures([...features, trimmed]);
    setNewFeature("");
    addInputRef.current?.focus();
  };

  const removeFeature = (index: number) =>
    setFeatures(features.filter((_, i) => i !== index));

  const moveFeature = (index: number, direction: -1 | 1) => {
    const next = [...features];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setFeatures(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleStateChange}>
      {isEdit ? (
        <button type="button" onClick={handleOpen} className="w-full text-start">
          {t("editBtn")}
        </button>
      ) : (
        <Button variant="accent" onClick={handleOpen}>
          <Icon name="plus" size={13} color="#fff" />
          {t("titleNew")}
        </Button>
      )}

      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? t("titleEdit") : t("titleNew")}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-1 mt-1">
          <Input
            name="name"
            label={t("fields.name")}
            placeholder={t("fields.namePlaceholder")}
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            required
          />

          <Textarea
            name="description"
            label={t("fields.description")}
            placeholder={t("fields.descriptionPlaceholder")}
            value={formData.description ?? ""}
            onChange={handleChange}
            rows={2}
          />

          <div className="flex gap-2">
            <SelectField
              name="type"
              label={t("fields.type")}
              options={TYPE_OPTIONS}
              value={formData.type}
              onValueChange={handleToggle("type")}
              hideClear
              containerClassName="flex-1"
            />
            <SelectField
              name="billing_cycle"
              label={t("fields.billingCycle")}
              options={BILLING_OPTIONS}
              value={formData.billing_cycle}
              onValueChange={handleToggle("billing_cycle")}
              hideClear
              containerClassName="flex-1"
            />
          </div>

          <div className="border border-[var(--hairline)] rounded-lg p-3 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--muted)]">
                {t("sections.pricing")}
              </span>
              <Switch
                size="sm"
                checked={isContactPricing}
                onCheckedChange={(checked) =>
                  handleFieldChange({ name: "price_egp", value: checked ? "" : "0" })
                }
                label={t("toggles.contactPricing")}
              />
            </div>
            {!isContactPricing && (
              <Input
                name="price_egp"
                label={t("fields.priceLabel")}
                placeholder={t("fields.pricePlaceholder")}
                value={formData.price_egp}
                onChange={handleChange}
                error={errors.price_egp}
                type="text"
                inputMode="numeric"
              />
            )}
          </div>

          <div className="border border-[var(--hairline)] rounded-lg p-3 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--muted)]">
                {t("sections.limits")}
              </span>
              <Switch
                size="sm"
                checked={isUnlimited}
                onCheckedChange={(checked) =>
                  handleFieldChange({ name: "member_limit", value: checked ? "" : "100" })
                }
                label={t("toggles.unlimitedMembers")}
              />
            </div>
            <div className="flex gap-2">
              {!isUnlimited && (
                <Input
                  name="member_limit"
                  label={t("fields.memberLimit")}
                  placeholder={t("fields.memberLimitPlaceholder")}
                  value={formData.member_limit}
                  onChange={handleChange}
                  type="text"
                  inputMode="numeric"
                  containerClassName="flex-1"
                />
              )}
              <Input
                name="duration_days"
                label={t("fields.duration")}
                placeholder={t("fields.durationPlaceholder")}
                value={formData.duration_days}
                onChange={handleChange}
                error={errors.duration_days}
                type="text"
                inputMode="numeric"
                containerClassName={isUnlimited ? "w-full" : "flex-1"}
              />
            </div>
            {isGym && (
              <Input
                name="coach_limit"
                label={t("fields.coachLimit")}
                placeholder={t("fields.coachLimitPlaceholder")}
                value={formData.coach_limit}
                onChange={handleChange}
                type="text"
                inputMode="numeric"
              />
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">{t("fields.features")}</span>

            {/* Add feature card */}
            <div className="border-2 border-dashed border-[var(--hairline)] rounded-lg p-3 flex gap-2 items-center bg-[var(--hairline2)]/40 hover:border-[var(--accent)] transition-colors">
              <Plus size={16} className="text-[var(--accent)] shrink-0" />
              <input
                ref={addInputRef}
                type="text"
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addFeature())}
                placeholder={t("fields.featuresPlaceholder")}
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--muted2)]"
              />
              <button
                type="button"
                onClick={addFeature}
                disabled={!newFeature.trim()}
                className="text-xs font-semibold text-[var(--accent)] disabled:text-[var(--muted2)] disabled:cursor-not-allowed hover:underline"
              >
                {t("actions.add")}
              </button>
            </div>

            {/* Feature cards */}
            {features.length > 0 && (
              <div className="flex flex-col gap-1.5">
                {features.map((feature, i) => (
                  <div
                    key={i}
                    className="border border-[var(--hairline)] rounded-lg px-3 py-2 flex items-center gap-2 bg-[var(--surface)]"
                  >
                    <GripVertical size={14} className="text-[var(--muted2)] shrink-0" />
                    <span className="flex-1 text-sm">{feature}</span>
                    <div className="flex items-center gap-0.5">
                      <button
                        type="button"
                        onClick={() => moveFeature(i, -1)}
                        disabled={i === 0}
                        className="p-1 rounded hover:bg-[var(--hairline2)] disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <ChevronUp size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveFeature(i, 1)}
                        disabled={i === features.length - 1}
                        className="p-1 rounded hover:bg-[var(--hairline2)] disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <ChevronDown size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeFeature(i)}
                        className="p-1 rounded hover:bg-red-50 text-[var(--muted2)] hover:text-[var(--red)] transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Switch
            checked={formData.is_active}
            onCheckedChange={handleToggle("is_active")}
            label={t("toggles.activeLabel")}
            containerClassName="mt-3"
          />

          <div className="flex gap-2 justify-end mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              isLoading={loading}
            >
              {t("actions.cancel")}
            </Button>
            <Button
              variant="accent"
              type="submit"
              isLoading={loading}
              onClick={handleSubmit}
            >
              {loading ?
                t("actions.saving") :
                isEdit ?
                  t("actions.saveChanges") :
                  t("actions.createPlan")
              }
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
