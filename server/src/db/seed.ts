/**
 * Seeds login-capable demo accounts with bcrypt-hashed passwords.
 *
 *   bun run db:seed
 *
 * Idempotent: re-running updates the password/profile for each email rather
 * than creating duplicates. Existing domain data (gyms, plans, …) is untouched.
 */
import { pool, withTransaction } from "./pool.js";
import { hashPassword } from "../auth/jwt.js";

interface SeedAccount {
  email: string;
  password: string;
  fullName: string;
  userType: "member" | "gym" | "coach" | "client";
  isSuperAdmin?: boolean;
}

const ACCOUNTS: SeedAccount[] = [
  { email: "super@fitsync.test", password: "Passw0rd!", fullName: "Platform Admin", userType: "gym", isSuperAdmin: true },
  { email: "gym@fitsync.test", password: "Passw0rd!", fullName: "Gym Owner", userType: "gym" },
  { email: "coach@fitsync.test", password: "Passw0rd!", fullName: "Online Coach", userType: "coach" },
];

async function upsertAccount(acc: SeedAccount) {
  const passwordHash = await hashPassword(acc.password);

  await withTransaction(async (client) => {
    const existing = await client.query<{ id: string }>(
      "SELECT id FROM user_credentials WHERE lower(email) = lower($1)",
      [acc.email]
    );

    if (existing.rows[0]) {
      await client.query(
        `UPDATE user_credentials
            SET full_name = $2, user_type = $3, is_super_admin = $4,
                password_hash = $5, updated_at = now()
          WHERE id = $1`,
        [existing.rows[0].id, acc.fullName, acc.userType, acc.isSuperAdmin ?? false, passwordHash]
      );
      console.log(`[seed] updated ${acc.email}`);
      return;
    }

    await client.query(
      `INSERT INTO user_credentials (email, password_hash, full_name, user_type, is_super_admin)
       VALUES ($1, $2, $3, $4, $5)`,
      [acc.email, passwordHash, acc.fullName, acc.userType, acc.isSuperAdmin ?? false]
    );
    console.log(`[seed] created ${acc.email}`);
  });
}

async function main() {
  for (const acc of ACCOUNTS) {
    await upsertAccount(acc);
  }
  await pool.end();
  console.log("[seed] done — all accounts use password 'Passw0rd!'");
}

main().catch((err) => {
  console.error("[seed] failed:", err);
  process.exit(1);
});
