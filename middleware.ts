import { createServerClient } from "@supabase/ssr";
import createIntlMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";

const handleI18nRouting = createIntlMiddleware(routing);

const AUTH_ROUTES = ["/", "/sign-in", "/sign-up"];

const ROLE_HOME: Record<string, string> = {
  super_admin: "/management",
  gym: "/admin",
  coach: "/coach",
  member: "/member",
  client: "/client",
};

function extractLocaleAndPath(pathname: string) {
  const locale =
    (routing.locales as readonly string[]).find(
      (l) => pathname.startsWith(`/${l}/`) || pathname === `/${l}`
    ) ?? routing.defaultLocale;
  return { locale, pathWithoutLocale: pathname.slice(`/${locale}`.length) || "/" };
}

function isUnder(path: string, prefix: string) {
  return path === prefix || path.startsWith(`${prefix}/`);
}

function buildSupabaseClient(request: NextRequest) {
  let response = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );
  return { supabase, getResponse: () => response };
}

function forwardCookies(from: NextResponse, to: NextResponse) {
  from.cookies.getAll().forEach((c) =>
    to.cookies.set(c.name, c.value, {
      path: c.path,
      sameSite: c.sameSite as "lax" | "strict" | "none" | undefined,
      secure: c.secure,
      httpOnly: c.httpOnly,
      maxAge: c.maxAge,
    })
  );
  return to;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const { locale, pathWithoutLocale } = extractLocaleAndPath(pathname);

  const { supabase, getResponse } = buildSupabaseClient(request);
  const { data: { user } } = await supabase.auth.getUser();

  // ── Public auth pages ────────────────────────────────────────────────────
  if (AUTH_ROUTES.some((r) => pathWithoutLocale === r)) {
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("user_type, is_super_admin")
        .eq("id", user.id)
        .single();

      const role = profile?.is_super_admin ? "super_admin" : (profile?.user_type ?? "client");
      const dest = ROLE_HOME[role] ?? "/";
      return forwardCookies(
        getResponse(),
        NextResponse.redirect(new URL(`/${locale}${dest}`, request.url))
      );
    }
    return handleI18nRouting(request);
  }

  // ── Protected routes ─────────────────────────────────────────────────────
  const isProtected =
    isUnder(pathWithoutLocale, "/management") ||
    isUnder(pathWithoutLocale, "/admin") ||
    isUnder(pathWithoutLocale, "/coach") ||
    isUnder(pathWithoutLocale, "/member") ||
    isUnder(pathWithoutLocale, "/client");

  if (!isProtected) return handleI18nRouting(request);

  if (!user) {
    return NextResponse.redirect(new URL(`/${locale}`, request.url));
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("user_type, is_super_admin")
    .eq("id", user.id)
    .single();

  const isSuperAdmin = !!profile?.is_super_admin;
  const userType = profile?.user_type ?? "client";

  // Super admin: only /management is allowed
  if (isSuperAdmin) {
    if (!isUnder(pathWithoutLocale, "/management")) {
      return NextResponse.redirect(new URL(`/${locale}/management`, request.url));
    }
    return forwardCookies(getResponse(), handleI18nRouting(request));
  }

  // Regular users: block /management and enforce their own section
  if (isUnder(pathWithoutLocale, "/management")) {
    return NextResponse.redirect(new URL(`/${locale}`, request.url));
  }

  const allowed =
    (userType === "gym"    && isUnder(pathWithoutLocale, "/admin"))  ||
    (userType === "coach"  && isUnder(pathWithoutLocale, "/coach"))  ||
    (userType === "member" && isUnder(pathWithoutLocale, "/member")) ||
    (userType === "client" && isUnder(pathWithoutLocale, "/client"));

  if (!allowed) {
    return NextResponse.redirect(new URL(`/${locale}${ROLE_HOME[userType] ?? "/"}`, request.url));
  }

  return forwardCookies(getResponse(), handleI18nRouting(request));
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
