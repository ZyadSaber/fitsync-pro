/**
 * Client-side data-access for Management → Coaches.
 *
 * Post-migration these are thin wrappers over the Express REST API (see
 * server/src/routes/coaches.ts) rather than Supabase/Server Actions. The
 * mutating helpers keep the legacy `ActionResult` shape so the existing dialog
 * components keep working unchanged, and they invalidate the relevant React
 * Query caches (the SPA replacement for Next.js `revalidatePath`).
 */
import { api, ApiError } from "@/apps/dashboard/src/lib/api";
import { queryClient } from "@/apps/dashboard/src/lib/queryClient";
import type { ActionResult } from "@/types/common";
import type { CoachFormData, CreateCoachFormData } from "@/validations/coachSchema";

const errorOf = (err: unknown): string =>
  err instanceof ApiError ? err.message : err instanceof Error ? err.message : "Request failed";

const invalidateCoaches = () => queryClient.invalidateQueries({ queryKey: ["coaches"] });

export async function promoteToCoach(profileId: string): Promise<ActionResult> {
  try {
    const { id } = await api.post<{ id: string }>(`/coaches/${profileId}/promote`);
    await invalidateCoaches();
    return { success: true, id };
  } catch (err) {
    return { success: false, error: errorOf(err) };
  }
}

export async function createCoach(data: CreateCoachFormData): Promise<ActionResult> {
  try {
    const { id } = await api.post<{ id: string }>("/coaches", data);
    await invalidateCoaches();
    return { success: true, id };
  } catch (err) {
    return { success: false, error: errorOf(err) };
  }
}

export async function updateCoach(
  coachId: string,
  profileId: string,
  data: CoachFormData
): Promise<ActionResult> {
  try {
    const { id } = await api.put<{ id: string }>(`/coaches/${coachId}`, {
      profile_id: profileId,
      ...data,
    });
    await invalidateCoaches();
    return { success: true, id };
  } catch (err) {
    return { success: false, error: errorOf(err) };
  }
}

export async function deleteCoach(coachId: string): Promise<ActionResult> {
  try {
    const { id } = await api.del<{ id: string }>(`/coaches/${coachId}`);
    await invalidateCoaches();
    return { success: true, id };
  } catch (err) {
    return { success: false, error: errorOf(err) };
  }
}
