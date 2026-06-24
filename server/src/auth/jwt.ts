import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { env } from "../env.js";

export type UserRole = "super_admin" | "gym" | "coach" | "member" | "client";

export interface AuthUser {
  /** user_credentials.id */
  id: string;
  role: UserRole;
  gymId: string | null;
  isSuperAdmin: boolean;
}

interface AccessTokenClaims extends AuthUser {
  type: "access";
}

interface RefreshTokenClaims {
  sub: string;
  type: "refresh";
}

// ── Password hashing ───────────────────────────────────────────────────────
export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

// ── Token signing ──────────────────────────────────────────────────────────
export function signAccessToken(user: AuthUser): string {
  const claims: AccessTokenClaims = { ...user, type: "access" };
  return jwt.sign(claims, env.jwtSecret, {
    expiresIn: env.accessTokenTtl as jwt.SignOptions["expiresIn"],
  });
}

export function signRefreshToken(userId: string): string {
  const claims: RefreshTokenClaims = { sub: userId, type: "refresh" };
  return jwt.sign(claims, env.refreshSecret, {
    expiresIn: env.refreshTokenTtl as jwt.SignOptions["expiresIn"],
  });
}

// ── Token verification ─────────────────────────────────────────────────────
export function verifyAccessToken(token: string): AuthUser {
  const decoded = jwt.verify(token, env.jwtSecret) as AccessTokenClaims;
  if (decoded.type !== "access") throw new Error("Invalid token type");
  return {
    id: decoded.id,
    role: decoded.role,
    gymId: decoded.gymId ?? null,
    isSuperAdmin: decoded.isSuperAdmin ?? false,
  };
}

export function verifyRefreshToken(token: string): { userId: string } {
  const decoded = jwt.verify(token, env.refreshSecret) as RefreshTokenClaims;
  if (decoded.type !== "refresh") throw new Error("Invalid token type");
  return { userId: decoded.sub };
}
