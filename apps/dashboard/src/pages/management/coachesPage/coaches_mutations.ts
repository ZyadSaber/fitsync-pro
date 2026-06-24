import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, ApiError } from "@dashboard/lib/api";
import { API } from "@/constants/apiRoutes";
import { getTranslations } from "@/i18n";
import type { CoachFormData } from "@/validations/coachSchema";
import type { ActionResult } from "@/types/common";

/** Query key shared with the coaches list so every write refreshes the table. */
export const COACHES_QUERY_KEY = ["coaches"] as const;

/**
 * React Query wrappers for the coach write endpoints (promote/update/delete on
 * /api/coaches). Promote/update surface their own toasts; delete returns an
 * `ActionResult` so it plugs straight into `DeleteDialog`, which owns the
 * delete toast/UX.
 */
export function useCoachesMutations() {
  const queryClient = useQueryClient();
  const t = getTranslations("management.coaches.dialog");
  const invalidate = () => queryClient.invalidateQueries({ queryKey: COACHES_QUERY_KEY });
  const message = (err: unknown, fallback: string) =>
    err instanceof ApiError ? err.message : fallback;

  const promoteCoach = useMutation({
    mutationFn: (profileId: string) => api.post(API.coaches.promote(profileId)),
    onSuccess: () => {
      invalidate();
      toast.success(t("toast.promoted"));
    },
    onError: (err) => toast.error(message(err, "Failed to promote user")),
  });

  const updateCoach = useMutation({
    mutationFn: ({ id, profileId, data }: { id: string; profileId: string; data: CoachFormData }) =>
      api.put(API.coaches.byId(id), { profile_id: profileId, ...data }),
    onSuccess: () => {
      invalidate();
      toast.success(t("toast.updated"));
    },
    onError: (err) => toast.error(message(err, "Failed to update coach")),
  });

  const deleteCoach = async (id: string): Promise<ActionResult> => {
    try {
      await api.del(API.coaches.byId(id));
      invalidate();
      return { success: true, id };
    } catch (err) {
      return { success: false, error: message(err, "Failed to delete coach") };
    }
  };

  return { promoteCoach, updateCoach, deleteCoach };
}
