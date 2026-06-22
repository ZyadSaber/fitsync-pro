/**
 * Applies the custom-auth migration to the configured Postgres database.
 *
 *   bun run db:migrate
 *
 * The pre-existing schema/views/platform tables are assumed already applied to
 * the live Supabase database; this only layers on the custom-auth decoupling.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { pool } from "./pool.js";
import { env } from "../env.js";

const MIGRATIONS = ["custom_auth.sql"];

async function main() {
  for (const file of MIGRATIONS) {
    const full = path.join(env.repoRoot, "db", "migrations", file);
    const sql = readFileSync(full, "utf8");
    console.log(`[migrate] applying ${file} ...`);
    await pool.query(sql);
    console.log(`[migrate] ✓ ${file}`);
  }
  await pool.end();
  console.log("[migrate] done");
}

main().catch((err) => {
  console.error("[migrate] failed:", err);
  process.exit(1);
});
