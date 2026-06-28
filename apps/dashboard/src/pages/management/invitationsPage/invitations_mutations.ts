import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, ApiError } from "@dashboard/lib/api";
import { API } from "@/constants/apiRoutes";
import { getTranslations } from "@/i18n";
import type { InvitationFormData } from "@/validations/invitationSchema";
import type { InvitationListItem } from "@/types/invitations";
import type { ActionResult } from "@/types/common";

/** Query key shared with the invitations list so every write refreshes the table. */
export const INVITATIONS_QUERY_KEY = ["invitations"] as const;

/**
 * React Query wrappers for the invitation write endpoints (create/resend/revoke
 * on /api/invitations). Create/resend surface their own toasts; revoke returns
 * an `ActionResult` so it plugs straight into `DeleteDialog`, which owns the
 * delete toast/UX. Revoke is a hard DELETE — there is no persistent revoked state.
 */
export function useInvitationsMutations() {
  const queryClient = useQueryClient();
  const t = getTranslations("management.invitations.dialog");
  const invalidate = () => queryClient.invalidateQueries({ queryKey: INVITATIONS_QUERY_KEY });
  const message = (err: unknown, fallback: string) =>
    err instanceof ApiError ? err.message : fallback;

  const createInvitation = useMutation({
    mutationFn: (data: InvitationFormData) =>
      api.post<InvitationListItem>(API.invitations.create, data),
    onSuccess: () => {
      invalidate();
      toast.success(t("toast.created"));
    },
    onError: (err) => toast.error(message(err, "Failed to send invitation")),
  });

  const resendInvitation = useMutation({
    mutationFn: (id: string) => api.post<InvitationListItem>(API.invitations.resend(id)),
    onSuccess: () => {
      invalidate();
      toast.success(t("toast.resent"));
    },
    onError: (err) => toast.error(message(err, "Failed to resend invitation")),
  });

  const revokeInvitation = async (id: string): Promise<ActionResult> => {
    try {
      await api.del(API.invitations.byId(id));
      invalidate();
      return { success: true, id };
    } catch (err) {
      return { success: false, error: message(err, "Failed to revoke invitation") };
    }
  };

  return { createInvitation, resendInvitation, revokeInvitation };
}
