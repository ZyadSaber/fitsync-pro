# FitSync Pro — Dev TODO List
> **Human + Claude Code collaboration tracker**  
> Stack: **Vite (SSR marketing + SPA dashboard) · Express REST API · `pg` raw SQL · custom JWT auth · react-router v7 · react-i18next · TanStack Query · Tailwind v4**  
> Last updated: June 2026

---

## How We Use This File
- ✅ = Done
- 🔄 = In progress
- ⬜ = Not started
- 🧠 = Claude Code handles this (code generation, schema, logic)
- 👤 = You handle this (accounts, keys, real data, decisions)
- 🤝 = Both together
- ❌ = Rejected or change in plan

---

## 🚚 Platform Migration — Next.js 16 → Vite + Express

> The app is being re-platformed off Next.js onto a Vite SSR marketing app
> (`apps/marketing`), a Vite SPA dashboard (`apps/dashboard`), and an Express
> REST API (`server/`) with raw SQL via `pg` and custom JWT auth. Next is
> uninstalled; the legacy `app/[locale]/**` tree is inert reference material kept
> only for porting the remaining dashboard slices.

### Infrastructure & tooling

- ✅ 🧠 Workspace + tooling (bun, Vite, tsx) — apps/marketing, apps/dashboard, server/
- ✅ 🧠 Express core: `pg` pool, JWT issue/refresh, `requireAuth`/`requireRole`/`requireSuperAdmin`
- ✅ 🧠 Custom auth: `user_credentials` (bcrypt), `POST /api/auth/sign-in` (Bearer access + httpOnly refresh cookie), single-retry refresh in `lib/api.ts`
- ✅ 🧠 SQL moved under `server/src/db/SQL/` (`full_schema.sql`, `views.sql`, `seed.sql`, ordered `migrations/*.sql` incl. `custom_auth.sql`)
- ✅ 🧠 REST repositories + routers: `/api/auth`, `/api/gyms`, `/api/coaches`, `/api/subscriptions`, `/api/admin/dashboard`, `/api/activity`
- ✅ 🧠 Marketing SSR app renders with React 19 native `<title>`/`<meta>`
- ✅ 🧠 Dashboard SPA foundation: react-router (`basename="/application"`), react-i18next (locale in localStorage + `fs_locale` cookie, no URL prefix), auth guards, compat shims (`next/link`, `next/cache`, `next/headers`, `@/i18n/navigation`)
- ✅ 🧠 Server typechecks (`typecheck:server`); both apps build
- ⬜ 🤝 Run `db:migrate` + `db:seed` against a real `DATABASE_URL` to exercise the full auth + data flow end-to-end

### Dashboard page ports (follow the Gyms reference slice)

- ⬜ 🧠 Port remaining `app/[locale]/**` pages into react-router routes (useQuery/useMutation against REST + shimmed components)
- ⬜ 🧠 Delete the legacy Next.js files (`app/`, `middleware.ts`, `services/`, `lib/supabase/`, `i18n/routing.ts`) once their slices are ported

---

## 👑 Management — Platform Management

> Platform-level role that sits above all gyms and coaches. Only FitSync staff access this. Protected by a separate `super_admin` flag on `profiles`.

### Database

- ✅ 🧠 Add `is_super_admin` boolean column to `profiles` table (default `false`, not exposed via RLS to regular users)
- ✅ 🧠 Create `platform_subscriptions` table — `id`, `gym_id`, `plan_name` (starter/pro/enterprise), `price_egp`, `billing_cycle` (monthly/yearly), `status` (active/suspended/cancelled), `started_at`, `next_billing_at`, `notes`
- ✅ 🧠 Create `platform_activity_log` table — `id`, `gym_id`, `event_type` (login, member_add, checkin, plan_change…), `actor_id`, `metadata jsonb`, `created_at`
- ✅ 🧠 Super-admin authorization now enforced in Express (`requireSuperAdmin`) — RLS no longer relied upon

---

### Management Portal — `/application/management` (super-admin gated, wired end-to-end on Vite SPA)

