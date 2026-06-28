import { query, queryOne } from "../pool.js";
import { hashPassword } from "../../auth/jwt.js";
import type { CreateUserData, UpdateUserData } from "@/validations/userSchema";
import { format } from "date-fns";

export interface UserListItem {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  user_type: string;
  gym_id: string | null;
  gym_name: string;
  avatar_url: string;
  is_super_admin: boolean;
  hasLogin: boolean;
  createdAt: string;
}

interface UserRow {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  user_type: string;
  gym_id: string | null;
  gym_name: string | null;
  avatar_url: string | null;
  is_super_admin: boolean;
  created_at: string;
}

function mapUser(row: UserRow): UserListItem {
  return {
    id: row.id,
    full_name: row.full_name ?? "",
    email: row.email ?? "",
    phone: row.phone ?? "",
    user_type: row.user_type,
    gym_id: row.gym_id,
    gym_name: row.gym_name ?? "",
    avatar_url: row.avatar_url ?? "",
    is_super_admin: row.is_super_admin,
    hasLogin: !!row.email,
    createdAt: format(row.created_at, "yyyy-MM-dd HH:mm"),
  };
}

const SELECT_USER = `
  SELECT u.id, u.full_name, u.email, u.phone, u.user_type, u.gym_id,
         u.avatar_url, u.is_super_admin, u.created_at, g.name AS gym_name
    FROM user_credentials u
    LEFT JOIN gyms g ON g.id = u.gym_id`;

export interface UserListFilters {
  search?: string;
  type?: string;
  gym?: string;
}

export async function listUsers({ search, type, gym }: UserListFilters = {}): Promise<UserListItem[]> {
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (type) {
    params.push(type);
    conditions.push(`u.user_type = $${params.length}`);
  }
  if (gym) {
    params.push(gym);
    conditions.push(`u.gym_id = $${params.length}`);
  }
  if (search) {
    params.push(`%${search}%`);
    conditions.push(
      `(u.full_name ILIKE $${params.length} OR u.email ILIKE $${params.length} OR u.phone ILIKE $${params.length})`
    );
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const { rows } = await query<UserRow>(`${SELECT_USER} ${where} ORDER BY u.created_at DESC`, params);
  return rows.map(mapUser);
}

export async function getUser(id: string): Promise<UserListItem | null> {
  const row = await queryOne<UserRow>(`${SELECT_USER} WHERE u.id = $1`, [id]);
  return row ? mapUser(row) : null;
}

export async function emailExists(email: string, excludeId?: string): Promise<boolean> {
  const params: unknown[] = [email];
  let sql = "SELECT 1 FROM user_credentials WHERE lower(email) = lower($1)";
  if (excludeId) {
    params.push(excludeId);
    sql += ` AND id <> $${params.length}`;
  }
  return !!(await queryOne(sql, params));
}

export async function createUser(input: CreateUserData): Promise<string> {
  const passwordHash = input.email && input.password ? await hashPassword(input.password) : null;
  const row = await queryOne<{ id: string }>(
    `INSERT INTO user_credentials
       (user_type, full_name, email, phone, gym_id, avatar_url, is_super_admin, password_hash)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id`,
    [
      input.user_type,
      input.full_name,
      input.email || null,
      input.phone || "",
      input.gym_id ?? null,
      input.avatar_url || "",
      input.is_super_admin ?? false,
      passwordHash,
    ]
  );
  return row!.id;
}

export async function updateUser(id: string, input: UpdateUserData): Promise<void> {
  // Only re-hash the password when a new one was supplied; otherwise leave it.
  const passwordHash = input.password ? await hashPassword(input.password) : null;
  await query(
    `UPDATE user_credentials
        SET user_type = $2,
            full_name = $3,
            email = $4,
            phone = $5,
            gym_id = $6,
            avatar_url = $7,
            is_super_admin = $8,
            password_hash = COALESCE($9, password_hash),
            updated_at = now()
      WHERE id = $1`,
    [
      id,
      input.user_type,
      input.full_name,
      input.email || null,
      input.phone || "",
      input.gym_id ?? null,
      input.avatar_url || "",
      input.is_super_admin ?? false,
      passwordHash,
    ]
  );
}

export async function deleteUser(id: string): Promise<void> {
  await query(`DELETE FROM user_credentials WHERE id = $1`, [id]);
}
