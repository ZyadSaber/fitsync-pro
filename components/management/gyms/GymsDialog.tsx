"use client";

import { useRef, useTransition } from "react";
import { useTranslations } from "next-intl";
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
import { Camera } from "lucide-react";
import useFormManager from "@/hook/useFormManager";
import useVisibility from "@/hook/useVisibility";
import { gymSchema, type GymFormData } from "@/validations/gymSchema";
import { createGym, updateGym } from "@/services/management/gyms";
import type { GymListItem } from "@/types/gyms";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import GymSubscriptionTab from "@/components/management/gyms/GymSubscriptionTab";
import GymBillingTab from "@/components/management/gyms/GymBillingTab";

interface GymsDialogProps {
  gym?: GymListItem;
}

const GymsDialog = ({ gym }: GymsDialogProps) => {
  const t = useTranslations("management.gyms.dialog");
  const tGyms = useTranslations("management.gyms");
  const isEdit = !!gym;

  const { visible: open, handleOpen, handleClose, handleStateChange } = useVisibility();
  const [isUploading, startUpload] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { formData, handleChange, handleFieldChange, errors, handleSubmit, loading } =
    useFormManager<GymFormData>({
      initialData: {
        name: gym?.name ?? "",
        address: gym?.address ?? "",
        phone: gym?.phone ?? "",
        logo_url: gym?.logo_url ?? "",
      },
      schema: gymSchema as z.ZodSchema<GymFormData>,
      onSubmit: async (data, reset) => {
        const result = isEdit ? await updateGym(gym.id, data) : await createGym(data);
        if (!result.success) { toast.error(result.error); return; }
        reset();
        handleClose();
      },
    });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    startUpload(async () => {
      const supabase = createClient();
      const path = `${crypto.randomUUID()}.${file.name.split(".").pop()}`;
      const { error } = await supabase.storage.from("gym-logos").upload(path, file, { upsert: true });
      if (error) { toast.error(t("uploadError")); return; }
      const { data: { publicUrl } } = supabase.storage.from("gym-logos").getPublicUrl(path);
      handleFieldChange({ name: "logo_url", value: publicUrl });
    });
  };

  const infoForm = (
    <div className="flex flex-col gap-1 mt-1">
      <div className="flex flex-col items-center gap-2 mb-3">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="relative w-20 h-20 rounded-xl border-2 border-dashed border-[var(--hairline)] hover:border-[var(--accent)] transition-colors overflow-hidden flex items-center justify-center bg-[var(--accent-soft)]"
        >
          {formData.logo_url
            ? <img src={formData.logo_url} alt="logo" className="w-full h-full object-cover" />
            : <Camera className="w-6 h-6 text-[var(--muted)]" />}
          {isUploading && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="text-white text-xs font-medium">{t("uploading")}</span>
            </div>
          )}
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
      </div>

      <Input name="name" label={t("fields.name")} placeholder={t("placeholders.name")} value={formData.name} onChange={handleChange} error={errors.name} required />
      <Input name="address" label={t("fields.address")} placeholder={t("placeholders.address")} value={formData.address ?? ""} onChange={handleChange} error={errors.address} />
      <Input name="phone" label={t("fields.phone")} placeholder={t("placeholders.phone")} value={formData.phone ?? ""} onChange={handleChange} error={errors.phone} type="tel" />

      <div className="flex gap-2 justify-end mt-4">
        <Button type="button" variant="outline" isLoading={loading || isUploading} onClick={handleClose}>
          {t("cancel")}
        </Button>
        <Button variant="accent" type="submit" isLoading={loading || isUploading} onClick={handleSubmit}>
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
