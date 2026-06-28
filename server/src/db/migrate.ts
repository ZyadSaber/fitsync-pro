/**
 * Applies the consolidated schema to the configured Postgres database.
 *
 *   bun run db:migrate
 *
 * All historical migrations have been folded into SQL/full_schema.sql, which is
 * the single source of truth. This runs it against a FRESH database to create
 * every table, index, and view in one pass. (The SQL/migrations/*.sql files are
 * now empty stubs kept only for git history.)
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { pool } from "./pool.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const SQL_DIR = path.join(here, "SQL");

const FILES = [
  "full_schema.sql",
];

async function main() {
  for (const file of FILES) {
    const full = path.join(SQL_DIR, file);
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
