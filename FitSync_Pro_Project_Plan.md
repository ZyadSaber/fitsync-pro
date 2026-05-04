# FitSync Pro — Full Project Plan

> Egypt-first gym management & online coaching platform  
> Stack: Next.js 15 · Supabase · Tailwind CSS · shadcn/ui · WhatsApp Business API  
> Last updated: May 2026

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [User Types & Journeys](#2-user-types--journeys)
3. [Tech Stack](#3-tech-stack)
4. [Database Schema](#4-database-schema)
5. [Phase 1 — Gym MVP](#5-phase-1--gym-mvp-months-1-4)
6. [Phase 2 — Online Coaching (Standalone)](#6-phase-2--online-coaching-standalone-months-4-8)
7. [Phase 3 — Payments + Scale](#7-phase-3--payments--scale-months-8-18)
8. [Go-To-Market](#8-go-to-market)
9. [Egypt-Specific Notes](#9-egypt-specific-notes)
10. [Environment Variables](#10-environment-variables)

---

## 1. Product Overview

FitSync Pro is two products sharing one platform:

| Module | Who it's for | Gym required? |
|--------|-------------|---------------|
| **Gym Module** | Gym owners, in-gym coaches, gym members | Yes |
| **Online Coaching Module** | Independent coaches + their remote clients | **No** |

A coach or client never needs a gym to use FitSync Pro. The two modules share the same auth, database, and codebase — but operate completely independently.

### Unique Selling Points
- Only platform in Egypt connecting gym admin + in-gym coach + member in one product
- Online coaches can run their entire business without any gym affiliation
- Clients of online coaches never touch the gym module — clean, separate experience
- InBody body composition sync (certified device in gym, LookinBody Web export)
- Apple Wallet / Google Wallet membership pass — works offline at gym door
- Arabic-first UI with RTL support
- WhatsApp-first notifications
- YouTube unlisted video library — zero hosting cost for coaches

---

## 2. User Types & Journeys

This is the most important section. Every schema and routing decision flows from here.

### Five Distinct User Types

#### Type 1 — Gym Admin
- Owns or manages a gym
- Manages members, subscriptions, staff, pricing, classes
- Signs up → creates a gym → invites coaches and members

#### Type 2 — Gym Coach
- Works inside a specific gym
- Assigned to gym members as their personal trainer
- Builds workout and nutrition plans for gym clients
- Can optionally also be an Online Coach (same account, different module)
- Signs up via gym invite → linked to gym → manages assigned clients

#### Type 3 — Gym Member
- Attends a physical gym that uses FitSync
- Uses QR code to check in, views plans, tracks attendance and InBody results
- Signs up via gym invite or QR onboarding link → linked to gym

#### Type 4 — Online Coach (Independent)
- Has no gym, or their gym does not use FitSync
- Runs their coaching business entirely through FitSync
- Has a public profile page where clients can discover and join them
- Manages remote clients: plans, check-ins, progress photos, video library
- Signs up independently → creates coach profile → invites clients

#### Type 5 — Online Client (Independent)
- Has no gym membership, or their gym is not on FitSync
- Connected only to their online coach
- **Never sees anything gym-related**
- Clean, simple experience: view plan → log workout → daily check-in → progress
- Signs up via coach's invite link or public profile page

### Key Architectural Rule

> `gym_id` is **nullable everywhere**.  
> A user, client, coach, or plan must be able to exist with no gym attached.  
> This single decision is what makes standalone coaching work.

---

## 3. Tech Stack

### Final Stack (No ORM — Supabase client only)

| Layer | Technology | Notes |
|-------|-----------|-------|
| Framework | Next.js 15 (App Router) | Server components, route handlers |
| Styling | Tailwind CSS + shadcn/ui | RTL support, fast to build |
| Database | Supabase (PostgreSQL) | Direct client — no Prisma, no Drizzle |
| Auth | Supabase Auth | Phone OTP + email. Role stored in profiles table |
| Row-Level Security | Supabase RLS | Isolation enforced at DB level per user type |
| File Storage | Supabase Storage | Profile photos, progress photos, InBody PDFs |
| Realtime | Supabase Realtime | Live gym check-in feed for admin/coach dashboard |
| Notifications | WhatsApp Business API (Twilio) | Primary channel — Egyptian users open WhatsApp |
| QR Code | qrcode.react + jsQR | Browser-based generate + scan, no native needed |
| Wallet Passes | passkit-generator (Node.js) | .pkpass served via Next.js route handler |
| Video Library | YouTube unlisted embeds | Coach pastes URL, app stores ID and embeds |
| Deployment | Vercel + Supabase Cloud | Free tiers cover pilot comfortably |
| Phase 2 Mobile | Expo (React Native) | Client portal only. Same Supabase API |
| Phase 3 Payments | Paymob | Fawry, Vodafone Cash, Visa/MC for Egypt |

### Supabase Client Setup

```typescript
// lib/supabase/client.ts — browser client (auth state + realtime)
import { createBrowserClient } from '@supabase/ssr'
export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

// lib/supabase/server.ts — server client (server components + route handlers)
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
export const createServerSupabaseClient = () =>
  createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookies().getAll() } }
  )
```

**Rules:**
- Always use the server client in server components and route handlers
- Use the browser client only for realtime and auth state listening
- Use `.rpc('fn_name', { params })` for complex queries (analytics, compliance stats)
- RLS handles access control — no manual `gym_id` filters needed in every query

### YouTube Utility

```typescript
// lib/youtube.ts
export function getYouTubeId(url: string): string | null {
  const patterns = [
    /youtube\.com\/watch\?v=([^&]+)/,
    /youtu\.be\/([^?]+)/,
    /youtube\.com\/embed\/([^?]+)/,
  ]
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}

export function getEmbedUrl(url: string): string | null {
  const id = getYouTubeId(url)
  if (!id) return null
  return `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1`
}

export function getThumbnail(url: string): string | null {
  const id = getYouTubeId(url)
  if (!id) return null
  return `https://img.youtube.com/vi/${id}/mqdefault.jpg`
}
```

> **Tell coaches:** Set videos to **Unlisted**, not Private. Private videos will not embed.  
> Deleted videos break for all clients — treat linked videos as permanent.

---

## 4. Database Schema

### Design Principles
1. `gym_id` is nullable everywhere — no coach, client, or plan requires a gym
2. `profiles` is the central user table — one row per auth user, role stored here
3. `clients` is the universal term for end-users (replaces "members" which implied a gym)
4. Coaches optionally link to a gym — online coaches have `gym_id = NULL`
5. All coaching content (exercises, plans, logs) belongs to a coach, not a gym
6. `coach_clients.context` distinguishes gym vs online relationships

---

### Full Schema

```sql
-- ============================================================
-- GYMS
-- ============================================================
CREATE TABLE gyms (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  owner_id      UUID REFERENCES auth.users(id),
  address       TEXT,
  phone         TEXT,
  logo_url      TEXT,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- PROFILES (one row per auth user — all roles)
-- ============================================================
CREATE TABLE profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  gym_id        UUID REFERENCES gyms(id),        -- NULL for online-only users
  role          TEXT NOT NULL CHECK (role IN ('admin', 'coach', 'client')),
  full_name     TEXT,
  phone         TEXT,
  avatar_url    TEXT,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- COACHES
-- Online-only coach:  gym_id = NULL, is_online_coach = true
-- Gym coach:          gym_id = set,  is_online_coach = false (or true for dual)
-- ============================================================
CREATE TABLE coaches (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id      UUID REFERENCES profiles(id) ON DELETE CASCADE,
  gym_id          UUID REFERENCES gyms(id),       -- NULL = standalone online coach
  bio             TEXT,
  specialties     TEXT[],
  is_online_coach BOOLEAN DEFAULT false,
  public_slug     TEXT UNIQUE,                    -- fitsync.app/c/coach-ahmed
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- CLIENTS
-- Gym client:    gym_id = set,  (coach optional)
-- Online client: gym_id = NULL, coach required
-- Both:          gym_id set + coach set
-- ============================================================
CREATE TABLE clients (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id          UUID REFERENCES profiles(id) ON DELETE CASCADE,
  gym_id              UUID REFERENCES gyms(id),    -- NULL for online-only clients
  membership_status   TEXT CHECK (membership_status IN ('active', 'frozen', 'expired')),
  membership_type     TEXT,
  start_date          DATE,
  end_date            DATE,
  qr_code             TEXT UNIQUE,                 -- gym door check-in token
  created_at          TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- COACH <-> CLIENT RELATIONSHIPS
-- context = 'gym'    → gym-assigned client
-- context = 'online' → independent online client
-- ============================================================
CREATE TABLE coach_clients (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id      UUID REFERENCES coaches(id) ON DELETE CASCADE,
  client_id     UUID REFERENCES clients(id) ON DELETE CASCADE,
  context       TEXT NOT NULL CHECK (context IN ('gym', 'online')),
  started_at    TIMESTAMPTZ DEFAULT now(),
  is_active     BOOLEAN DEFAULT true,
  UNIQUE (coach_id, client_id)
);

-- ============================================================
-- COACH INVITE LINKS
-- Coach generates a link → client clicks → auto-joins
-- ============================================================
CREATE TABLE coach_invites (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id      UUID REFERENCES coaches(id) ON DELETE CASCADE,
  token         TEXT UNIQUE NOT NULL DEFAULT gen_random_uuid()::TEXT,
  expires_at    TIMESTAMPTZ,
  used          BOOLEAN DEFAULT false,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- GYM SUBSCRIPTION PLANS (gym module only)
-- ============================================================
CREATE TABLE gym_plans (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id          UUID REFERENCES gyms(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  price_egp       NUMERIC NOT NULL,
  duration_days   INT NOT NULL,
  is_active       BOOLEAN DEFAULT true,
  valid_from      DATE,
  valid_to        DATE                -- seasonal / Ramadan offers
);

-- ============================================================
-- GYM CLASSES (Yoga, Kickboxing, Gymnastics etc.)
-- ============================================================
CREATE TABLE gym_classes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id          UUID REFERENCES gyms(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  description     TEXT,
  price_egp       NUMERIC,
  schedule        JSONB,
  coach_id        UUID REFERENCES coaches(id),
  is_active       BOOLEAN DEFAULT true
);

-- ============================================================
-- GYM CHECK-INS (physical door QR scan)
-- ============================================================
CREATE TABLE gym_checkins (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id          UUID REFERENCES gyms(id) NOT NULL,
  client_id       UUID REFERENCES clients(id) NOT NULL,
  checked_in_at   TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- EXERCISES (coach video library — owned by coach, not gym)
-- ============================================================
CREATE TABLE exercises (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id        UUID REFERENCES coaches(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  description     TEXT,
  muscle_group    TEXT[],
  equipment       TEXT,
  difficulty      TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  video_url       TEXT,              -- YouTube unlisted URL
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- WORKOUT PLANS (living plans — not PDFs)
-- ============================================================
CREATE TABLE workout_plans (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id        UUID REFERENCES coaches(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  weeks           INT DEFAULT 4,
  is_template     BOOLEAN DEFAULT false,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE workout_plan_days (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id         UUID REFERENCES workout_plans(id) ON DELETE CASCADE,
  week_number     INT NOT NULL,
  day_of_week     TEXT NOT NULL,     -- "Monday", "Tuesday" ...
  label           TEXT               -- "Push Day", "Rest Day" ...
);

CREATE TABLE workout_plan_exercises (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_id          UUID REFERENCES workout_plan_days(id) ON DELETE CASCADE,
  exercise_id     UUID REFERENCES exercises(id),
  sets            INT,
  reps            TEXT,              -- "8-12" or "AMRAP"
  rest_seconds    INT,
  notes           TEXT,
  sort_order      INT DEFAULT 0
);

CREATE TABLE plan_assignments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id         UUID REFERENCES workout_plans(id),
  client_id       UUID REFERENCES clients(id),
  started_at      DATE DEFAULT CURRENT_DATE,
  current_week    INT DEFAULT 1,
  is_active       BOOLEAN DEFAULT true
);

-- ============================================================
-- WORKOUT LOGS (client logs actual performance)
-- ============================================================
CREATE TABLE workout_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id       UUID REFERENCES clients(id) ON DELETE CASCADE,
  plan_id         UUID REFERENCES workout_plans(id),
  day_id          UUID REFERENCES workout_plan_days(id),
  logged_at       DATE DEFAULT CURRENT_DATE,
  completed       BOOLEAN DEFAULT false,
  notes           TEXT
);

CREATE TABLE workout_log_sets (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  log_id          UUID REFERENCES workout_logs(id) ON DELETE CASCADE,
  exercise_id     UUID REFERENCES exercises(id),
  set_number      INT,
  reps_done       INT,
  weight_kg       NUMERIC
);

-- ============================================================
-- NUTRITION PLANS
-- ============================================================
CREATE TABLE nutrition_plans (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id        UUID REFERENCES coaches(id),
  client_id       UUID REFERENCES clients(id),
  calories        INT,
  protein_g       INT,
  carbs_g         INT,
  fats_g          INT,
  meal_notes      TEXT,
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- DAILY CHECK-INS (online coaching accountability log)
-- This is NOT the gym door check-in — it's a daily health report
-- ============================================================
CREATE TABLE daily_checkins (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id       UUID REFERENCES clients(id) ON DELETE CASCADE,
  date            DATE DEFAULT CURRENT_DATE,
  weight_kg       NUMERIC,
  energy_level    INT CHECK (energy_level BETWEEN 1 AND 5),
  sleep_hours     NUMERIC,
  water_litres    NUMERIC,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE (client_id, date)           -- one per client per day
);

-- ============================================================
-- PROGRESS PHOTOS (private — stored in Supabase Storage)
-- ============================================================
CREATE TABLE progress_photos (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id       UUID REFERENCES clients(id) ON DELETE CASCADE,
  taken_at        DATE DEFAULT CURRENT_DATE,
  front_url       TEXT,
  side_url        TEXT,
  back_url        TEXT
);

-- ============================================================
-- INBODY RESULTS (gym module only — requires certified device)
-- ============================================================
CREATE TABLE inbody_results (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id       UUID REFERENCES clients(id) ON DELETE CASCADE,
  gym_id          UUID REFERENCES gyms(id),
  tested_at       DATE NOT NULL,
  weight_kg       NUMERIC,
  muscle_mass_kg  NUMERIC,
  body_fat_pct    NUMERIC,
  bmi             NUMERIC,
  visceral_fat    INT,
  raw_pdf_url     TEXT               -- Supabase Storage path
);
```

---

### RLS Policies

```sql
-- GYMS: only the owner can access their gym row
ALTER TABLE gyms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "gym admin access" ON gyms
  USING (owner_id = auth.uid());

-- PROFILES: users see only their own profile
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile" ON profiles
  USING (id = auth.uid());

-- CLIENTS: three access paths
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin sees gym clients" ON clients
  USING (gym_id IN (SELECT id FROM gyms WHERE owner_id = auth.uid()));

CREATE POLICY "coach sees assigned clients" ON clients
  USING (id IN (
    SELECT cc.client_id FROM coach_clients cc
    JOIN coaches c ON c.id = cc.coach_id
    WHERE c.profile_id = auth.uid()
  ));

CREATE POLICY "client sees own row" ON clients
  USING (profile_id = auth.uid());

-- EXERCISES: coach sees only their own library
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
CREATE POLICY "coach owns exercises" ON exercises
  USING (coach_id IN (SELECT id FROM coaches WHERE profile_id = auth.uid()));

-- DAILY CHECK-INS: client owns, coach reads
ALTER TABLE daily_checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "client owns daily checkins" ON daily_checkins
  USING (client_id IN (SELECT id FROM clients WHERE profile_id = auth.uid()));

CREATE POLICY "coach reads client checkins" ON daily_checkins
  USING (client_id IN (
    SELECT cc.client_id FROM coach_clients cc
    JOIN coaches c ON c.id = cc.coach_id
    WHERE c.profile_id = auth.uid()
  ));

-- PROGRESS PHOTOS: same pattern
ALTER TABLE progress_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "client owns photos" ON progress_photos
  USING (client_id IN (SELECT id FROM clients WHERE profile_id = auth.uid()));

CREATE POLICY "coach reads client photos" ON progress_photos
  USING (client_id IN (
    SELECT cc.client_id FROM coach_clients cc
    JOIN coaches c ON c.id = cc.coach_id
    WHERE c.profile_id = auth.uid()
  ));
```

---

## 5. Phase 1 — Gym MVP (Months 1–4)

### Goal
3–5 pilot gyms. Free or 50% discount. Prove QR check-in and plan management work in a real gym environment. Be physically present weekly.

### Admin Portal Pages

| Page | Route | Description |
|------|-------|-------------|
| Dashboard | `/admin` | Active members today, Realtime check-in chart, expiring memberships alert |
| Members | `/admin/members` | All clients, status badges, search, filter by plan |
| Member detail | `/admin/members/[id]` | Profile, subscription, check-in history, InBody results |
| Add member | `/admin/members/new` | Name, phone, plan, start date — auto-generates QR code |
| Subscription plans | `/admin/plans` | Create plans: name, EGP price, duration days |
| Seasonal offers | `/admin/offers` | Time-limited offer overlays (Ramadan, summer, etc.) |
| Classes | `/admin/classes` | Multi-discipline classes with independent pricing |
| Staff | `/admin/staff` | Register gym coaches, link to gym |
| Live check-ins | `/admin/checkins/live` | Realtime feed of today's door scans |
| Settings | `/admin/settings` | Gym name, logo, address, contact info |

### Coach Portal Pages (Gym Context)

| Page | Route | Description |
|------|-------|-------------|
| Dashboard | `/coach` | All assigned clients: compliance %, weight trend, 3-day inactivity flag |
| Client list | `/coach/clients` | Quick list with last check-in and current plan |
| Client detail | `/coach/clients/[id]` | Full profile, plan, progress, InBody history |
| Exercise library | `/coach/exercises` | Private exercises with YouTube thumbnail previews |
| Add exercise | `/coach/exercises/new` | Name, muscle group, difficulty, YouTube URL + instant thumbnail |
| Workout builder | `/coach/workouts/new` | Weekly plan: days → exercises → sets/reps/rest |
| My plans | `/coach/workouts` | All plans — templates and client-specific |
| Assign plan | `/coach/clients/[id]/assign` | Assign a plan, set start date, set current week |
| Nutrition | `/coach/clients/[id]/nutrition` | Set macros and meal notes per client |
| InBody upload | `/coach/clients/[id]/inbody` | Upload CSV or PDF from LookinBody Web export |

### Client App Pages (Gym Member)

| Page | Route | Description |
|------|-------|-------------|
| Home | `/app` | Today's workout, daily check-in prompt, current streak |
| My plan | `/app/plan` | This week's workout, check off exercises per day |
| Log workout | `/app/plan/log` | Log actual sets, reps, weight per exercise |
| Nutrition | `/app/nutrition` | Today's macro targets from coach |
| QR check-in | `/app/checkin` | QR code to show at gym door |
| Attendance | `/app/attendance` | Calendar view + consistency score % |
| Progress | `/app/progress` | Weight chart over time |
| InBody | `/app/progress/inbody` | InBody results timeline |
| Membership | `/app/membership` | Current plan, expiry date, freeze/pause button |
| Wallet pass | `/app/membership/wallet` | Add to Apple Wallet or Google Wallet |

### Auth + Shared Pages

| Page | Route | Description |
|------|-------|-------------|
| Login | `/login` | Phone OTP (primary) + email fallback |
| Onboarding | `/onboarding` | Role detected from invite token, or user selects |
| Gym invite | `/join/gym/[token]` | Client clicks → joins gym → onboarding flow |
| 404 | `/not-found` | — |

### Phase 1 Build Order

```
Week 1–2    Supabase: schema, RLS policies, phone OTP auth, role middleware
Week 3–4    Admin: client list, add client, QR code generation
Week 5–6    Client: QR display page + Admin: QR scanner for gym door
Week 7–8    Admin: subscription plans + seasonal offers system
Week 9–10   Coach: exercise library with YouTube embed + thumbnail preview
Week 11–12  Coach: workout plan builder (days, exercises, sets/reps)
Week 13–14  Coach: assign plan to client → client views and logs workout
Week 15     Coach: nutrition builder per client
Week 15     Coach: client dashboard with compliance % and inactivity flags
Week 16     Apple/Google Wallet pass generation
Week 16     WhatsApp notifications (renewal reminders, routine change alerts)
```

### Phase 1 Success Metrics
- Members scanning QR instead of paper sign-in sheets
- At least 2 coaches building plans inside the app (not sending PDFs)
- At least 1 gym paying after the free pilot period
- Zero data leakage between gyms

---

## 6. Phase 2 — Online Coaching (Standalone) (Months 4–8)

### Goal
Launch online coaching as a completely independent product. A coach with no gym can sign up, get a public profile, invite clients, and run their full coaching business. First paying online coaches by end of phase.

### The Standalone Coach Journey

```
Coach signs up
  → chooses "I'm an independent online coach"
  → fills out profile: bio, specialties, photo
  → receives public URL: fitsync.app/c/coach-ahmed
  → builds exercise library (YouTube links)
  → creates first workout plan template
  → generates an invite link
  → sends link to client via WhatsApp
  → client clicks, signs up with phone OTP
  → client lands in a clean app — no gym UI anywhere
  → coach assigns plan + nutrition
  → client logs daily
  → coach monitors from online dashboard
```

### The Online Client Journey

```
Client receives invite link from coach via WhatsApp
  → clicks fitsync.app/join/coach/[token]
  → signs up with phone OTP
  → sees ONLY:
      My Plan · Log Workout · Nutrition
      Daily Check-in · Progress · Progress Photos
  → never sees:
      QR code · Membership card · Attendance · InBody · Wallet pass
```

### New Pages — Coach (Online Context)

| Page | Route | Description |
|------|-------|-------------|
| Public profile | `/c/[slug]` | Bio, specialties, packages, "Work with me" CTA |
| Online dashboard | `/coach/online` | All remote clients: compliance %, last log, weight trend, inactivity flag |
| Check-in feed | `/coach/online/checkins` | Chronological feed of all client daily logs |
| Photo review | `/coach/online/photos/[clientId]` | Side-by-side weekly front/side/back comparison |
| Log review | `/coach/clients/[id]/logs` | Coach sees actual weights lifted vs what was prescribed |
| Invite manager | `/coach/invites` | Generate, copy, and track invite links |
| Coach join flow | `/join/coach/[token]` | Client lands here → signs up → auto-joins coach |

### New Pages — Online Client

| Page | Route | Description |
|------|-------|-------------|
| Daily check-in | `/app/checkin/daily` | Weight, energy 1–5, sleep hours, water litres, free notes |
| Progress photos | `/app/progress/photos` | Upload front/side/back. Private. Side-by-side history view. |
| My coach | `/app/coach` | Coach name, bio, contact — context, not a chat |

### Conditional Rendering — Gym vs Online Client

```typescript
// In any client layout — check once, store in context
const { data: client } = await supabase
  .from('clients')
  .select('gym_id')
  .eq('profile_id', userId)
  .single()

const isGymMember = !!client?.gym_id

// Gym-only UI — never renders for online-only clients
{isGymMember && <QRCheckinCard />}
{isGymMember && <AttendanceCalendar />}
{isGymMember && <MembershipCard />}
{isGymMember && <WalletPassButton />}
{isGymMember && <InBodyTimeline />}

// Always visible regardless of gym status
<TodaysPlan />
<WorkoutLogger />
<NutritionCard />
<DailyCheckinPrompt />
<ProgressChart />
<ProgressPhotos />
```

### Dual-Mode Coaches (Gym + Online)

A Cairo gym trainer almost always has online clients on the side. FitSync supports this in the same account:

```typescript
// Coach dashboard — two separate client lists, one account
const { data: gymClients } = await supabase
  .from('coach_clients')
  .select('*, clients(*)')
  .eq('coach_id', coachId)
  .eq('context', 'gym')

const { data: onlineClients } = await supabase
  .from('coach_clients')
  .select('*, clients(*)')
  .eq('coach_id', coachId)
  .eq('context', 'online')
```

Coach portal shows two tabs: **Gym clients** and **Online clients**. Same exercise library, same plan builder — context is just different.

### Phase 2 Success Metrics
- 5+ online-only coaches actively using the platform
- Online clients logging daily check-ins 5+ days/week
- At least 3 coaches reporting they no longer use Telegram/WhatsApp for client management
- First coach publicly sharing their `/c/[slug]` profile on Instagram

---

## 7. Phase 3 — Payments + Scale (Months 8–18)

### Goal
Monetize the platform directly. Expand to all Cairo districts, then Alexandria.

### Paymob Integration

Supported methods for Egypt:
- Visa / Mastercard
- Fawry
- Vodafone Cash
- ValU (BNPL — popular for annual gym memberships)

### Revenue Streams

| Stream | Who pays | Amount |
|--------|----------|--------|
| Gym SaaS — Starter | Gym owner | ~1,500 EGP/month |
| Gym SaaS — Pro | Gym owner | ~3,000 EGP/month |
| Gym SaaS — Elite (InBody + multi-branch) | Gym owner | ~5,000 EGP/month |
| Online Coach — Solo (up to 15 clients) | Independent coach | ~500 EGP/month |
| Online Coach — Pro (unlimited clients) | Independent coach | ~1,000 EGP/month |
| Platform cut on coach-client payments | Automatic | 5–8% per transaction |

### Break-Even

- Lean 2-person team monthly burn: ~60,000 EGP
- Break-even: **20 gyms on Pro tier**
- Seed raise milestone: **50 gyms + 30 online coaches = ~1.8M EGP ARR**

### Phase 3 New Features
- In-app 1-on-1 messaging (coach sets office hours to prevent 2am messages)
- Multi-branch support (one admin, multiple gym locations)
- Full analytics dashboard (retention, revenue, coach performance)
- Arabic / English language toggle (full RTL)
- Automated Ramadan campaign mode (bulk offers, countdown banners, renewal push)
- Coach earnings dashboard (client payments, payout history)

---

## 8. Go-To-Market

### Phase 1 — Pilot Gyms (Months 1–4)
1. Sign 3–5 gyms you know personally — a handshake is enough to start
2. Free or 50% discounted during pilot
3. Prioritize gyms that already own an InBody machine
4. Be physically present weekly — watch real people use it

### Phase 2 — Online Coach Channel (Months 3–8)
1. Find 5 Cairo trainers with 30K+ Instagram/TikTok followers
2. Give them free Pro coach accounts in exchange for content
3. Their dashboard screenshot on Instagram Stories is worth more than any paid ad
4. Each trainer brings 10–40 online clients with them — instant user base

### Phase 3 — Expand + Raise (Months 8–18)
1. Expand to all Cairo districts, then Alexandria
2. Target MENA-focused investors with real data: **Flat6Labs**, **Disruptech**, **A15**
3. Pitch: "The only platform in MENA handling gym management AND independent online coaching — built in Egypt, not localized from a Western SaaS"

---

## 9. Egypt-Specific Notes

### WhatsApp First
Egyptian users open WhatsApp. They ignore push notifications and don't check email. Every automated message — renewal reminders, routine change alerts, check-in confirmations, daily nudges — must go via WhatsApp Business API (Twilio as BSP).

### Arabic UI (RTL)
Set `dir="rtl"` on the `<html>` tag from day one. Tailwind handles RTL layout automatically with the `rtl:` variant prefix. Build every UI component to work in both directions from the start — never retrofit RTL.

### Phone OTP as Default Auth
Make phone OTP the primary login method. Egyptian users trust it. Email is a fallback only. Supabase Auth supports phone OTP natively.

### Ramadan Campaign Mode
Egyptian gyms run their biggest campaigns before and during Ramadan. Build a one-click "Ramadan offer" mode in the admin panel — activate, set discount, set dates, done. Online coaches use the same mechanic for package discounts. No global competitor does this explicitly.

### InBody (Manual first, Auto later)
- Phase 1: Coach exports from LookinBody Web → uploads CSV or PDF manually
- Phase 2: Explore LookinBody API for auto-sync once coaches prove they use the feature
- Store PDFs in Supabase Storage, display parsed data in client profile
- Online clients never see InBody — it's gym-only

---

## 10. Environment Variables

```env
# ── Supabase ──────────────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# ── WhatsApp / Twilio ─────────────────────────────────────
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886

# ── Apple Wallet ──────────────────────────────────────────
APPLE_PASS_TYPE_IDENTIFIER=pass.com.yourapp.membership
APPLE_TEAM_IDENTIFIER=
APPLE_CERT_PEM=
APPLE_KEY_PEM=
APPLE_WWDR_PEM=

# ── Phase 3: Paymob ───────────────────────────────────────
PAYMOB_API_KEY=
PAYMOB_INTEGRATION_ID=
PAYMOB_IFRAME_ID=
```

---

## Start Here — Monday Morning

```bash
npx create-next-app@latest fitsync-pro --typescript --tailwind --app
cd fitsync-pro
npx shadcn@latest init
npm install @supabase/supabase-js @supabase/ssr
```

Then in order:

1. Create Supabase project at supabase.com
2. Run the full schema SQL in the Supabase SQL editor
3. Add all RLS policies
4. Enable phone OTP in Supabase Auth dashboard
5. Build `/middleware.ts` — detect role on login, redirect to `/admin`, `/coach`, or `/app`
6. Build the admin client list — your first real screen with real data
7. Wire up QR code generation when a client is created
8. Call a gym owner you know and put their real data in

---

## What Makes This Different

| Other platforms | FitSync Pro |
|----------------|-------------|
| Online coaches are an afterthought | Online coaches are first-class users |
| Clients need a gym to exist | Clients can exist with no gym at all |
| One product (gym OR coaching) | Two modules, one platform, one login |
| Western SaaS localized for MENA | Built in Egypt, for Egypt, from day one |
| `gym_id` required everywhere | `gym_id` nullable everywhere |
| Coaches tied to one gym | Coaches can have gym clients + online clients simultaneously |

**The rest will follow.**
