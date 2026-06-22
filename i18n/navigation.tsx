/**
 * Navigation primitives backed by react-router, kept at `@/i18n/navigation` so
 * existing components import them unchanged. The locale is no longer carried in
 * the URL (it lives in localStorage/cookie — see i18n/index.ts), so
 * these no longer prefix paths with /ar|/en; the optional `locale` arg is
 * accepted for source compatibility but ignored for routing.
 */
import type { ComponentProps } from "react";
import { Link as RouterLink, useLocation, useNavigate } from "react-router";

// The SPA is mounted under this base (Vite `base` + router `basename`).
// react-router applies it automatically; a full-page window.location
// navigation must add it explicitly.
const BASENAME = "/application";

function normalize(href: string): string {
  if (/^https?:\/\//.test(href) || href.startsWith("#")) return href;
  return href.startsWith("/") ? href : `/${href}`;
}

type LinkProps = Omit<ComponentProps<typeof RouterLink>, "to"> & {
  href: string;
  locale?: string;
};

export function Link({ href, locale: _locale, ...rest }: LinkProps) {
  return <RouterLink to={normalize(href)} {...rest} />;
}

interface NavOpts {
  locale?: string;
}

export function useRouter() {
  const navigate = useNavigate();
  return {
    push: (href: string, _opts?: NavOpts) => navigate(normalize(href)),
    replace: (href: string, _opts?: NavOpts) => navigate(normalize(href), { replace: true }),
    back: () => navigate(-1),
    forward: () => navigate(1),
    refresh: () => {},
    prefetch: () => {},
  };
}

export function usePathname(): string {
  return useLocation().pathname;
}

export function getPathname({ href }: { href: string; locale?: string }): string {
  return normalize(href);
}

export function redirect(href: string): void {
  const path = normalize(href);
  window.location.assign(/^https?:\/\//.test(path) ? path : `${BASENAME}${path}`);
}
