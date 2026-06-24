import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "../..");

// Load .env.local (preferred) then .env as a fallback.
dotenv.config({ path: path.join(repoRoot, ".env.local") });
dotenv.config({ path: path.join(repoRoot, ".env") });

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  isProd: process.env.NODE_ENV === "production",
  port: Number(process.env.PORT ?? 3000),
  repoRoot,

  // Postgres
  databaseUrl: required("DATABASE_URL"),
  pgSsl: (process.env.PGSSL ?? "require") !== "disable",

  // JWT
  jwtSecret: process.env.JWT_SECRET ?? "dev-access-secret-change-me",
  refreshSecret: process.env.REFRESH_TOKEN_SECRET ?? "dev-refresh-secret-change-me",
  accessTokenTtl: process.env.ACCESS_TOKEN_TTL ?? "15m",
  refreshTokenTtl: process.env.REFRESH_TOKEN_TTL ?? "5d",
};

export type Env = typeof env;
