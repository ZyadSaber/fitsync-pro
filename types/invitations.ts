import type { INVITATION_TYPES } from "@/validations/invitationSchema";

export type InvitationType = (typeof INVITATION_TYPES)[number];

// Derived lifecycle state (computed server-side from is_used + expired_at).
// There is no stored "revoked" state — revoking an invite hard-deletes the row.
export type InvitationStatus = "pending" | "used" | "expired";

// Mirrors `InvitationListItem` returned by server/src/db/repositories/invitations.ts.
export interface InvitationListItem {
  id: string;
  type: InvitationType;
  email: string;
  token: string;
  gym_id: string | null;
  gym_name: string;
  user_registered: string | null;
  registered_name: string;
  is_used: boolean;
  status: InvitationStatus;
  createdAt: string;
  expiresAt: string;
}
