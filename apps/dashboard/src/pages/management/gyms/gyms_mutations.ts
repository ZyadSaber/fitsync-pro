import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, ApiError } from "@dashboard/lib/api";
import { API } from "@/constants/apiRoutes";
import { getTranslations } from "@/i18n";
import type { GymFormData } from "@/validations/gymSchema";
import type { ActionResult } from "@/types/common";

/** Query key shared with the gyms list so every write refreshes the table. */
export const GYMS_QUERY_KEY = ["gyms"] as const;

/**
 * React Query wrappers for the gym write endpoints (POST/PUT/DELETE /api/gyms).
 * Create/update surface their own toasts; delete returns an `ActionResult` so it
 * plugs straight into `DeleteDialog`, which owns the delete toast/UX.
 */
export function useGymsMutations() {
  const queryClient = useQueryClient();
  const t = getTranslations("management.gyms.dialog");
  const invalidate = () => queryClient.invalidateQueries({ queryKey: GYMS_QUERY_KEY });
  const message = (err: unknown, fallback: string) =>
    err instanceof ApiError ? err.message : fallback;

  const createGym = useMutation({
    mutationFn: (data: GymFormData) => api.post(API.gyms.create, data),
    onSuccess: () => {
      invalidate();
      toast.success(t("createSuccess"));
    },
    onError: (err) => toast.error(message(err, t("createError"))),
  });

  const updateGym = useMutation({
    mutationFn: ({ id, data }: { id: string; data: GymFormData }) =>
      api.put(API.gyms.byId(id), data),
    onSuccess: () => {
      invalidate();
      toast.success(t("updateSuccess"));
    },
    onError: (err) => toast.error(message(err, t("updateError"))),
  });

  const deleteGym = async (id: string): Promise<ActionResult> => {
    try {
      await api.del(API.gyms.byId(id));
      invalidate();
      return { success: true, id };
    } catch (err) {
      return { success: false, error: message(err, t("deleteError")) };
    }
  };

  return { createGym, updateGym, deleteGym };
}
