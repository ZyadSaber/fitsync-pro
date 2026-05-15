"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useFormManager from "@/hook/useFormManager";
import { gymSchema, type GymFormData, createGym, updateGym } from "@/app/[locale]/management/gyms/actions";
import type { GymListItem } from "@/types/gyms";

interface GymsDialogProps {
  gym?: Pick<GymListItem, "id" | "name" | "address"> & {
    phone?: string | null;
    logo_url?: string | null;
  };
}

const EMPTY: GymFormData = {
  name: "",
  address: "",
  phone: "",
  logo_url: "",
};

const GymsDialog = ({ gym }: GymsDialogProps) => {
  const t = useTranslations("management.gyms.dialog");
  const tGyms = useTranslations("management.gyms");
  const isEdit = !!gym;

  const [serverError, setServerError] = useState<string | null>(null);

  const initialData: GymFormData = isEdit
    ? {
      name: gym.name,
      address: gym.address ?? "",
      phone: gym.phone ?? "",
      logo_url: gym.logo_url ?? "",
    }
    : EMPTY;

  const {
    formData,
    setFormData,
    handleChange,
    errors,
    handleSubmit,
    resetForm,
    loading,
  } = useFormManager<GymFormData>({
    initialData,
    schema: gymSchema as z.ZodSchema<GymFormData>,
    onSubmit: async (data, reset) => {
      setServerError(null);
      const result = isEdit
        ? await updateGym(gym.id, data)
        : await createGym(data);

      if (!result.success) {
        setServerError(result.error);
        return;
      }

      reset()
    },
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        {isEdit ? (
          <button>
            {tGyms("actions.edit")}
          </button>
        ) : (
          <Button variant="accent">
            {tGyms("actions.addGym")}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? t("titleEdit") : t("titleAdd")}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-1 mt-1">
          <Input
            name="name"
            label={t("fields.name")}
            placeholder={t("placeholders.name")}
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            required
          />

          <Input
            name="address"
            label={t("fields.address")}
            placeholder={t("placeholders.address")}
            value={formData.address ?? ""}
            onChange={handleChange}
            error={errors.address}
          />

          <Input
            name="phone"
            label={t("fields.phone")}
            placeholder={t("placeholders.phone")}
            value={formData.phone ?? ""}
            onChange={handleChange}
            error={errors.phone}
            type="tel"
          />

          <Input
            name="logo_url"
            label={t("fields.logoUrl")}
            placeholder={t("placeholders.logoUrl")}
            value={formData.logo_url ?? ""}
            onChange={handleChange}
            error={errors.logo_url}
            type="url"
          />

          {serverError && (
            <p className="text-red-600 text-sm px-1 mt-1">{serverError}</p>
          )}

          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              // onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              {t("cancel")}
            </Button>
            <Button variant="accent" type="submit" disabled={loading}>
              {loading
                ? t("saving")
                : isEdit
                  ? t("saveChanges")
                  : t("create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default GymsDialog;
