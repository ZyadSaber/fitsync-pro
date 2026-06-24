# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

The project uses **bun** as the package manager (`bun.lock` is committed).

```bash
bun run dev            # Express API + marketing SSR (:3000) AND dashboard SPA (:5173)
bun run dev:server     # Express only — REST API + marketing SSR via Vite middleware
bun run dev:dashboard  # Dashboard SPA only (Vite dev, proxies /api → :3000)
bun run build          # Build dashboard + marketing (client+SSR) + server
bun run start          # Run the production server (serves everything on one port)
bun run lint           # Run ESLint
bun run db:migrate     # Apply custom_auth.sql to DATABASE_URL
bun run db:seed        # Seed login accounts (all use password 'Passw0rd!')
bun run typecheck:server # Type-check the Express server (tsc --noEmit)
```

Server type-check: `bun run typecheck:server` (or `bunx tsc -p server/tsconfig.json --noEmit`).
All SQL lives under `server/src/db/SQL/`: `full_schema.sql`, `views.sql`, `seed.sql`,
and the ordered `migrations/*.sql` set (the auth decoupling is `migrations/custom_auth.sql`).
There is **no** root `db/` directory — older references to `db/...` paths are obsolete.
Seeded accounts: `super@fitsync.test` (super admin), `gym@fitsync.test`, `coach@fitsync.test`.

## Architecture

> **MIGRATION IN PROGRESS — Next.js 16 → Vite + Express.** The app is being
> re-platformed off Next.js. The new stack is: a **Vite SSR marketing app**
> (`apps/marketing`) for SEO, a **Vite SPA dashboard** (`apps/dashboard`) for the
> authenticated product, and an **Express** server (`server/`) exposing a REST API
> (raw SQL via `pg`) + custom JWT auth + hosting the SSR/SPA. Routing uses
> `react-router-dom` v7; i18n uses `react-i18next`. The legacy Next.js source
> (`app/`, `middleware.ts`, `services/`, `lib/supabase/`,
> `i18n/routing.ts`) is **inert reference material** kept for porting the
> remaining dashboard pages — Next is uninstalled and nothing runs it.
> See "New architecture" and "Migration status" below.

### New architecture (Vite + Express)

```
server/src/          Express: index.ts (bootstrap), ssr.ts (marketing SSR host),
                     env.ts, db/{pool,migrate,seed}, db/repositories/* (raw SQL),
                     db/SQL/* (schema, views, ordered migrations),
                     auth/{jwt,middleware}, routes/* (REST), lib/apiResult.ts
apps/marketing/      Vite SSR app — entry-server/entry-client, React 19 metadata
apps/dashboard/      Vite SPA — main.tsx, App.tsx (react-router),
                     auth/ (AuthProvider + guards), lib/api.ts, compat/ (shims),
                     i18n.ts (locale persisted to localStorage + cookie), pages/*
styles/globals.css   Shared Tailwind v4 stylesheet (imported by both apps)
```

- **Auth**: custom JWT. `POST /api/auth/sign-in` issues a short-lived access token
  (Bearer) + an httpOnly refresh cookie; `lib/api.ts` refreshes once on a 401.
  Authorization is enforced in Express (`requireAuth`/`requireRole`/
  `requireSuperAdmin`) — RLS is no longer relied upon. Credentials live in the
  `user_credentials` table (see `server/src/db/SQL/migrations/custom_auth.sql`); passwords are
  bcrypt-hashed.
- **DB access**: raw parameterized SQL via `pg` in `server/src/db/repositories/*`,
  reusing the existing Postgres **views** (`gym_list`, `online_coach_list`,
  `subscription_plan_stats`, `admin_dashboard_metrics`,
  `platform_subscription_details`). Multi-step writes use `withTransaction`.
- **i18n**: components use `react-i18next` directly (`useTranslation(undefined, {
  keyPrefix })`); the locale lives in `i18n/index.ts` (SSR-safe — all
  `window`/`document` access is guarded). next-intl has been fully removed.
