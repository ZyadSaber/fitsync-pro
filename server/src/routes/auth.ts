import { Router } from "express";
import { AUTH } from "@/constants/apiRoutes";
import { signInSchema } from "@/validations/signInSchema";
import { signUpSchema } from "@/validations/signUpSchema";
import {
  hashPassword,
  signAccessToken,
  signRefreshToken,
  verifyPassword,
  verifyRefreshToken,
} from "../auth/jwt.js";
import { requireAuth, ROLE_HOME } from "../auth/middleware.js";
import { asyncHandler, badRequest, ok, parseBody, unauthorized } from "../lib/apiResult.js";
import {
  createUser,
  emailExists,
  findAuthUserById,
  findCredentialByEmail,
} from "../db/repositories/auth.js";
import { env } from "../env.js";
import type { AuthUser } from "../auth/jwt.js";

const REFRESH_COOKIE = "refresh_token";
const REFRESH_MAX_AGE_MS = 5 * 24 * 60 * 60 * 1000; // 5 days — a login session lasts 5 days

function setRefreshCookie(res: import("express").Response, userId: string) {
  res.cookie(REFRESH_COOKIE, signRefreshToken(userId), {
    httpOnly: true,
    sameSite: "lax",
    secure: env.isProd,
    path: "/api/auth",
    maxAge: REFRESH_MAX_AGE_MS,
  });
}

function authPayload(user: AuthUser) {
  return { user, accessToken: signAccessToken(user), home: ROLE_HOME[user.role] };
}

export const authRouter = Router();

// POST /api/auth/sign-in
authRouter.post(
  AUTH.signIn,
  asyncHandler(async (req, res) => {
    const { email, password } = parseBody(signInSchema, req.body);
    const found = await findCredentialByEmail(email);
    if (!found || !(await verifyPassword(password, found.passwordHash))) {
      throw unauthorized("Invalid email or password");
    }
    setRefreshCookie(res, found.user.id);
    return ok(res, authPayload(found.user));
  })
);

// POST /api/auth/sign-up  (creates an online member by default)
authRouter.post(
  AUTH.signUp,
  asyncHandler(async (req, res) => {
    const { email, name, password } = parseBody(signUpSchema, req.body);
    if (await emailExists(email)) throw badRequest("Email already registered");
    const user = await createUser({
      email,
      passwordHash: await hashPassword(password),
      fullName: name,
      userType: "member",
    });
    setRefreshCookie(res, user.id);
    return ok(res, authPayload(user), 201);
  })
);

// Validate the session held in the httpOnly refresh cookie, then rotate the
// tokens — which renews the 5-day expiry — and return the current user.
const revalidateSession = asyncHandler(async (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE];
  if (!token) throw unauthorized("No refresh token");
  let userId: string;
  try {
    ({ userId } = verifyRefreshToken(token));
  } catch {
    throw unauthorized("Invalid refresh token");
  }
  const user = await findAuthUserById(userId);
  if (!user) throw unauthorized("User no longer exists");
  setRefreshCookie(res, user.id); // renews the 5-day session window
  return ok(res, authPayload(user));
});

// POST /api/auth/refresh    (silent token rotation on a 401)
// POST /api/auth/revalidate (validate + renew the stored session on boot/resume)
authRouter.post(AUTH.refresh, revalidateSession);
authRouter.post(AUTH.revalidate, revalidateSession);

// POST /api/auth/sign-out
authRouter.post(AUTH.signOut, (_req, res) => {
  res.clearCookie(REFRESH_COOKIE, { path: "/api/auth" });
  return ok(res, { signedOut: true });
});

// GET /api/auth/me
authRouter.get(
  AUTH.me,
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await findAuthUserById(req.user!.id);
    if (!user) throw unauthorized();
    return ok(res, { user, home: ROLE_HOME[user.role] });
  })
);
