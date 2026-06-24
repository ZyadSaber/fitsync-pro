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
import { fileURLToPath } from "node:url";
import { pool } from "./pool.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = path.join(here, "SQL", "migrations");

const MIGRATIONS = ["custom_auth.sql", "merge_profiles_into_credentials.sql"];

async function main() {
  for (const file of MIGRATIONS) {
    const full = path.join(MIGRATIONS_DIR, file);
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