- **Compat shims**: `apps/dashboard/vite.config.ts` aliases
  `next/link`, `next/cache`, `next/headers` to small modules in
  `apps/dashboard/src/compat/`, and `@/i18n/navigation` is reimplemented
  (`i18n/navigation.tsx`) on react-router — it owns every navigation primitive
  (`useRouter`, `usePathname`, `useSearchParams`, `redirect`, `Link`). `next/navigation`
  has been removed entirely (no alias, no shim). This lets the existing component tree
  be reused with minimal edits.

### Legacy context (Next.js — being replaced)

FitSync Pro is a multi-role fitness management platform originally built on **Next.js 16 (App Router)**, **React 19**, **Supabase** (Postgres + Auth + RLS), and **Tailwind CSS v4**.

### Two independent product modules

The app serves two completely separate business contexts that share the same codebase:

1. **Gym Module** — gym owners (admins) manage a facility; gym coaches are assigned to gym members; members check in via QR code.
2. **Online Coaching Module** — independent coaches (no gym) work directly with online clients.

The nullable `gym_id` column on `profiles`, `coaches`, `clients`, and most other tables is how this split is expressed in the database — a `NULL` `gym_id` means the user belongs to the online coaching context. All queries and RLS policies must account for this.

### User roles

Five distinct roles, each with separate dashboard routes:

| Role | Route | Belongs to |
|---|---|---|
| Gym Admin/Owner | `/admin` | Gym module |
| Gym Coach | `/coach` (with `gym_id`) | Gym module |
| Gym Member | `/member` | Gym module |
| Online Coach | `/coach` (without `gym_id`) | Online module |
| Online Client | `/client` | Online module |

### Supabase client pattern

Two clients with distinct uses — never swap them:

- `lib/supabase/client.ts` — browser client; use in Client Components for realtime subscriptions and auth state changes.
- `lib/supabase/server.ts` — async server client via `@supabase/ssr`; use in Server Components and Route Handlers. Must be `await`ed: `const supabase = await createServerSupabaseClient()`.

RLS policies on the database enforce access control, so always use the user-scoped anon-key clients (not the service-role key) in application code.

### Next.js 16 dynamic API change

In Next.js 16 the `params` and `searchParams` props on layouts and pages are **Promises** — always `await` them before destructuring:

```ts
const { locale } = await params;
```

Accessing them synchronously (as in older Next.js) will throw at runtime.

### Platform admin (super admin)

`/management/*` routes are a separate portal for the platform operator (not gym admins). Middleware protects these routes by checking `is_super_admin = true` on the user's profile. RLS policies on platform tables call the `public.is_super_admin()` SQL function. Do not conflate this role with the Gym Admin role.

### Server Actions pattern

All mutations go through Server Actions (`actions.ts` co-located with the route). Every action:
1. Validates input with a Zod schema from `validations/` first.
2. Returns `ActionResult<T>` from `types/common.ts` — a discriminated union `{ success: true; data: T } | { success: false; error: string }`.
3. Calls `revalidatePath()` after a successful mutation.

Zod schemas and their inferred types are exported from `validations/` and imported by both the action (server) and the form component (client) to keep validation in sync.

### Services layer

Data-access logic lives in `services/`, not in page components or actions directly. Service functions:
- Return `{ data: T; error: null | string }` for reads and call the server Supabase client.
- Use Supabase **views** (e.g., `gym_list`) for queries that would otherwise require multi-table JOINs — the view handles the JOIN and RLS applies via `security_invoker = true`.
- Log errors with a contextual prefix: `console.error("[functionName]", error)`.

The data flow is: **Page (Server Component) → service function → Supabase view/table** for reads, and **Client Component → Server Action → service/Supabase → revalidatePath** for writes.

### Code organisation rules

