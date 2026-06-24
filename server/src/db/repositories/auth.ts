import { queryOne } from "../pool.js";
import type { AuthUser, UserRole } from "../../auth/jwt.js";

interface CredentialRow {
  id: string;
  password_hash: string;
  user_type: UserRole;
  gym_id: string | null;
  is_super_admin: boolean;
}

/** Resolve the effective role (super admins always route to /management). */
function toAuthUser(row: {
  id: string;
  user_type: UserRole;
  gym_id: string | null;
  is_super_admin: boolean;
}): AuthUser {
  return {
    id: row.id,
    role: row.is_super_admin ? "super_admin" : row.user_type,
    gymId: row.gym_id,
    isSuperAdmin: row.is_super_admin,
  };
}

export async function findCredentialByEmail(email: string) {
  const row = await queryOne<CredentialRow>(
    `SELECT id, password_hash, user_type, gym_id, is_super_admin
       FROM user_credentials
      WHERE lower(email) = lower($1)`,
    [email]
  );
  if (!row) return null;
  return { passwordHash: row.password_hash, user: toAuthUser(row) };
}

export async function findAuthUserById(profileId: string): Promise<AuthUser | null> {
  const row = await queryOne<Omit<CredentialRow, "password_hash">>(
    `SELECT id, user_type, gym_id, is_super_admin
       FROM user_credentials WHERE id = $1`,
    [profileId]
  );
  return row ? toAuthUser(row) : null;
}

export async function emailExists(email: string): Promise<boolean> {
  const row = await queryOne(
    "SELECT 1 FROM user_credentials WHERE lower(email) = lower($1)",
    [email]
  );
  return !!row;
}

/** Create a user (identity + credentials) in the single users table. */
export async function createUser(input: {
  email: string;
  passwordHash: string;
  fullName: string;
  userType: UserRole;
}): Promise<AuthUser> {
  const row = await queryOne<{ id: string }>(
    `INSERT INTO user_credentials (user_type, full_name, email, password_hash)
     VALUES ($1, $2, $3, $4) RETURNING id`,
    [input.userType, input.fullName, input.email, input.passwordHash]
  );
  return {
    id: row!.id,
    role: input.userType,
    gymId: null,
    isSuperAdmin: false,
  };
}
