import { createServerClient } from "@supabase/ssr";
import createIntlMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";

const handleI18nRouting = createIntlMiddleware(routing);

const GYM_STAFF_ROUTES = ["/admin"];
const COACH_ROUTES = ["/coach"];
const MANAGEMENT_ROUTES = ["/management"];
const AUTH_ROUTES = ["/", "/sign-in", "/sign-up"];

// Default dashboard per user_type
const DEFAULT_ROUTE: Record<string, string> = {
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

  const pathWithoutLocale = pathname.slice(`/${locale}`.length) || "/";
  return { locale, pathWithoutLocale };
}

function isUnderAny(path: string, prefixes: string[]) {
  return prefixes.some((p) => path === p || path.startsWith(`${p}/`));
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
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
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

function forwardAuthCookies(
  from: NextResponse,
  to: NextResponse
): NextResponse {
  from.cookies.getAll().forEach((cookie) => {
    to.cookies.set(cookie.name, cookie.value, {
      path: cookie.path,
      sameSite: cookie.sameSite as "lax" | "strict" | "none" | undefined,
      secure: cookie.secure,
      httpOnly: cookie.httpOnly,
      maxAge: cookie.maxAge,
    });
  });
  return to;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const { locale, pathWithoutLocale } = extractLocaleAndPath(pathname);

  // Auth routes — redirect logged-in users to their dashboard
  if (isUnderAny(pathWithoutLocale, AUTH_ROUTES)) {
    const { supabase, getResponse } = buildSupabaseClient(request);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("user_type")
        .eq("id", user.id)
        .single();

      const userType = profile?.user_type ?? "member";
      const dest = DEFAULT_ROUTE[userType] ?? "/";
      const redirect = NextResponse.redirect(
        new URL(`/${locale}${dest}`, request.url)
      );
      return forwardAuthCookies(getResponse(), redirect);
    }

    return handleI18nRouting(request);
  }

  const isGymRoute = isUnderAny(pathWithoutLocale, GYM_STAFF_ROUTES);
  const isCoachRoute = isUnderAny(pathWithoutLocale, COACH_ROUTES);
  const isManagementRoute = isUnderAny(pathWithoutLocale, MANAGEMENT_ROUTES);

  if (!isGymRoute && !isCoachRoute && !isManagementRoute) {
    return handleI18nRouting(request);
  }

  // ── Protected route: check auth ──────────────────────────────────────────
  const { supabase, getResponse } = buildSupabaseClient(request);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL(`/${locale}`, request.url));
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("user_type, is_super_admin")
    .eq("id", user.id)
    .single();

  const userType = profile?.user_type ?? "member";

  if (isManagementRoute && !profile?.is_super_admin) {
    return NextResponse.redirect(new URL(`/${locale}`, request.url));
  }

  if (isGymRoute && userType !== "gym") {
    return NextResponse.redirect(new URL(`/${locale}`, request.url));
  }

  if (isCoachRoute && userType !== "coach") {
    return NextResponse.redirect(new URL(`/${locale}`, request.url));
  }

  const intlResponse = handleI18nRouting(request);
  return forwardAuthCookies(getResponse(), intlResponse);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