| Directory | What goes here |
|---|---|
| `types/` | TypeScript interfaces and discriminated union string-literal types (e.g. `GymPlan`, `BillingRecordStatus`) |
| `validations/` | Zod schemas and their inferred `FormData` types |
| `services/` | Data-access functions — Supabase queries, no business logic beyond mapping |
| `lib/` | Utility helpers, Supabase client factories |
| `actions.ts` | Next.js Server Actions, co-located with the route that owns them |

### Current state (live Vite SPA — `apps/dashboard/src/App.tsx`)

The dashboard SPA is mounted under the **`/application`** base on the shared
origin (Vite `base: "/application/"` + react-router `basename="/application"`; the
server serves its static assets and SPA shell under `/application`, marketing SSR
owns everything else). react-router `<Link>`/`navigate`/`<Navigate>` apply the
basename automatically; only full-page `window.location` redirects must add
`/application` explicitly (handled in the compat `redirect()` helpers).

**Locale is not in the URL.** The active language (`ar`/`en`, default `ar`) is
persisted to `localStorage` + a `fs_locale` cookie and restored on boot in
`i18n/index.ts`, which also reflects `lang`/`dir` (rtl/ltr) on
`<html>` via a `languageChanged` listener. Switch via `i18n.changeLanguage(...)`
(e.g. the `LanguageChange` component) — never by changing the path.

The router is the source of truth for what's actually wired. Routes (no locale
prefix) under `/application`:

- `sign-in` — custom JWT login (`POST /api/auth/sign-in`).
- `management/*` (super-admin gate, section on `DashboardShell`): index →
  `ManagementOverviewPage`; `gyms` (the reference slice, wired end-to-end with REST
  + `pg`, plus subscription/billing tabs under `gyms/partials/`), `coaches`,
  `subscriptions`, and `activity` are all wired pages; only `quotas` is still a
  `<Placeholder>`.
- `admin/*`, `coach/*`, `member/*`, `client/*` — mount `DashboardShell` but the
  inner pages are not yet ported.

The legacy Next.js pages under `app/[locale]/**` are **inert reference** for porting
the remaining slices — do not treat them as running code. The full schema is at
`server/src/db/SQL/full_schema.sql`; the auth migration is
`server/src/db/SQL/migrations/custom_auth.sql`.

### Localization

The app targets the Egyptian market first. **Arabic (`ar`) is the default locale** — routes without a locale prefix redirect to `/ar/...`. The `[locale]` segment in `app/[locale]/` is always present.

**Always import navigation primitives from `@/i18n/navigation`** (`next/navigation` no
longer exists — it has been removed):

```ts
import { Link, redirect, usePathname, useRouter, useSearchParams } from "@/i18n/navigation";
```

