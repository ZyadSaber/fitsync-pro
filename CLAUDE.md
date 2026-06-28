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

> **Re-platformed off Next.js → Vite + Express.** Next.js is fully removed —
> there is no `app/` directory, no `middleware.ts`, and the package is
> uninstalled. The stack is: a **Vite SSR marketing app** (`apps/marketing`) for
> SEO, a **Vite SPA dashboard** (`apps/dashboard`) for the authenticated product,
> and an **Express** server (`server/`) exposing a REST API (raw SQL via `pg`) +
> custom JWT auth + hosting the SSR/SPA. Routing uses `react-router-dom` v7; i18n
> uses `react-i18next`.
>
> **The root-level `components/`, `types/`, `validations/`, `constants/`,
> `hooks/`, `lib/`, and `i18n/` dirs are live shared code**, imported by the
> dashboard via the `@/*` alias — they are *not* legacy. Only the Next.js runtime
> (App Router pages, Server Actions, middleware) is gone. A few Supabase
> artifacts (`lib/supabase/*`, `services/management/`) survive as the last
> un-ported references; treat them as inert. See "Migration status" below.

### New architecture (Vite + Express)

```
server/src/          Express: index.ts (bootstrap), ssr.ts (marketing SSR host),
                     env.ts, db/{pool,migrate,seed}, db/repositories/* (raw SQL),
                     db/SQL/* (schema, views, ordered migrations),
                     auth/{jwt,middleware}, routes/* (REST), lib/apiResult.ts
apps/marketing/      Vite SSR app — entry-server/entry-client, React 19 metadata
apps/dashboard/      Vite SPA — main.tsx (BrowserRouter + QueryClient + AuthProvider),
                     App.tsx (routes), auth/AuthProvider, layout/ (DashboardShell,
                     Sidebar), lib/{api,queryClient}, compat/ (Next shims), pages/*
i18n/                Shared (root): index.ts (locale → localStorage + cookie),
                     navigation.tsx (react-router nav shim), messages/{ar,en}.json
constants/, components/, types/, validations/, hooks/, lib/   Shared root dirs (@/*)
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

### Domain model

FitSync Pro is a multi-role fitness management platform (React 19 + Tailwind CSS
v4) backed by a Supabase **Postgres** database accessed directly via `pg` (Auth
and RLS are no longer used — authz is enforced in Express).

### Two independent product modules

The app serves two completely separate business contexts that share the same codebase:

1. **Gym Module** — gym owners (admins) manage a facility; gym coaches are assigned to gym members; members check in via QR code.
2. **Online Coaching Module** — independent coaches (no gym) work directly with online clients.

The nullable `gym_id` column on `profiles`, `coaches`, `clients`, and most other tables is how this split is expressed in the database — a `NULL` `gym_id` means the user belongs to the online coaching context. All queries must account for this.

### User roles

Five distinct roles, each with separate dashboard routes:

| Role | Route | Belongs to |
|---|---|---|
| Gym Admin/Owner | `/admin` | Gym module |
| Gym Coach | `/coach` (with `gym_id`) | Gym module |
| Gym Member | `/member` | Gym module |
| Online Coach | `/coach` (without `gym_id`) | Online module |
| Online Client | `/client` | Online module |

### Platform admin (super admin)

`/management/*` routes are a separate portal for the platform operator (not gym
admins) — the auth role is `super_admin`. Access is gated in Express via
`requireSuperAdmin` on the API and on the client by `DashboardShell`. Do not
conflate this role with the Gym Admin role.

### Adding a REST slice (the pattern to follow)

Reads and writes both flow through the Express REST API; the dashboard talks to
it with TanStack Query (`useQuery`/`useMutation`) via `apps/dashboard/src/lib/api.ts`.
The **Management → Gyms** slice (`apps/dashboard/src/pages/management/gyms/`) is
the canonical reference. To add an endpoint:

1. **Repository** — raw parameterized SQL in `server/src/db/repositories/*`
   (reuse Postgres **views** for JOIN-heavy reads; multi-step writes use
   `withTransaction`). Never string-interpolate SQL.
2. **Router** — `server/src/routes/*`, guarded by `requireAuth` /
   `requireRole` / `requireSuperAdmin`, validating the body with a Zod schema
   from `validations/`, returning the `{ data }` / `{ error }` envelope via
   `server/src/lib/apiResult.ts`.
3. **Page** — a react-router route under `apps/dashboard/src/pages/*` calling the
   endpoint through `lib/api.ts`. Mutations live in a co-located
   `*_mutations.ts`.

### Code organisation (shared root dirs)

| Directory | What goes here |
|---|---|
| `types/` | TypeScript interfaces and discriminated union string-literal types (e.g. `GymPlan`, `BillingRecordStatus`) |
| `validations/` | Zod schemas and their inferred `FormData` types — shared by server routes and client forms |
| `constants/` | `navigation.ts` (canonical sidebar/role config), `apiRoutes.ts`, etc. |
| `components/` | Shared React component tree (`ui/`, `layout/`, `management/`, `superadmin/`, …) reused by the dashboard |
| `hooks/` | Reusable React hooks (`useFormManager`, `useVisibility`, …) |
| `lib/` | Utility helpers (formatting, dates, PDF export, …) |
| `i18n/` | `index.ts` (i18next init + locale persistence), `navigation.tsx` (react-router nav shim), `messages/{ar,en}.json` |

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
- `management/*` (super-admin gate, `section="management"` on `DashboardShell`):
  index → `ManagementOverviewPage`; `gyms` (the reference slice, wired end-to-end
  with REST + `pg`, plus subscription/billing tabs under `gyms/partials/`),
  `coaches`, `subscriptions`, and `activity` are all wired pages; only `quotas` is
  still a `<Placeholder>`.
- `admin/*` (`section="admin"`): index → `AdminDashboard`, `members` →
  `MembersPage`.
- `coach/*` (`section="coach"`): index → `CoachDashboard`, `exercises` →
  `ExercisesPage`.
- `member/*`, `client/*` — mount `DashboardShell` but have no inner pages yet.

`DashboardShell` (`apps/dashboard/src/layout/DashboardShell.tsx`) takes a
`section` prop; it maps section → role via `SECTION_ROLE` in
`constants/navigation.ts` (the single source of truth for sidebar items, brand,
and role plumbing) and renders `Sidebar` + an `<Outlet/>`. The full schema is at
`server/src/db/SQL/full_schema.sql`; the auth migration is
`server/src/db/SQL/migrations/custom_auth.sql`.

### Localization

The app targets the Egyptian market first. **Arabic (`ar`) is the default
locale.** The locale is **not in the URL** — it is persisted to `localStorage` +
the `fs_locale` cookie and restored on boot in `i18n/index.ts`, which also
reflects `lang`/`dir` (rtl/ltr) on `<html>`. Switch with
`i18n.changeLanguage(...)` (e.g. the `LanguageChange` component), never by
changing the path.

**Always import navigation primitives from `@/i18n/navigation`** (`next/navigation`
has been removed):

```ts
import { Link, redirect, usePathname, useRouter, useSearchParams } from "@/i18n/navigation";
```

These are thin react-router wrappers (`i18n/navigation.tsx`); they no longer
prefix paths with a locale. `useSearchParams` returns a plain `URLSearchParams`
(not react-router's `[params, setParams]` tuple).

Sidebar nav labels are **bilingual `[en, ar]` tuples** defined in
`constants/navigation.ts` (the `Bilingual` type + `pick()` helper) — not in the
`i18n/messages/*.json` files. Component-level copy *does* use `react-i18next`
(`useTranslation(undefined, { keyPrefix })`).

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

The dashboard is wrapped in `QueryClientProvider` in
`apps/dashboard/src/main.tsx` using the **module-singleton** `queryClient`
(`apps/dashboard/src/lib/queryClient.ts`, `staleTime: 60_000`, `retry: 1`).
Exporting it as a singleton lets client-side mutation modules invalidate queries
from outside the React tree — the SPA replacement for Next's `revalidatePath`.
All reads/writes go through `useQuery`/`useMutation` against the REST API via
`lib/api.ts`. (`components/providers/QueryProvider.tsx` is a leftover Next-era
wrapper and is not used by the SPA.)

### Layout shell

The dashboard shell lives in `apps/dashboard/src/layout/`:
`DashboardShell` (section → role + `Sidebar` + `<Outlet/>`), `Sidebar`,
`HeaderContent`, `MenuButton`, and `SidebarContext` (mobile open/close). There is
no `AppShell`/`Topbar` (those were Next-era components).

### Path alias

`@/*` maps to the project root (shared `components/`, `types/`, `lib/`, etc.) and
`@dashboard/*` maps to `apps/dashboard/src/`. Both are configured in
`apps/dashboard/vite.config.ts` (and `tsconfig`). Use them for all internal imports.

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

**Done:** Next.js fully removed (no `app/`, no `middleware.ts`, package
uninstalled). Express core (pg pool, JWT auth, middleware); full REST API
(`/api/auth`, `/api/gyms`, `/api/coaches`, `/api/subscriptions`,
`/api/admin/dashboard`, `/api/activity`) as raw-SQL repositories; marketing SSR
app; dashboard SPA (react-router + react-i18next + auth + `lib/api`) with
**Management** (gyms/coaches/subscriptions/activity/overview), **admin**
(dashboard + members), and **coach** (dashboard + exercises) pages wired.

**Remaining:** management `quotas`; the `member/*` and `client/*` inner pages;
retiring the last Supabase references (`lib/supabase/*`,
`services/management/`). Follow the Gyms slice pattern (repository → guarded
router → react-router page with `useQuery`/`useMutation`). Run `db:migrate` +
`db:seed` against a real `DATABASE_URL` to exercise the auth + data flow.
