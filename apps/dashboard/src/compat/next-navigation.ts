/**
 * Drop-in replacement for `next/navigation` (non-localized), backed by
 * react-router. Wired via a Vite alias.
 */
import {
  useNavigate,
  useLocation,
  useSearchParams as useRouterSearchParams,
  useParams as useRouterParams,
} from "react-router";

export function useRouter() {
  const navigate = useNavigate();
  return {
    push: (href: string) => navigate(href),
    replace: (href: string) => navigate(href, { replace: true }),
    back: () => navigate(-1),
    forward: () => navigate(1),
    refresh: () => {},
    prefetch: () => {},
  };
}

export function usePathname(): string {
  return useLocation().pathname;
}

export function useSearchParams(): URLSearchParams {
  const [params] = useRouterSearchParams();
  return params;
}

export function useParams<T extends Record<string, string | string[]>>(): T {
  return useRouterParams() as T;
}

export function redirect(href: string): never {
  // The SPA is mounted under /application (Vite base + router basename); a
  // full-page navigation must carry that prefix for app-relative paths.
  window.location.assign(href.startsWith("/") ? `/application${href}` : href);
  throw new Error("REDIRECT");
}

export function notFound(): never {
  throw new Error("NEXT_NOT_FOUND");
}