These are thin react-router wrappers (`i18n/navigation.tsx`). `useSearchParams` returns a
plain `URLSearchParams` (not react-router's `[params, setParams]` tuple).

The root layout sets `dir="rtl"` and switches fonts when `locale === "ar"`. Cairo (Arabic) and Inter (Latin) are loaded via Google Fonts in `app/[locale]/layout.tsx`. Sidebar nav labels are hardcoded bilingual strings inside the component itself — they are **not** sourced from the `i18n/` translation files.

### CSS design system

`styles/globals.css` is the shared Tailwind v4 stylesheet imported by both apps (the legacy `app/globals.css` is inert). It defines CSS custom properties and utility classes used throughout the app. Prefer these over arbitrary Tailwind values:

| Token | Value | Use |
|---|---|---|
| `var(--ink)` | `#0B0F1A` | Dark sidebar bg, primary text |
| `var(--ink2)` | `#161B26` | Slightly lighter dark surface |
| `var(--paper)` | `#FAFAF7` | App background |
| `var(--surface)` | `#FFFFFF` | Card backgrounds |
| `var(--accent)` | `#2D5BFF` | CTA buttons, active states |
| `var(--accent-soft)` | `#EAF0FF` | Accent tints / badge backgrounds |
| `var(--hairline)` | `#E5E7EB` | Primary borders |
| `var(--hairline2)` | `#EEF0F4` | Subtle row separators |
| `var(--muted)` | `#6B7280` | Secondary text |
| `var(--muted2)` | `#9AA1AE` | Tertiary / placeholder text |
| `var(--green)` | `#16A34A` | Success / active |
| `var(--amber)` | `#D97706` | Warning / pending |
| `var(--red)` | `#DC2626` | Error / expired |
| `var(--whatsapp)` | `#25D366` | WhatsApp action colour |

Utility classes follow the `fs-*` prefix: `fs-btn`, `fs-input`, `fs-nav`, `fs-badge`, `fs-metric`, `fs-card`, `fs-av`, `fs-th`, `fs-td`, `fs-tr`. Button variants: `fs-btn primary`, `fs-btn accent`, `fs-btn ghost`, `fs-btn sm`. Badge variants: `active`, `frozen`, `expired`, `pending`, `gym`. Card variant: `fs-card pad` (adds `padding: 20px`). Typography helpers: `fs-num` (tabular numerals), `fs-mono` (monospace), `fs-eyebrow` (uppercase label), `fs-blink` (pulsing animation for live indicators).

The custom `Icon` component at `components/ui/Icon.tsx` renders inline SVGs by name string. Use it for all icons inside the app shell — available names: `home`, `users`, `user`, `card`, `tag`, `qr`, `dumbbell`, `chart`, `plus`, `search`, `filter`, `bell`, `flame`, `whatsapp`, `logo`, `more`, `wallet`, `apple`, `google`, `play`.

### Client-side data fetching

`components/providers/QueryProvider.tsx` wraps the app with React Query (TanStack Query). It is configured with `staleTime: 60_000` and `retry: 1`. Use React Query for client-side mutations or optimistic updates where Server Actions are not enough. For straightforward reads, prefer Server Components fetching via the services layer.

### AppShell behaviour

`AppShell` (`components/layout/AppShell.tsx`) is a client component that reads the pathname to detect `role`. It only renders the `Sidebar` for routes under `/admin` or `/coach`. All other routes (auth, landing page, etc.) render without the sidebar shell.

All dashboard pages start with a `Topbar` (`components/layout/Topbar.tsx`) that renders the page title, subtitle, a search input, a notifications bell, and optional `actions` (buttons). Pass `dir="rtl"` when in Arabic context.

### Path alias

`@/*` maps to the project root (configured in `tsconfig.json`). Use it for all internal imports.

### Environment variables

Required in `.env.local`:

```
# Server (Express)
DATABASE_URL=                      # Supabase Postgres connection string (sslmode=require)
PGSSL=require
JWT_SECRET=
REFRESH_TOKEN_SECRET=
ACCESS_TOKEN_TTL=15m
REFRESH_TOKEN_TTL=30d
PORT=3000

# Client (Vite — exposed to the browser, must be VITE_-prefixed)
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=

# Optional integrations
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_WHATSAPP_FROM=
```

`DATABASE_URL` is the only hard requirement to boot the server (use the Supabase
**Database → Connection string (URI)**, pooler URI, keep `sslmode=require`).

### Migration status (Next.js → Vite + Express)

**Done & verified:** workspace/tooling; Express core (pg pool, JWT auth,
middleware); full REST API (`/api/auth`, `/api/gyms`, `/api/coaches`,
`/api/subscriptions`, `/api/admin/dashboard`, `/api/activity`) as raw-SQL
repositories; marketing
SSR app (renders with React 19 metadata); dashboard SPA foundation (react-router +
react-i18next + auth guards + `lib/api`) with the **Management → Gyms** page wired
end-to-end as the reference slice. Server typechecks; both apps build.

**Remaining (mechanical, follow the Gyms slice pattern):** port the other dashboard
pages from `app/[locale]/**` — admin dashboard, management coaches/subscriptions/
quotas, members, coach/exercises, member/client — each becomes a react-router route
using `useQuery`/`useMutation` against the REST endpoints and the (shimmed) existing
components. Then delete the legacy Next files. Run `db:migrate` + `db:seed` against a
real `DATABASE_URL` to exercise the auth + data flow.
