# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

The project uses **bun** as the package manager (`bun.lock` is committed).

```bash
bun run dev      # Start development server
bun run build    # Production build
bun run lint     # Run ESLint
```

No test runner is configured. TypeScript checking runs as part of `build`.

## Architecture

FitSync Pro is a multi-role fitness management platform built on **Next.js 16 (App Router)**, **React 19**, **Supabase** (Postgres + Auth + RLS), and **Tailwind CSS v4**.

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

### Current state

The UI is built with **hardcoded demo data** — no live database queries are wired into the page components yet. The full schema exists at `db/full_schema.sql` and seed data at `db/seed.sql`. When connecting real data, Server Components should fetch via the server Supabase client; mutations should use Server Actions.

### Localization

The app targets the Egyptian market first. **Arabic (`ar`) is the default locale** — routes without a locale prefix redirect to `/ar/...`. The `[locale]` segment in `app/[locale]/` is always present.

**Always import navigation primitives from `@/i18n/navigation`, never from `next/navigation`:**

```ts
import { Link, redirect, usePathname, useRouter } from "@/i18n/navigation";
```

The locale-aware wrappers from `next-intl` handle prefixing automatically. Using Next.js built-ins directly will break locale routing.

The root layout sets `dir="rtl"` and switches fonts when `locale === "ar"`. Cairo (Arabic) and Inter (Latin) are loaded via Google Fonts in `app/[locale]/layout.tsx`. Sidebar nav labels are hardcoded bilingual strings inside the component itself — they are **not** sourced from the `messages/` translation files.

### CSS design system

`app/globals.css` defines CSS custom properties and utility classes used throughout the app. Prefer these over arbitrary Tailwind values:

| Token | Value | Use |
|---|---|---|
| `var(--ink)` | `#0B0F1A` | Dark sidebar bg, primary text |
| `var(--paper)` | `#FAFAF7` | App background |
| `var(--surface)` | `#FFFFFF` | Card backgrounds |
| `var(--accent)` | `#2D5BFF` | CTA buttons, active states |
| `var(--hairline)` | `#E5E7EB` | Borders |
| `var(--muted)` | `#6B7280` | Secondary text |

Utility classes follow the `fs-*` prefix: `fs-btn`, `fs-input`, `fs-nav`, `fs-badge`, `fs-metric`, `fs-card`, `fs-av`, `fs-th`, `fs-td`. Button variants: `fs-btn primary`, `fs-btn accent`, `fs-btn ghost`, `fs-btn sm`. Badge variants: `active`, `frozen`, `expired`, `pending`, `gym`.

The custom `Icon` component at `components/ui/Icon.tsx` renders inline SVGs by name string. Use it for all icons inside the app shell — available names: `home`, `users`, `user`, `card`, `tag`, `qr`, `dumbbell`, `chart`, `plus`, `search`, `filter`, `bell`, `flame`, `whatsapp`, `logo`, `more`, `wallet`, `apple`, `google`, `play`.

### AppShell behaviour

`AppShell` (`components/layout/AppShell.tsx`) is a client component that reads the pathname to detect `role`. It only renders the `Sidebar` for routes under `/admin` or `/coach`. All other routes (auth, landing page, etc.) render without the sidebar shell.

### Path alias

`@/*` maps to the project root (configured in `tsconfig.json`). Use it for all internal imports.

### Environment variables

Required in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_WHATSAPP_FROM=
```
