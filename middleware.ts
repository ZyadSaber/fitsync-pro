import { createServerClient } from "@supabase/ssr";
import createIntlMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";

const handleI18nRouting = createIntlMiddleware(routing);

// Routes that require a specific user_type
const GYM_STAFF_ROUTES = ["/admin"];   // gym owner + staff pages
const COACH_ROUTES = ["/coach"];   // coach dashboard
const AUTH_ROUTES = ["/sign-in", "/sign-up"]; // skip auth check here

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

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const { locale, pathWithoutLocale } = extractLocaleAndPath(pathname);

  // Public routes — just apply intl routing and move on
  if (isUnderAny(pathWithoutLocale, AUTH_ROUTES)) {
    return handleI18nRouting(request);
  }

  const isGymRoute = isUnderAny(pathWithoutLocale, GYM_STAFF_ROUTES);
  const isCoachRoute = isUnderAny(pathWithoutLocale, COACH_ROUTES);

  if (!isGymRoute && !isCoachRoute) {
    return handleI18nRouting(request);
  }

  // ── Protected route: check auth ──────────────────────────────────────────
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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Not signed in → send to auth page (root)
  if (!user) {
    return NextResponse.redirect(new URL(`/${locale}`, request.url));
  }

  // Fetch the user type from their profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("user_type")
    .eq("id", user.id)
    .single();

  const userType = profile?.user_type ?? "member";

  // Gym admin pages — only 'gym' accounts
  if (isGymRoute && userType !== "gym") {
    return NextResponse.redirect(new URL(`/${locale}`, request.url));
  }

  // Coach pages — only 'coach' accounts
  if (isCoachRoute && userType !== "coach") {
    return NextResponse.redirect(new URL(`/${locale}`, request.url));
  }

  // Auth passed — apply intl routing (may rewrite/set locale cookie)
  const intlResponse = handleI18nRouting(request);

  // Forward any auth cookies that were refreshed
  response.cookies.getAll().forEach((cookie) => {
    intlResponse.cookies.set(cookie.name, cookie.value, {
      path: cookie.path,
      sameSite: cookie.sameSite as "lax" | "strict" | "none" | undefined,
      secure: cookie.secure,
      httpOnly: cookie.httpOnly,
      maxAge: cookie.maxAge,
    });
  });

  return intlResponse;
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