> Auth gate is enforced in Express (`requireSuperAdmin`) on the REST endpoints,
> not middleware. Each page is a react-router route using TanStack Query against
> the REST API. Gyms is the reference slice (wired with REST + `pg`).

- ✅ 🧠 Super-admin gate on `/management/*` (Express `requireSuperAdmin`; section guard on `DashboardShell`)
- ✅ 🧠 `management` (index) — `ManagementOverviewPage`: platform metrics via `/api/admin/dashboard`
- ✅ 🧠 `management/gyms` — Gyms table wired end-to-end (REST + `pg`): list, search, filter, create/edit via `GymsDialog`, `GymRowActions`, mutations in `gyms_mutations.ts`
- ✅ 🧠 `GymsDialog` + tabs — `GymSubscriptionTab`, `GymBillingTab` (under `gyms/partials/`)
- ✅ 🧠 `management/coaches` — `coachesPage` wired (list + `coaches_mutations.ts` + partials)
- ✅ 🧠 `management/subscriptions` — `SubscriptionsPage`: all subscriptions, filter by status
- ✅ 🧠 `management/activity` — `ActivityPage`: platform-wide activity log
- ⬜ 🧠 `management/quotas` — still a `<Placeholder>`; needs porting + REST endpoint

---

### Management Success Checklist

- ⬜ 🧠 Zero gym can see another gym's management data (Express authorization audit)
- ✅ 👤 Seeded `super@fitsync.test` super-admin account (`is_super_admin = true`)
- ⬜ 🤝 Subscription statuses sync with Paymob webhooks (Phase 3)

---

## 🏗️ Phase 1 — Gym MVP (Months 1–4)

### Foundation & Setup

- ✅ 🧠 Scaffold Vite SSR marketing + Vite SPA dashboard + Express server (migrated off Next.js)
- ✅ 👤 Create Supabase project (Postgres used as the DB; auth is now custom JWT)
- ❌ 👤 Phone OTP in Supabase Auth — replaced by custom JWT auth (`user_credentials`)
- ✅ 🧠 Run `full_schema.sql` + `views.sql` + ordered `migrations/*.sql` (incl. `custom_auth.sql`)
- ❌ 🧠 RLS policies — superseded by Express authorization (`requireAuth`/`requireRole`/`requireSuperAdmin`)
- ✅ 🧠 `pg` pool + raw-SQL repositories (`server/src/db/repositories/*`), reusing Postgres views
- ✅ 👤 Fill in `.env.local` — `DATABASE_URL` (required), `JWT_SECRET`, `REFRESH_TOKEN_SECRET`, token TTLs
- ✅ 🧠 Role-based routing via react-router + auth guards (`admin`/`coach`/`member`/`client` shells)

---

### Auth & Onboarding

- ✅ 🧠 `/login` — Phone OTP primary, email fallback
- ❌ 🧠 `/onboarding` — Role selection or auto-detect from invite token
- ❌ 🧠 `/join/gym/[token]` — Client clicks → joins gym → onboarding flow

---

### Admin Portal

- ✅ 🧠 `/admin` — Dashboard: active members today, realtime check-in chart, expiring memberships alert
- ✅ 🧠 `/admin/members` — All clients with status badges, search, filter by plan
- ⬜ 🧠 `/admin/members/new` — Add member form: name, phone, plan, start date + auto-generates QR code
- ⬜ 🧠 `/admin/members/[id]` — Member detail: profile, subscription, check-in history, InBody results
- ⬜ 🧠 `/admin/plans` — Create subscription plans: name, EGP price, duration days
- ⬜ 🧠 `/admin/offers` — Seasonal offer overlays (Ramadan, summer, etc.)
- ⬜ 🧠 `/admin/classes` — Multi-discipline classes with independent pricing
- ⬜ 🧠 `/admin/staff` — Register gym coaches, link to gym
- ⬜ 🧠 `/admin/checkins/live` — Realtime feed of today's door scans (Supabase Realtime)
- ⬜ 🧠 `/admin/settings` — Gym name, logo, address, contact info

