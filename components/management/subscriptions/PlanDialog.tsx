"use client";

import { z } from "zod";
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

  const BILLING_OPTIONS = [
    { key: "monthly", label: t("billing.monthly") },
    { key: "yearly", label: t("billing.yearly") },
  ];

  const TYPE_OPTIONS = [
    { key: "gym", label: t("types.gym") },
    { key: "online_coach", label: t("types.online_coach") },
    { key: "both", label: t("types.both") },
  ];

  const { formData, handleChange, handleFieldChange, handleToggle, errors, handleSubmit, loading } =
    useFormManager<PlanFormData>({
      initialData: {
        name: "",
        slug: "",
        description: "",
        price_egp: "",
        billing_cycle: "monthly",
        duration_days: "30",
        member_limit: "",
        type: "gym",
        features: "",
        is_active: true,
        ...(plan as unknown as Partial<PlanFormData>),
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
          <div className="flex gap-2">
            <Input
              name="name"
              label={t("fields.name")}
              placeholder={t("fields.namePlaceholder")}
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              required
              containerClassName="flex-1"
            />
            <Input
              name="slug"
              label={t("fields.slug")}
              placeholder={t("fields.slugPlaceholder")}
              value={formData.slug}
              onChange={handleChange}
              error={errors.slug}
              required
              containerClassName="flex-1"
            />
          </div>

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
          </div>

          <Textarea
            name="features"
            label={t("fields.features")}
            placeholder={t("fields.featuresPlaceholder")}
            value={formData.features}
            onChange={handleChange}
            rows={4}
          />

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
