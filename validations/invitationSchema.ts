import { z } from "zod";

// Mirrors the `invitations.type` CHECK constraint in full_schema.sql.
export const INVITATION_TYPES = [
  "gym_owner",
  "online_coach",
  "gym_coach",
  "gym_member",
  "coach_client",
] as const;

// Types that link into an existing gym tenant must carry a gym_id; every other
// type (the platform-level gym_owner and the online types) must not — this
// mirrors the chk_invitation_gym_scope constraint in the database.
const GYM_SCOPED = new Set(["gym_coach", "gym_member"]);

export const invitationSchema = z
  .object({
    type: z.enum(INVITATION_TYPES),
    email: z.string().email("Invalid email"),
    gym_id: z.string().uuid("Invalid gym").nullable().optional(),
  })
  .refine((v) => (GYM_SCOPED.has(v.type) ? !!v.gym_id : !v.gym_id), {
    message: "gym_id is required for gym invitations and forbidden for online ones",
    path: ["gym_id"],
  });

export type InvitationFormData = z.infer<typeof invitationSchema>;

// Filterable invitation lifecycle states (derived, not a stored column).
export const INVITATION_STATUSES = ["pending", "used", "expired"] as const;
export type InvitationStatus = (typeof INVITATION_STATUSES)[number];