---

### Coach Portal (Gym Context)

- ✅ 🧠 `/coach` — Dashboard: assigned clients, compliance %, weight trend, 3-day inactivity flag
- ⬜ 🧠 `/coach/clients` — Quick list with last check-in and current plan
- ⬜ 🧠 `/coach/clients/[id]` — Full client profile, plan, progress, InBody history
- ✅ 🧠 `/coach/exercises` — Private exercise library with YouTube thumbnail previews
- ⬜ 🧠 `/coach/exercises/new` — Add exercise: name, muscle group, difficulty, YouTube URL + instant thumbnail
- ✅ 🧠 `lib/youtube.ts` — YouTube ID parser + embed URL + thumbnail helper
- ⬜ 🧠 `/coach/workouts/new` — Workout plan builder: weeks → days → exercises → sets/reps/rest
- ⬜ 🧠 `/coach/workouts` — All plans (templates + client-specific)
- ⬜ 🧠 `/coach/clients/[id]/assign` — Assign plan, set start date, set current week
- ⬜ 🧠 `/coach/clients/[id]/nutrition` — Set macros + meal notes per client
- ⬜ 🧠 `/coach/clients/[id]/inbody` — Upload CSV or PDF from LookinBody Web export

---

### Client App (Gym Member)

- ⬜ 🧠 `/app` — Home: today's workout, daily check-in prompt, current streak
- ⬜ 🧠 `/app/plan` — This week's workout, check off exercises per day
- ⬜ 🧠 `/app/plan/log` — Log actual sets, reps, weight per exercise
- ⬜ 🧠 `/app/nutrition` — Today's macro targets from coach
- ⬜ 🧠 `/app/checkin` — QR code display for gym door
- ⬜ 🧠 `/app/attendance` — Calendar view + consistency score %
- ⬜ 🧠 `/app/progress` — Weight chart over time
- ⬜ 🧠 `/app/progress/inbody` — InBody results timeline
- ⬜ 🧠 `/app/membership` — Current plan, expiry date, freeze/pause button
- ⬜ 🧠 `/app/membership/wallet` — Add to Apple Wallet / Google Wallet

---

### QR Code System

- ⬜ 🧠 Generate QR code token on client creation (`qr_code` field in `clients` table)
- ⬜ 🧠 Client-side QR display page using `qrcode.react`
- ⬜ 🧠 Admin/coach QR scanner using `jsQR` (browser camera, no native needed)
- ⬜ 🧠 Check-in write to `gym_checkins` table on scan + trigger Realtime update

---

### Wallet Passes

- ⬜ 🧠 `passkit-generator` setup in Next.js route handler
- ⬜ 👤 Apple Developer account + Pass Type ID + Team ID + certificates
- ⬜ 🧠 Generate `.pkpass` with member name, expiry, QR barcode
- ⬜ 🧠 Google Wallet pass (JWT-based, simpler than Apple)

---

### WhatsApp Notifications

- ⬜ 👤 Set up Twilio account + WhatsApp Business API sandbox/production
- ⬜ 👤 Fill in `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_FROM`
- ⬜ 🧠 Notification service: renewal reminders, routine change alerts, check-in confirmations
- ⬜ 🧠 Scheduled job for expiring memberships (cron via Supabase Edge Functions or Vercel cron)

---

### Phase 1 RTL & Arabic

- ✅ 🧠 Set `dir="rtl"` on `<html>` from day one
- ⬜ 🧠 Verify all shadcn/ui components work correctly in RTL
- ⬜ 🧠 Test every layout component with both LTR and RTL

---

## 🎯 Phase 1 Success Checklist

- ⬜ 👤 Sign up 3–5 pilot gyms (handshake agreements)
- ⬜ 👤 Enter real gym + member data for pilot
- ⬜ 🤝 Members scanning QR instead of paper sign-in sheets
- ⬜ 🤝 At least 2 coaches building plans inside the app (not PDFs)
- ⬜ 🤝 At least 1 gym paying after free pilot period
- ⬜ 🤝 Zero data leakage between gyms (RLS audit)

