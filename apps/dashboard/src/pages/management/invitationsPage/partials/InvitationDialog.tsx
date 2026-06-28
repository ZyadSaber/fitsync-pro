import { useState } from "react";
import { z } from "zod";
import { Plus, Send, Copy, Check } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SelectFieldApiData } from "@/components/ui/select";
import useFormManager from "@/hooks/useFormManager";
import useVisibility from "@/hooks/useVisibility";
import { getTranslations } from "@/i18n";
import { API } from "@/constants/apiRoutes";
import { invitationSchema, type InvitationFormData } from "@/validations/invitationSchema";
import type { InvitationListItem, InvitationType } from "@/types/invitations";
import { useInvitationsMutations } from "../invitations_mutations";
import { INVITATION_TYPE_META, INVITATION_TYPES } from "../meta";

const inviteUrl = (token: string) => `https://app.fitsync.pro/invite/${token}`;

export default function InvitationDialog() {
  const t = getTranslations("management.invitations");
  const td = getTranslations("management.invitations.dialog");
  const { visible: open, handleOpen, handleClose, handleStateChange } = useVisibility();
  const { createInvitation } = useInvitationsMutations();
  const [created, setCreated] = useState<InvitationListItem | null>(null);
  const [copied, setCopied] = useState(false);

  const { formData, handleChange, handleFieldChange, errors, handleSubmit, loading, resetForm } =
    useFormManager<InvitationFormData>({
      initialData: { type: "gym_owner", email: "", gym_id: null },
      schema: invitationSchema as unknown as z.ZodSchema<InvitationFormData>,
      onSubmit: (data) => {
        createInvitation.mutate(data, { onSuccess: (inv) => setCreated(inv) });
      },
    });

  const meta = INVITATION_TYPE_META[formData.type as InvitationType];

  const selectType = (type: InvitationType) => {
    // Switching to a non-gym-scoped type must clear gym_id so the schema refine passes.
    handleFieldChange({ name: "type", value: type });
    if (!INVITATION_TYPE_META[type].gymScoped) handleFieldChange({ name: "gym_id", value: null });
  };

  const close = () => {
    handleClose();
    // Reset after the closing animation so the form doesn't flash empty.
    setTimeout(() => {
      resetForm();
      setCreated(null);
      setCopied(false);
    }, 200);
  };

  const copyLink = () => {
    if (!created) return;
    navigator.clipboard?.writeText(inviteUrl(created.token));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const isSaving = loading || createInvitation.isPending;

  return (
    <Dialog open={open} onOpenChange={(s) => (s ? handleStateChange(s) : close())}>
      <Button variant="accent" icon={Plus} onClick={handleOpen}>
        {t("actions.send")}
      </Button>

      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{created ? td("titleSent") : td("titleAdd")}</DialogTitle>
        </DialogHeader>

        {created ? (
          // ── Success: show the generated invite URL ──────────────────────────
          <div className="flex flex-col gap-4 mt-2">
            <div className="rounded-lg bg-ink p-4">
              <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#9AA1AE] mb-2.5">
                {td("generatedUrl")}
              </div>
              <div className="font-mono text-[11px] leading-relaxed text-[#C7D0E8] break-all">
                {inviteUrl(created.token)}
              </div>
              <button
                type="button"
                onClick={copyLink}
                className="mt-3.5 flex w-full items-center justify-center gap-1.5 rounded-[5px] border border-white/10 bg-white/5 py-1.5 text-[11px] font-semibold text-[#C7CDD9] hover:bg-white/10"
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}
                {copied ? td("copied") : td("actions.copyLink")}
              </button>
            </div>
            <p className="text-[11px] text-[var(--muted)]">
              {td("sentTo", { email: created.email })} · {td("expires", { date: created.expiresAt })}
            </p>
            <div className="flex justify-end">
              <Button variant="accent" onClick={close}>
                {td("actions.done")}
              </Button>
            </div>
          </div>
        ) : (
          // ── Form ────────────────────────────────────────────────────────────
          <form onSubmit={handleSubmit} className="flex flex-col gap-5 mt-2">
            {/* Type selector */}
            <div>
              <div className="fs-eyebrow mb-2.5">{td("fields.type")}</div>
              <div className="flex flex-col gap-1.5">
                {INVITATION_TYPES.map((k) => {
                  const cfg = INVITATION_TYPE_META[k];
                  const selected = formData.type === k;
                  return (
                    <button
                      type="button"
                      key={k}
                      onClick={() => selectType(k)}
                      className="flex items-center gap-3 rounded-lg border px-3.5 py-2.5 text-start transition-colors"
                      style={{
                        borderColor: selected ? cfg.color : "var(--hairline)",
                        borderWidth: 1.5,
                        background: selected ? cfg.bg : "#fff",
                      }}
                    >
                      <span
                        className="flex size-4 shrink-0 items-center justify-center rounded-full"
                        style={{ border: `2px solid ${selected ? cfg.color : "var(--hairline2)"}` }}
                      >
                        {selected && (
                          <span
                            className="size-1.5 rounded-full"
                            style={{ background: cfg.color }}
                          />
                        )}
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="block text-[13px] font-semibold">
                          {t(`types.${k}.label`)}
                        </span>
                        <span className="block text-[11px] text-[var(--muted)] mt-0.5">
                          {t(`types.${k}.desc`)}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
              {errors.type && <p className="mt-1 text-[11px] text-[var(--red-app)]">{errors.type}</p>}
            </div>

            {/* Email */}
            <Input
              name="email"
              type="email"
              label={td("fields.email")}
              placeholder={td("placeholders.email")}
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              required
            />

            {/* Conditional gym selector */}
            {meta?.gymScoped && (
              <SelectFieldApiData
                name="gym_id"
                label={td("fields.gym")}
                queryApi={API.gyms.gymOptions}
                value={formData.gym_id ?? ""}
                onValueChange={(value) => handleFieldChange({ name: "gym_id", value: value || null })}
                placeholder={td("placeholders.gym")}
                showSearch
                error={errors.gym_id}
                containerClassName="px-1"
              />
            )}

            <div className="flex justify-end gap-2 border-t border-[var(--hairline)] pt-4">
              <Button type="button" variant="ghost" onClick={close}>
                {td("actions.cancel")}
              </Button>
              <Button type="submit" variant="accent" icon={Send} isLoading={isSaving}>
                {isSaving ? td("actions.sending") : t("actions.send")}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
