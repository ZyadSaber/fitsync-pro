import { randomBytes } from "node:crypto";
import { query, queryOne } from "../pool.js";
import type { InvitationFormData } from "@/validations/invitationSchema";
import { format } from "date-fns";

export interface InvitationListItem {
  id: string;
  type: string;
  email: string;
  token: string;
  gym_id: string | null;
  gym_name: string;
  user_registered: string | null;
  registered_name: string;
  is_used: boolean;
  status: "pending" | "used" | "expired";
  createdAt: string;
  expiresAt: string;
}

interface InvitationRow {
  id: string;
  type: string;
  email: string;
  token: string;
  gym_id: string | null;
  gym_name: string | null;
  user_registered: string | null;
  registered_name: string | null;
  is_used: boolean;
  created_at: string;
  expired_at: string;
}

function mapInvitation(row: InvitationRow): InvitationListItem {
  const expired = new Date(row.expired_at).getTime() <= Date.now();
  return {
    id: row.id,
    type: row.type,
    email: row.email,
    token: row.token,
    gym_id: row.gym_id,
    gym_name: row.gym_name ?? "",
    user_registered: row.user_registered,
    registered_name: row.registered_name ?? "",
    is_used: row.is_used,
    status: row.is_used ? "used" : expired ? "expired" : "pending",
    createdAt: format(row.created_at, "yyyy-MM-dd HH:mm"),
    expiresAt: format(row.expired_at, "yyyy-MM-dd HH:mm"),
  };
}

const SELECT_INVITATION = `
  SELECT i.id, i.type, i.email, i.token, i.gym_id, i.user_registered,
         i.is_used, i.created_at, i.expired_at,
         g.name AS gym_name, u.full_name AS registered_name
    FROM invitations i
    LEFT JOIN gyms g ON g.id = i.gym_id
    LEFT JOIN user_credentials u ON u.id = i.user_registered`;

export interface InvitationListFilters {
  type?: string;
  gym?: string;
  status?: string;
}

export async function listInvitations({
  type,
  gym,
  status,
}: InvitationListFilters = {}): Promise<InvitationListItem[]> {
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (type) {
    params.push(type);
    conditions.push(`i.type = $${params.length}`);
  }
  if (gym) {
    params.push(gym);
    conditions.push(`i.gym_id = $${params.length}`);
  }
  if (status === "used") {
    conditions.push(`i.is_used = true`);
  } else if (status === "pending") {
    conditions.push(`i.is_used = false AND i.expired_at > now()`);
  } else if (status === "expired") {
    conditions.push(`i.is_used = false AND i.expired_at <= now()`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const { rows } = await query<InvitationRow>(
    `${SELECT_INVITATION} ${where} ORDER BY i.created_at DESC`,
    params
  );
  return rows.map(mapInvitation);
}

export async function createInvitation(input: InvitationFormData): Promise<InvitationListItem> {
  const token = randomBytes(32).toString("hex");
  const row = await queryOne<InvitationRow>(
    `WITH inserted AS (
       INSERT INTO invitations (type, email, token, gym_id)
       VALUES ($1, $2, $3, $4)
       RETURNING *
     )
     SELECT i.id, i.type, i.email, i.token, i.gym_id, i.user_registered,
            i.is_used, i.created_at, i.expired_at,
            g.name AS gym_name, NULL::text AS registered_name
       FROM inserted i
       LEFT JOIN gyms g ON g.id = i.gym_id`,
    [input.type, input.email, token, input.gym_id ?? null]
  );
  return mapInvitation(row!);
}

// Re-arm an unused invitation: fresh token + reset the 7-day expiry window.
export async function resendInvitation(id: string): Promise<InvitationListItem | null> {
  const token = randomBytes(32).toString("hex");
  const row = await queryOne<InvitationRow>(
    `WITH updated AS (
       UPDATE invitations
          SET token = $2,
              expired_at = now() + interval '7 days',
              is_used = false
        WHERE id = $1 AND is_used = false
        RETURNING *
     )
     SELECT i.id, i.type, i.email, i.token, i.gym_id, i.user_registered,
            i.is_used, i.created_at, i.expired_at,
            g.name AS gym_name, u.full_name AS registered_name
       FROM updated i
       LEFT JOIN gyms g ON g.id = i.gym_id
       LEFT JOIN user_credentials u ON u.id = i.user_registered`,
    [id, token]
  );
  return row ? mapInvitation(row) : null;
}

export async function deleteInvitation(id: string): Promise<void> {
  await query(`DELETE FROM invitations WHERE id = $1`, [id]);
}
