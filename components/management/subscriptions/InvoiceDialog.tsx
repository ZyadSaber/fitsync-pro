"use client";

import { useEffect, useState, useTransition } from "react";
import { z } from "zod";
import { format } from "date-fns";
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
import useFormManager from "@/hooks/useFormManager";
import useVisibility from "@/hooks/useVisibility";
import { invoiceFormSchema, type InvoiceFormData } from "@/validations/subscriptionSchema";
import {
  createCustomBillingRecord,
  updateBillingRecord,
  getActiveSubscriptionIdForGym,
} from "@/services/management/subscriptions";
import type { BillingRecordListItem } from "@/types/subscriptions";
import type { SelectOptions } from "@/types/ui";
import { toast } from "sonner";

const BILLING_OPTIONS: SelectOptions[] = [
  { key: "monthly", label: "Monthly" },
  { key: "yearly", label: "Yearly" },
];

const STATUS_OPTIONS: SelectOptions[] = [
  { key: "paid", label: "Paid" },
  { key: "pending", label: "Open / Pending" },
  { key: "failed", label: "Past due / Failed" },
  { key: "refunded", label: "Refunded" },
];

const toDateInput = (iso: string | null) =>
  iso ? format(new Date(iso), "yyyy-MM-dd") : "";

const EMPTY: InvoiceFormData = {
  gym_id: "",
  subscription_id: "",
  amount_egp: "",
  billing_cycle: "monthly",
  period_start: "",
  period_end: "",
  next_billing_at: "",
  status: "pending",
  paid_at: "",
  notes: "",
};

interface Props {
  gyms: SelectOptions[];
  record?: BillingRecordListItem;
}

export default function InvoiceDialog({ gyms, record }: Props) {
  const isEdit = !!record;
  const { visible: open, handleOpen, handleClose, handleStateChange } = useVisibility();
  const [subLoading, startSubFetch] = useTransition();
  const [subError, setSubError] = useState<string | null>(null);

  const initialData: InvoiceFormData = record
    ? {
      gym_id: record.gym_id ?? "",
      subscription_id: record.subscription_id,
      amount_egp: String(record.amount_egp),
      billing_cycle: record.billing_cycle,
      period_start: toDateInput(record.period_start),
      period_end: toDateInput(record.period_end),
      next_billing_at: toDateInput(record.next_billing_at),
      status: record.status,
      paid_at: toDateInput(record.paid_at),
      notes: record.notes ?? "",
    }
    : EMPTY;

  const { formData, handleChange, handleFieldChange, handleToggle, errors, handleSubmit, loading } =
    useFormManager<InvoiceFormData>({
      initialData,
      schema: invoiceFormSchema as z.ZodSchema<InvoiceFormData>,
      onSubmit: async (data, reset) => {
        const result = isEdit
          ? await updateBillingRecord(record.id, data)
          : await createCustomBillingRecord(data);
        if (!result.success) { toast.error(result.error); return; }
        toast.success(isEdit ? "Invoice updated" : "Invoice created");
        reset();
        handleClose();
      },
    });

  // Auto-fetch subscription_id when gym changes (create mode only)
  useEffect(() => {
    if (isEdit || !formData.gym_id) return;

    setSubError(null);
    handleFieldChange({ name: "subscription_id", value: "" });

    startSubFetch(async () => {
      try {
        const id = await getActiveSubscriptionIdForGym(formData.gym_id);
        if (id) {
          handleFieldChange({ name: "subscription_id", value: id });
          setSubError(null);
        } else {
          setSubError("No active subscription found for this gym. Create one first.");
        }
      } catch {
        setSubError("Could not look up the subscription for this gym.");
      }
    });
  }, [formData.gym_id, isEdit]);

  const showPaidAt = formData.status === "paid";

  return (
    <Dialog open={open} onOpenChange={handleStateChange}>
      {isEdit ? (
        <button type="button" onClick={handleOpen} className="w-full text-start">
          Edit invoice
        </button>
      ) : (
        <Button variant="outline" onClick={handleOpen}>
          <Icon name="plus" size={13} />
          New invoice
        </Button>
      )}

      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit invoice" : "New invoice"}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-1 mt-1">

          {/* Gym selector (locked in edit mode) */}
          <SelectField
            name="gym_id"
            label="Gym / Tenant"
            options={gyms}
            value={formData.gym_id}
            onValueChange={handleToggle("gym_id")}
            disabled={isEdit}
            hideClear={isEdit}
            error={errors.gym_id}
            showSearch
            searchPlaceholder="Search gyms…"
            containerClassName="w-full"
          />

          {/* Subscription status indicator */}
          {!isEdit && formData.gym_id && (
            <div className="px-1">
              {subLoading ? (
                <p className="text-[11px] text-[var(--muted)]">Looking up subscription…</p>
              ) : subError ? (
                <p className="text-[11px] text-red-600">{subError}</p>
              ) : formData.subscription_id ? (
                <p className="text-[11px] text-green-600">Active subscription found ✓</p>
              ) : null}
            </div>
          )}

          <Input
            name="amount_egp"
            label="Amount (EGP)"
            placeholder="4500"
            value={formData.amount_egp}
            onChange={handleChange}
            error={errors.amount_egp}
            type="text"
            inputMode="numeric"
          />

          <div className="flex gap-2">
            <Input
              name="period_start"
              label="Period start"
              value={formData.period_start}
              onChange={handleChange}
              error={errors.period_start}
              type="date"
              containerClassName="flex-1"
            />
            <Input
              name="period_end"
              label="Period end"
              value={formData.period_end}
              onChange={handleChange}
              error={errors.period_end}
              type="date"
              containerClassName="flex-1"
            />
          </div>

          <SelectField
            name="status"
            label="Status"
            options={STATUS_OPTIONS}
            value={formData.status}
            onValueChange={handleToggle("status")}
            hideClear
            containerClassName="w-full"
          />

          {showPaidAt && (
            <Input
              name="paid_at"
              label="Paid at"
              value={formData.paid_at ?? ""}
              onChange={handleChange}
              type="date"
            />
          )}

          <Textarea
            name="notes"
            label="Notes (optional)"
            placeholder="e.g. Annual prepayment discount applied"
            value={formData.notes ?? ""}
            onChange={handleChange}
            rows={2}
          />

          <div className="flex gap-2 justify-end mt-2">
            <Button type="button" variant="outline" onClick={handleClose} isLoading={loading}>
              Cancel
            </Button>
            <Button
              variant="accent"
              type="submit"
              isLoading={loading || subLoading}
              disabled={!isEdit && (!formData.subscription_id || !!subError)}
              onClick={handleSubmit}
            >
              {loading ? "Saving…" : isEdit ? "Save changes" : "Create invoice"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
