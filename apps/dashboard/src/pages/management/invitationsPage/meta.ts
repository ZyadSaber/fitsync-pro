import type { InvitationStatus, InvitationType } from "@/types/invitations";
import { INVITATION_TYPES } from "@/validations/invitationSchema";

export { INVITATION_TYPES };

// Presentational metadata for each invite type. `gymScoped` types link into an
// existing gym tenant and therefore require a gym_id (mirrors the Zod refine +
// the DB chk_invitation_gym_scope constraint). Colours follow the design canvas.
export interface InvitationTypeMeta {
  color: string;
  bg: string;
  gymScoped: boolean;
}

export const INVITATION_TYPE_META: Record<InvitationType, InvitationTypeMeta> = {
  gym_owner: { color: "var(--accent)", bg: "var(--accent-soft)", gymScoped: false },
  online_coach: { color: "#6D28D9", bg: "#F4EFFF", gymScoped: false },
  gym_coach: { color: "#475569", bg: "#F1F5F9", gymScoped: true },
  gym_member: { color: "var(--green)", bg: "var(--green-soft)", gymScoped: true },
  coach_client: { color: "var(--amber)", bg: "var(--amber-soft)", gymScoped: false },
};

// Maps the derived invitation status onto an `fs-badge` variant class.
export const STATUS_BADGE: Record<InvitationStatus, string> = {
  pending: "pending",
  used: "active",
  expired: "expired",
};