---

## 🌐 Phase 2 — Online Coaching Standalone (Months 4–8)

### Conditional Rendering System

- ⬜ 🧠 `isGymMember` check from `clients.gym_id` stored in layout context
- ⬜ 🧠 Hide gym-only UI for online clients: QR, Attendance, Membership card, Wallet, InBody

---

### Coach (Online Context)

- ⬜ 🧠 `/c/[slug]` — Public coach profile: bio, specialties, packages, "Work with me" CTA
- ⬜ 🧠 `/coach/online` — Online dashboard: all remote clients, compliance %, last log, weight trend
- ⬜ 🧠 `/coach/online/checkins` — Chronological feed of all client daily check-in logs
- ⬜ 🧠 `/coach/online/photos/[clientId]` — Side-by-side weekly front/side/back photo comparison
- ⬜ 🧠 `/coach/clients/[id]/logs` — Coach views actual weights vs prescribed
- ⬜ 🧠 `/coach/invites` — Generate, copy, and track invite links (token-based, single-use, expiry enforced)
- ⬜ 🧠 `/join/[token]` — Client clicks invite link → auto-joins and is linked to that coach
- ⬜ 🧠 `/management/coaches` — Invite new coach by email (admin creates account, coach sets password via confirmation email)
- ⬜ 🧠 Coach portal: two tabs — **Gym clients** / **Online clients** (same account)

---

### Online Client Pages

- ⬜ 🧠 `/app/checkin/daily` — Daily check-in: weight, energy 1–5, sleep hours, water litres, notes
- ⬜ 🧠 `/app/progress/photos` — Upload front/side/back progress photos, private, side-by-side history
- ⬜ 🧠 `/app/coach` — Coach name, bio, contact info (context card, not a chat)

---

### Phase 2 Success Checklist

- ⬜ 🤝 5+ online-only coaches actively using the platform
- ⬜ 🤝 Online clients logging daily check-ins 5+ days/week
- ⬜ 🤝 3+ coaches reporting they no longer need Telegram/WhatsApp for client management
- ⬜ 👤 First coach sharing their `/c/[slug]` profile on Instagram

---

## 💳 Phase 3 — Payments + Scale (Months 8–18)

### Paymob Integration

- ⬜ 👤 Create Paymob account + get API key, Integration ID, iFrame ID
- ⬜ 🧠 Paymob checkout flow: Visa/MC, Fawry, Vodafone Cash, ValU
- ⬜ 🧠 Subscription management: create, renew, cancel gym/coach plans
- ⬜ 🧠 Coach earnings dashboard: client payments, payout history
- ⬜ 🧠 Platform 5–8% cut on coach-client transactions

---

### New Features

- ⬜ 🧠 In-app 1-on-1 messaging (coach sets office hours)
- ⬜ 🧠 Multi-branch support (one admin, multiple gym locations)
- ⬜ 🧠 Full analytics dashboard: retention, revenue, coach performance
- ⬜ 🧠 Arabic / English language toggle (full RTL)
- ⬜ 🧠 Ramadan campaign mode: bulk offers, countdown banners, renewal push

---

## 🔧 Ongoing / Cross-Cutting

- ⬜ 🧠 Error boundary + loading states on all pages
- ⬜ 🧠 Mobile responsiveness audit (Egyptian users are mobile-first)
- ⬜ 🧠 Supabase Storage buckets: profile photos, progress photos, InBody PDFs
- ⬜ 🧠 Edge function or Vercel cron for membership expiry notifications
- ⬜ 👤 Set up Vercel project + connect to GitHub repo
- ⬜ 👤 Configure custom domain on Vercel
- ⬜ 🧠 Phase 2 mobile: Expo (React Native) client portal scaffolding

---

> **Tip for Claude Code sessions:** Paste this file at the start of each session and say which task you're working on. Claude Code will pick up exactly where you left off.
