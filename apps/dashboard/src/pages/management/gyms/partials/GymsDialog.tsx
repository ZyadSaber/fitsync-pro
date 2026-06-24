"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SelectFieldApiData, type SelectOptions } from "@/components/ui/select";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { User } from "lucide-react";
import useFormManager from "@/hooks/useFormManager";
import useVisibility from "@/hooks/useVisibility";
import { gymSchema, type GymFormData } from "@/validations/gymSchema";
import type { GymListItem } from "@/types/gyms";
import GymSubscriptionTab from "../partials/GymSubscriptionTab";
import GymBillingTab from "../partials/GymBillingTab";
import { getTranslations } from "@/i18n";
import { API } from "@/constants/apiRoutes";

interface GymsDialogProps {
  gym?: GymListItem;
}

const GymsDialog = ({ gym }: GymsDialogProps) => {
  const t = getTranslations("management.gyms.dialog");
  const tGyms = getTranslations("management.gyms");
  const isEdit = !!gym;

  const { visible: open, handleOpen, handleClose, handleStateChange } = useVisibility();
  const [isUploading, setIsUploading] = useState(false);

  const {
    formData,
    handleChange,
    handleFieldChange,
    errors,
    handleSubmit,
    loading,
    handleToggle
  } =
    useFormManager<GymFormData>({
      initialData: {
        name: gym?.name ?? "",
        address: gym?.address ?? "",
        phone: gym?.phone ?? "",
        logo_url: gym?.logo_url ?? "",
        owner_id: gym?.owner_id ?? "",
      },
      schema: gymSchema as z.ZodSchema<GymFormData>,
      onSubmit: async (data, reset) => {
        //const result = isEdit ? await updateGym(gym.id, data) : await createGym(data);
        // if (!result.success) { toast.error(result.error); return; }
        reset();
        handleClose();
      },
    });

  const infoForm = (
    <div className="flex flex-col gap-1 mt-1">
      <ImageUpload
        bucket="gym-logos"
        value={formData.logo_url}
        onChange={(url) => handleFieldChange({ name: "logo_url", value: url })}
        onUploadingChange={setIsUploading}
        uploadingLabel={t("uploading")}
        errorLabel={t("uploadError")}
      />

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
        value={formData.address}
        onChange={handleChange}
        error={errors.address}
      />
      <Input
        name="phone"
        label={t("fields.phone")}
        placeholder={t("placeholders.phone")}
        value={formData.phone}
        onChange={handleChange}
        error={errors.phone}
        type="tel"
      />

      <SelectFieldApiData
        name="owner_id"
        label={t("fields.owner")}
        icon={User}
        value={formData.owner_id}
        onValueChange={handleToggle("owner_id")}
        error={errors.owner_id}
        showSearch
        containerClassName="mt-1"
        queryApi={API.gyms.ownerOptions}
      />

      <div className="flex gap-2 justify-end mt-4">
        <Button
          variant="outline"
          isLoading={loading || isUploading}
          onClick={handleClose}
        >
          {t("cancel")}
        </Button>
        <Button
          variant="accent"
          isLoading={loading || isUploading}
          onClick={handleSubmit}
        >
          {loading ? t("saving") : isEdit ? t("saveChanges") : t("create")}
        </Button>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={handleStateChange}>
      {isEdit ? (
        <button type="button" onClick={handleOpen} className="w-full text-start">
          {tGyms("actions.edit")}
        </button>
      ) : (
        <Button variant="accent" onClick={handleOpen}>
          {tGyms("actions.addGym")}
        </Button>
      )}

      <DialogContent className={isEdit ? "sm:max-w-lg" : "sm:max-w-md"}>
        <DialogHeader>
          <DialogTitle>{isEdit ? t("titleEdit") : t("titleAdd")}</DialogTitle>
        </DialogHeader>

        {!isEdit ? infoForm : (
          <Tabs defaultValue="info" className="mt-1">
            <TabsList className="w-full">
              <TabsTrigger value="info" className="flex-1">{t("tabs.info")}</TabsTrigger>
              <TabsTrigger value="subscription" className="flex-1">{t("tabs.subscription")}</TabsTrigger>
              <TabsTrigger value="billing" className="flex-1">{t("tabs.billing")}</TabsTrigger>
            </TabsList>

            <TabsContent value="info">
              {infoForm}
            </TabsContent>
            <TabsContent value="subscription" className="mt-3">
              <GymSubscriptionTab gymId={gym.id} />
            </TabsContent>
            <TabsContent value="billing" className="mt-3">
              <GymBillingTab gymId={gym.id} />
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default GymsDialog;
