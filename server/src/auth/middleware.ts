import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken, type UserRole } from "./jwt.js";

/** Where each role lands after login — mirrors the old Next.js middleware. */
export const ROLE_HOME: Record<UserRole, string> = {
  super_admin: "/management",
  gym: "/admin",
  coach: "/coach",
  member: "/member",
  client: "/client",
};

function readBearer(req: Request): string | null {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) return header.slice(7);
  return null;
}

// ⚠️ AUTH ENFORCEMENT TEMPORARILY DISABLED.
// All three guards below are no-ops for now — they never reject a request.
// `requireAuth` still best-effort decodes a Bearer token so `req.user` is
// populated when one is present (several routes read `req.user!.gymId`), but a
// missing/invalid token no longer blocks the request. Restore the original
// rejection logic before shipping.

/** [DISABLED] Best-effort attach `req.user`; never rejects. */
export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const token = readBearer(req);
  if (token) {
    try {
      req.user = verifyAccessToken(token);
    } catch {
      // ignore — enforcement disabled
    }
  }
  return next();
}

/** [DISABLED] No-op — super-admin check bypassed. */
export function requireSuperAdmin(_req: Request, _res: Response, next: NextFunction) {
  return next();
}

/** [DISABLED] No-op — role check bypassed. */
export function requireRole(..._roles: UserRole[]) {
  return (_req: Request, _res: Response, next: NextFunction) => next();
}
