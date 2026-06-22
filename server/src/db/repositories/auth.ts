import { queryOne, withTransaction } from "../pool.js";
import type { AuthUser, UserRole } from "../../auth/jwt.js";

interface CredentialRow {
  profile_id: string;
  password_hash: string;
  user_type: UserRole;
  gym_id: string | null;
  is_super_admin: boolean;
}

/** Resolve the effective role (super admins always route to /management). */
function toAuthUser(row: {
  profile_id: string;
  user_type: UserRole;
  gym_id: string | null;
  is_super_admin: boolean;
}): AuthUser {
  return {
    id: row.profile_id,
    role: row.is_super_admin ? "super_admin" : row.user_type,
    gymId: row.gym_id,
    isSuperAdmin: row.is_super_admin,
  };
}

export async function findCredentialByEmail(email: string) {
  const row = await queryOne<CredentialRow>(
    `SELECT c.profile_id, c.password_hash, p.user_type, p.gym_id, p.is_super_admin
       FROM user_credentials c
       JOIN profiles p ON p.id = c.profile_id
      WHERE lower(c.email) = lower($1)`,
    [email]
  );
  if (!row) return null;
  return { passwordHash: row.password_hash, user: toAuthUser(row) };
}

export async function findAuthUserById(profileId: string): Promise<AuthUser | null> {
  const row = await queryOne<Omit<CredentialRow, "password_hash">>(
    `SELECT p.id AS profile_id, p.user_type, p.gym_id, p.is_super_admin
       FROM profiles p WHERE p.id = $1`,
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

/** Create a profile + credentials in one transaction. Returns the new AuthUser. */
export async function createUser(input: {
  email: string;
  passwordHash: string;
  fullName: string;
  userType: UserRole;
}): Promise<AuthUser> {
  return withTransaction(async (client) => {
    const profile = await client.query<{ id: string }>(
      `INSERT INTO profiles (user_type, full_name) VALUES ($1, $2) RETURNING id`,
      [input.userType, input.fullName]
    );
    const profileId = profile.rows[0].id;
    await client.query(
      `INSERT INTO user_credentials (profile_id, email, password_hash) VALUES ($1, $2, $3)`,
      [profileId, input.email, input.passwordHash]
    );
    return {
      id: profileId,
      role: input.userType,
      gymId: null,
      isSuperAdmin: false,
    };
  });
}
