import { useRef, useState } from "react";
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
import Textarea from "@/components/ui/textarea";
import { Plus, Trash2 } from "lucide-react";
import useFormManager from "@/hooks/useFormManager";
import useVisibility from "@/hooks/useVisibility";
import { coachFormSchema, type CoachFormData } from "@/validations/coachSchema";
import type { CoachListItem } from "@/types/coaches";
import CoachSubscriptionTab from "@/components/management/coaches/CoachSubscriptionTab";
import CoachBillingTab from "@/components/management/coaches/CoachBillingTab";
import { getTranslations } from "@/i18n";
import { useCoachesMutations } from "../coaches_mutations";

interface CoachEditDialogProps {
  coach: CoachListItem;
}

export default function CoachEditDialog({ coach }: CoachEditDialogProps) {
  const t = getTranslations("management.coaches.dialog");
  const tCoaches = getTranslations("management.coaches");

  const { visible: open, handleOpen, handleClose, handleStateChange } = useVisibility();
  const [newSpecialty, setNewSpecialty] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const { updateCoach } = useCoachesMutations();

  const { formData, handleChange, handleFieldChange, errors, handleSubmit, loading } =
    useFormManager<CoachFormData>({
      initialData: {
        full_name: coach.full_name,
        phone: coach.phone ?? "",
        bio: coach.bio ?? "",
        specialties: coach.specialties ?? [],
      },
      schema: coachFormSchema as z.ZodSchema<CoachFormData>,
      onSubmit: (data, reset) => {
        updateCoach.mutate(
          { id: coach.id, profileId: coach.profile_id, data },
          {
            onSuccess: () => {
              reset();
              handleClose();
            },
          }
        );
      },
    });

  const isSaving = loading || updateCoach.isPending;
  const specialties = formData.specialties as string[];

  const addSpecialty = () => {
    const v = newSpecialty.trim();
    if (!v || specialties.includes(v)) return;
    handleFieldChange({ name: "specialties", value: [...specialties, v] });
    setNewSpecialty("");
    inputRef.current?.focus();
  };

  const infoForm = (
    <div className="flex flex-col gap-1 mt-1">
      <Input
        name="full_name"
        label={t("fields.fullName")}
        placeholder={t("placeholders.fullName")}
        value={formData.full_name}
        onChange={handleChange}
        error={errors.full_name}
        required
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
      <Textarea
        name="bio"
        label={t("fields.bio")}
        placeholder={t("placeholders.bio")}
        value={formData.bio ?? ""}
        onChange={handleChange}
        rows={3}
      />

      <div className="flex flex-col gap-1.5 mt-1">
        <span className="text-sm font-medium">{t("fields.specialties")}</span>
        <div className="border-2 border-dashed border-[var(--hairline)] rounded-lg p-3 flex gap-2 items-center bg-[var(--hairline2)]/40 hover:border-[var(--accent)] transition-colors">
          <Plus size={16} className="text-[var(--accent)] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={newSpecialty}
            onChange={(e) => setNewSpecialty(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSpecialty())}
            placeholder={t("placeholders.specialty")}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--muted2)]"
          />
          <button
            type="button"
            onClick={addSpecialty}
            disabled={!newSpecialty.trim()}
            className="text-xs font-semibold text-[var(--accent)] disabled:text-[var(--muted2)] disabled:cursor-not-allowed hover:underline"
          >
            {t("actions.add")}
          </button>
        </div>
        {specialties.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {specialties.map((s, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 bg-[var(--accent-soft)] text-[var(--accent)] text-xs font-medium px-2 py-1 rounded-full"
              >
                {s}
                <button
                  type="button"
                  onClick={() =>
                    handleFieldChange({
                      name: "specialties",
                      value: specialties.filter((_, j) => j !== i),
                    })
                  }
                  className="hover:text-[var(--red)] transition-colors"
                >
                  <Trash2 size={11} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-2 justify-end mt-4">
        <Button type="button" variant="outline" onClick={handleClose} isLoading={isSaving}>
          {t("actions.cancel")}
        </Button>
        <Button variant="accent" type="submit" isLoading={isSaving} onClick={handleSubmit}>
          {isSaving ? t("actions.saving") : t("actions.saveChanges")}
        </Button>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={handleStateChange}>
      <button type="button" onClick={handleOpen} className="w-full text-start">
        {tCoaches("actions.edit")}
      </button>

      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("titleEdit")}</DialogTitle>
        </DialogHeader>

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
            <CoachSubscriptionTab coachId={coach.id} />
          </TabsContent>
          <TabsContent value="billing" className="mt-3">
            <CoachBillingTab coachId={coach.id} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
