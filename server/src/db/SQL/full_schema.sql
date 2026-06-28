-- ============================================================
-- FitSync Pro — Full Schema (consolidated)
-- ------------------------------------------------------------
-- Single source of truth for the database. This file folds in every
-- migration that previously lived under SQL/migrations/*.sql, so a fresh
-- database can be provisioned by running this file alone (then views.sql is
-- redundant — its objects are included here — and seed.sql for demo data).
--
-- Auth model: custom JWT issued by the Express server. The database no longer
-- depends on Supabase Auth (`auth.users`) and authorization is enforced in
-- Express (requireAuth / requireRole / requireSuperAdmin). Row-Level Security
-- is therefore NOT defined here — the legacy auth.uid()/auth.role() policies
-- would be inert under custom JWT. See CLAUDE.md → "Auth".
--
-- Identity lives in a single `user_credentials` table (profile + role + login).
-- A NULL gym_id means the user belongs to the online-coaching context; a set
-- gym_id means the gym module.
-- ============================================================

-- ============================================================
-- GYMS
-- (owner_id FK added after user_credentials exists — the two tables
--  reference each other, so the constraint is layered on below.)
-- ============================================================
CREATE TABLE gyms (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  owner_id      UUID,
  address       TEXT DEFAULT '',
  phone         TEXT DEFAULT '',
  logo_url      TEXT DEFAULT '',
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- USER_CREDENTIALS (one row per user — identity, role, AND login)
-- Single table holding both profile data and credentials. Custom JWT auth
-- manages email/password_hash directly; rows without them are login-less
-- members/clients. user_type drives dashboard routing / access control.
-- gym_id = NULL  → online coaching context
-- gym_id = set   → gym module context
-- ============================================================
CREATE TABLE user_credentials (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id        UUID REFERENCES gyms(id),        -- NULL for online-only users
  user_type     TEXT NOT NULL DEFAULT 'member'
                CHECK (user_type IN ('member', 'gym', 'coach', 'client')),
  full_name     TEXT DEFAULT '',
  phone         TEXT DEFAULT '',
  avatar_url    TEXT DEFAULT '',
  is_super_admin BOOLEAN NOT NULL DEFAULT false,
  email         TEXT,            -- NULL for login-less users
  password_hash TEXT,            -- bcrypt; NULL for login-less users
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Case-insensitive unique email across rows that actually have one.
CREATE UNIQUE INDEX user_credentials_email_lower_idx
  ON user_credentials (lower(email)) WHERE email IS NOT NULL;

-- gyms.owner_id → user_credentials(id) (now that the table exists).
ALTER TABLE gyms
  ADD CONSTRAINT gyms_owner_id_fkey
  FOREIGN KEY (owner_id) REFERENCES user_credentials(id) ON DELETE SET NULL;

-- ============================================================
-- COACHES
-- Online-only coach:  gym_id = NULL
-- Gym coach:          gym_id = set
-- ============================================================
CREATE TABLE coaches (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id      UUID REFERENCES user_credentials(id) ON DELETE CASCADE,
  gym_id          UUID REFERENCES gyms(id),       -- NULL = standalone online coach
  bio             TEXT DEFAULT '',
  specialties     TEXT[] DEFAULT '{}',
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
  profile_id          UUID REFERENCES user_credentials(id) ON DELETE CASCADE,
  gym_id              UUID REFERENCES gyms(id),    -- NULL for online-only clients
  membership_status   TEXT DEFAULT 'active' CHECK (membership_status IN ('active', 'frozen', 'expired')),
  membership_type     TEXT DEFAULT '',
  start_date          DATE DEFAULT CURRENT_DATE,
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
-- INVITATIONS
-- A single table holding every kind of invitation in the platform. An
-- invitation is a tokenised, expiring email link that, once accepted,
-- provisions or links an account. The `type` column drives what the invite
-- does on acceptance:
--   gym_owner    → register the recipient as the owner of `gym_id`
--   online_coach → register the recipient as an independent online coach
--   gym_coach    → register/link a coach to `gym_id`
--   gym_member   → link a member to `gym_id`
--   coach_client → link a client to `coach_id`
-- ============================================================
CREATE TABLE invitations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type            TEXT NOT NULL DEFAULT 'gym_owner'
                  CHECK (type IN (
                    'gym_owner',
                    'online_coach',
                    'gym_coach',
                    'gym_member',
                    'coach_client'
                  )),
  -- Single-use secret carried in the invite URL.
  token           TEXT NOT NULL UNIQUE,
  -- Address the invite was sent to.
  email           TEXT NOT NULL,
  -- The account created/linked when the invite is accepted.
  -- NULL until acceptance; "has registered" === user_registered IS NOT NULL.
  user_registered UUID REFERENCES user_credentials(id) ON DELETE SET NULL,
  -- The gym this invite is scoped to. Required for the gym_* types.
  gym_id          UUID REFERENCES gyms(id) ON DELETE CASCADE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  expired_at      TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
  is_used         BOOLEAN NOT NULL DEFAULT false,

  -- gym_coach / gym_member link into an existing gym tenant, so they must name
  -- a gym. gym_owner is platform-level (it provisions a brand-new gym + owner on
  -- accept), and the online types never belong to a gym — all three forbid gym_id.
  CONSTRAINT chk_invitation_gym_scope CHECK (
    (type IN ('gym_coach', 'gym_member') AND gym_id IS NOT NULL)
    OR
    (type IN ('gym_owner', 'online_coach', 'coach_client') AND gym_id IS NULL)
  )
);

CREATE UNIQUE INDEX idx_invitations_token ON invitations (token);
CREATE INDEX idx_invitations_email ON invitations (lower(email));
CREATE INDEX idx_invitations_gym
  ON invitations (gym_id) WHERE gym_id IS NOT NULL;
CREATE INDEX idx_invitations_pending
  ON invitations (expired_at) WHERE is_used = false;

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
  description     TEXT DEFAULT '',
  price_egp       NUMERIC DEFAULT 0,
  schedule        JSONB DEFAULT '{}',
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
  description     TEXT DEFAULT '',
  muscle_group    TEXT[] DEFAULT '{}',
  equipment       TEXT DEFAULT '',
  difficulty      TEXT DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  video_url       TEXT DEFAULT '',   -- YouTube unlisted URL
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
  label           TEXT DEFAULT ''    -- "Push Day", "Rest Day" ...
);

CREATE TABLE workout_plan_exercises (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_id          UUID REFERENCES workout_plan_days(id) ON DELETE CASCADE,
  exercise_id     UUID REFERENCES exercises(id),
  sets            INT DEFAULT 0,
  reps            TEXT DEFAULT '',   -- "8-12" or "AMRAP"
  rest_seconds    INT DEFAULT 0,
  notes           TEXT DEFAULT '',
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
  notes           TEXT DEFAULT ''
);

CREATE TABLE workout_log_sets (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  log_id          UUID REFERENCES workout_logs(id) ON DELETE CASCADE,
  exercise_id     UUID REFERENCES exercises(id),
  set_number      INT DEFAULT 0,
  reps_done       INT DEFAULT 0,
  weight_kg       NUMERIC DEFAULT 0
);

-- ============================================================
-- NUTRITION PLANS
-- ============================================================
CREATE TABLE nutrition_plans (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id        UUID REFERENCES coaches(id),
  client_id       UUID REFERENCES clients(id),
  calories        INT DEFAULT 0,
  protein_g       INT DEFAULT 0,
  carbs_g         INT DEFAULT 0,
  fats_g          INT DEFAULT 0,
  meal_notes      TEXT DEFAULT '',
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
  weight_kg       NUMERIC DEFAULT 0,
  energy_level    INT DEFAULT 1 CHECK (energy_level BETWEEN 1 AND 5),
  sleep_hours     NUMERIC DEFAULT 0,
  water_litres    NUMERIC DEFAULT 0,
  notes           TEXT DEFAULT '',
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
  front_url       TEXT DEFAULT '',
  side_url        TEXT DEFAULT '',
  back_url        TEXT DEFAULT ''
);

-- ============================================================
-- INBODY RESULTS (gym module only — requires certified device)
-- ============================================================
CREATE TABLE inbody_results (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id       UUID REFERENCES clients(id) ON DELETE CASCADE,
  gym_id          UUID REFERENCES gyms(id),
  tested_at       DATE NOT NULL,
  weight_kg       NUMERIC DEFAULT 0,
  muscle_mass_kg  NUMERIC DEFAULT 0,
  body_fat_pct    NUMERIC DEFAULT 0,
  bmi             NUMERIC DEFAULT 0,
  visceral_fat    INT DEFAULT 0,
  raw_pdf_url     TEXT DEFAULT ''    -- Supabase Storage path
);

-- ============================================================
-- PLATFORM (super-admin) — subscription plan catalog
-- The plan tiers the platform operator sells to gyms / online coaches.
-- ============================================================
CREATE TABLE subscription_plans (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name           TEXT NOT NULL,
  description    TEXT DEFAULT '',
  price_egp      NUMERIC DEFAULT 0,   -- NULL = contact sales / custom pricing
  billing_cycle  TEXT NOT NULL DEFAULT 'monthly'
                 CHECK (billing_cycle IN ('monthly', 'yearly')),
  duration_days  INT NOT NULL DEFAULT 30,
  member_limit   INT,                 -- NULL = unlimited
  type           TEXT NOT NULL DEFAULT 'gym'
                 CHECK (type IN ('gym', 'online_coach')),
  features       TEXT[] NOT NULL DEFAULT '{}',
  is_active      BOOLEAN NOT NULL DEFAULT true,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_subscription_plans_type      ON subscription_plans (type);
CREATE INDEX idx_subscription_plans_is_active ON subscription_plans (is_active);

-- Seed the default plan catalog.
INSERT INTO subscription_plans (name, description, price_egp, billing_cycle, duration_days, member_limit, type, features) VALUES
  ('Trial',      '14-day free trial with all Pro features',   0,     'monthly', 14,  100,  'gym',          ARRAY['14 days', 'No card needed', 'All Pro features']),
  ('Starter',    'Essential tools for small gyms',            1800,  'monthly', 30,  200,  'gym',          ARRAY['200 members', '5 GB storage', 'Email support']),
  ('Pro',        'Full platform for growing gyms',            4500,  'monthly', 30,  1000, 'gym',          ARRAY['1,000 members', '100 GB storage', 'WhatsApp tier', 'Priority support']),
  ('Elite',      'Enterprise-grade for large facilities',     9800,  'monthly', 30,  3000, 'gym',          ARRAY['3,000 members', '500 GB storage', 'Multi-branch', 'Dedicated CSM']),
  ('Custom',     'Negotiated terms for enterprise clients',   NULL,  'monthly', 30,  6000, 'gym',          ARRAY['Negotiated cap', 'SSO + API access', 'SLA 99.95%']),
  ('Coach Solo', 'For independent online coaches',            1200,  'monthly', 30,  50,   'online_coach', ARRAY['50 clients', 'Workout builder', 'Nutrition plans']),
  ('Coach Pro',  'Scaling online coaching business',          2400,  'monthly', 30,  200,  'online_coach', ARRAY['200 clients', 'All Solo features', 'Analytics', 'Priority support'])
ON CONFLICT DO NOTHING;

-- ============================================================
-- PLATFORM SUBSCRIPTIONS — one row per tenant per billing relationship.
-- Exactly one of (gym_id, coach_id) is set: gym_id => gym module,
-- coach_id => online-coaching module. plan_name / billing_cycle /
-- next_billing_at are derived (see platform_subscription_details +
-- platform_billing_records), not stored here.
-- ============================================================
CREATE TABLE platform_subscriptions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id          UUID REFERENCES gyms(id) ON DELETE CASCADE,
  coach_id        UUID REFERENCES coaches(id) ON DELETE CASCADE,
  plan_id         UUID REFERENCES subscription_plans(id) ON DELETE SET NULL,
  price_egp       NUMERIC NOT NULL,
  status          TEXT NOT NULL DEFAULT 'active'
                  CHECK (status IN ('active', 'suspended', 'cancelled')),
  started_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes           TEXT DEFAULT '',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT chk_subscription_owner CHECK (num_nonnulls(gym_id, coach_id) = 1)
);

CREATE INDEX idx_platform_subscriptions_gym_id   ON platform_subscriptions (gym_id);
CREATE INDEX idx_platform_subscriptions_coach_id ON platform_subscriptions (coach_id);
CREATE INDEX idx_platform_subscriptions_status   ON platform_subscriptions (status);
CREATE INDEX idx_platform_subscriptions_plan_id  ON platform_subscriptions (plan_id);

-- ============================================================
-- PLATFORM BILLING RECORDS — one invoice / period per subscription.
-- Exactly one of (gym_id, coach_id) is set (mirrors platform_subscriptions).
-- ============================================================
CREATE TABLE platform_billing_records (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id  UUID        NOT NULL REFERENCES platform_subscriptions(id) ON DELETE CASCADE,
  gym_id           UUID        REFERENCES gyms(id) ON DELETE CASCADE,
  coach_id         UUID        REFERENCES coaches(id) ON DELETE CASCADE,
  amount_egp       NUMERIC     NOT NULL,
  period_start     TIMESTAMPTZ NOT NULL,
  period_end       TIMESTAMPTZ NOT NULL,
  status           TEXT        NOT NULL DEFAULT 'pending'
                               CHECK (status IN ('paid', 'pending', 'failed', 'refunded')),
  paid_at          TIMESTAMPTZ,
  notes            TEXT DEFAULT '',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT chk_period_end_after_start  CHECK (period_end > period_start),
  CONSTRAINT chk_paid_at_only_when_paid  CHECK (paid_at IS NULL OR status = 'paid'),
  CONSTRAINT chk_billing_record_owner    CHECK (num_nonnulls(gym_id, coach_id) = 1)
);

CREATE INDEX idx_pbr_subscription_period
  ON platform_billing_records (subscription_id, period_start DESC);
CREATE INDEX idx_pbr_gym_id   ON platform_billing_records (gym_id);
CREATE INDEX idx_pbr_coach_id ON platform_billing_records (coach_id);
CREATE INDEX idx_pbr_status   ON platform_billing_records (status);
CREATE INDEX idx_pbr_created  ON platform_billing_records (created_at DESC);

-- ============================================================
-- PLATFORM ACTIVITY LOG — immutable audit trail.
-- Tenant model: at most one of (gym_id, coach_id) is set per row.
-- gym_id => gym-module activity, coach_id => online-coaching activity,
-- neither => a platform-level event with no tenant.
-- ============================================================
CREATE TABLE platform_activity_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id      UUID REFERENCES gyms(id) ON DELETE SET NULL,
  coach_id    UUID REFERENCES coaches(id) ON DELETE SET NULL,
  event_type  TEXT NOT NULL,   -- 'login' | 'member_add' | 'checkin' | 'plan_change' | …
  actor_id    UUID REFERENCES user_credentials(id) ON DELETE SET NULL,
  metadata    JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_platform_activity_log_gym_id     ON platform_activity_log (gym_id);
CREATE INDEX idx_platform_activity_log_coach_id   ON platform_activity_log (coach_id);
CREATE INDEX idx_platform_activity_log_created_at ON platform_activity_log (created_at DESC);
CREATE INDEX idx_platform_activity_log_event_type ON platform_activity_log (event_type);

-- ============================================================
-- ============================================================
-- VIEWS
-- ============================================================
-- ============================================================

-- ------------------------------------------------------------
-- admin_dashboard_metrics — one row per gym, with current values,
-- prior-period baselines, and signed deltas for trend display.
-- ------------------------------------------------------------
CREATE VIEW admin_dashboard_metrics AS
WITH
  active_now AS (
    SELECT gym_id, COUNT(*) AS cnt
    FROM   clients
    WHERE  membership_status = 'active'
    GROUP  BY gym_id
  ),
  active_last_month AS (
    SELECT gym_id, COUNT(*) AS cnt
    FROM   clients
    WHERE  start_date <= (CURRENT_DATE - INTERVAL '30 days')
      AND  end_date   >= (CURRENT_DATE - INTERVAL '30 days')
    GROUP  BY gym_id
  ),
  today_checkins AS (
    SELECT gym_id, COUNT(*) AS cnt
    FROM   gym_checkins
    WHERE  checked_in_at >= CURRENT_DATE
      AND  checked_in_at <  CURRENT_DATE + INTERVAL '1 day'
    GROUP  BY gym_id
  ),
  yesterday_checkins AS (
    SELECT gym_id, COUNT(*) AS cnt
    FROM   gym_checkins
    WHERE  checked_in_at >= CURRENT_DATE - INTERVAL '1 day'
      AND  checked_in_at <  CURRENT_DATE
    GROUP  BY gym_id
  ),
  expiring_7d AS (
    SELECT gym_id, COUNT(*) AS cnt
    FROM   clients
    WHERE  membership_status = 'active'
      AND  end_date >= CURRENT_DATE
      AND  end_date <  CURRENT_DATE + INTERVAL '7 days'
    GROUP  BY gym_id
  ),
  expired_prev_7d AS (
    SELECT gym_id, COUNT(*) AS cnt
    FROM   clients
    WHERE  end_date >= CURRENT_DATE - INTERVAL '14 days'
      AND  end_date <  CURRENT_DATE - INTERVAL '7 days'
    GROUP  BY gym_id
  ),
  revenue_now AS (
    SELECT c.gym_id, COALESCE(SUM(p.price_egp), 0) AS total
    FROM   clients c
    LEFT JOIN gym_plans p
           ON p.gym_id = c.gym_id AND p.name = c.membership_type
    WHERE  c.membership_status = 'active'
    GROUP  BY c.gym_id
  ),
  revenue_last_month AS (
    SELECT c.gym_id, COALESCE(SUM(p.price_egp), 0) AS total
    FROM   clients c
    LEFT JOIN gym_plans p
           ON p.gym_id = c.gym_id AND p.name = c.membership_type
    WHERE  c.start_date <= (CURRENT_DATE - INTERVAL '30 days')
      AND  c.end_date   >= (CURRENT_DATE - INTERVAL '30 days')
    GROUP  BY c.gym_id
  )
SELECT
  g.id AS gym_id,
  COALESCE(an.cnt,  0)::INT                                       AS active_members,
  COALESCE(alm.cnt, 0)::INT                                       AS active_members_last_month,
  (COALESCE(an.cnt, 0) - COALESCE(alm.cnt, 0))::INT              AS active_members_delta,
  COALESCE(tc.cnt, 0)::INT                                        AS active_today,
  COALESCE(yc.cnt, 0)::INT                                        AS active_yesterday,
  (COALESCE(tc.cnt, 0) - COALESCE(yc.cnt, 0))::INT               AS active_today_delta,
  COALESCE(e7.cnt, 0)::INT                                        AS expiring_count,
  COALESCE(ep.cnt, 0)::INT                                        AS expiring_prev_week,
  (COALESCE(e7.cnt, 0) - COALESCE(ep.cnt, 0))::INT               AS expiring_delta,
  COALESCE(rn.total,  0)::NUMERIC                                 AS revenue,
  COALESCE(rlm.total, 0)::NUMERIC                                 AS revenue_last_month,
  (COALESCE(rn.total, 0) - COALESCE(rlm.total, 0))::NUMERIC      AS revenue_delta
FROM       gyms g
LEFT JOIN  active_now         an  ON an.gym_id  = g.id
LEFT JOIN  active_last_month  alm ON alm.gym_id = g.id
LEFT JOIN  today_checkins     tc  ON tc.gym_id  = g.id
LEFT JOIN  yesterday_checkins yc  ON yc.gym_id  = g.id
LEFT JOIN  expiring_7d        e7  ON e7.gym_id  = g.id
LEFT JOIN  expired_prev_7d    ep  ON ep.gym_id  = g.id
LEFT JOIN  revenue_now        rn  ON rn.gym_id  = g.id
LEFT JOIN  revenue_last_month rlm ON rlm.gym_id = g.id;

-- ------------------------------------------------------------
-- subscription_plan_stats — super-admin subscriptions page.
-- Aggregates tenant counts and MRR per plan.
-- ------------------------------------------------------------
CREATE VIEW subscription_plan_stats
WITH (security_invoker = true) AS
SELECT
  sp.id,
  sp.name,
  sp.description,
  sp.price_egp,
  sp.billing_cycle,
  sp.duration_days,
  sp.member_limit,
  sp.type,
  sp.features,
  sp.is_active,
  sp.created_at,
  sp.updated_at,
  COUNT(DISTINCT ps.gym_id) FILTER (WHERE ps.status = 'active')  AS active_tenant_count,
  COUNT(DISTINCT ps.gym_id)                                        AS total_tenant_count,
  COALESCE(
    SUM(COALESCE(sp.price_egp, ps.price_egp, 0)) FILTER (WHERE ps.status = 'active'),
    0
  )                                                                AS mrr_egp
FROM subscription_plans sp
LEFT JOIN platform_subscriptions ps ON ps.plan_id = sp.id
GROUP BY sp.id
ORDER BY sp.price_egp ASC NULLS LAST;

-- ------------------------------------------------------------
-- gym_list — super-admin gym management table. Joins each gym with its
-- latest subscription, the latest billing record's period end, member
-- count, and most recent platform activity.
-- ------------------------------------------------------------
CREATE VIEW gym_list
WITH (security_invoker = true) AS
SELECT
  g.id,
  g.name,
  g.address,
  g.phone,
  g.logo_url,
  g.owner_id,
  g.created_at,
  sp.id AS plan_id,
  sp.name AS plan_name,
  COALESCE(sp.price_egp, sub.price_egp) AS price_egp,
  sub.status AS subscription_status,
  br.period_end AS current_period_end,
  COUNT(DISTINCT c.id) AS member_count,
  MAX(pal.created_at) AS last_activity_at,
  sp.member_limit AS member_limit
FROM gyms g
  LEFT JOIN LATERAL (
    SELECT id, plan_id, price_egp, status
    FROM platform_subscriptions
    WHERE gym_id = g.id
    ORDER BY created_at DESC
    LIMIT 1
  ) sub ON true
  LEFT JOIN LATERAL (
    SELECT period_end
    FROM platform_billing_records
    WHERE subscription_id = sub.id
    ORDER BY period_start DESC
    LIMIT 1
  ) br ON true
  LEFT JOIN subscription_plans sp ON sp.id = sub.plan_id
  LEFT JOIN clients c ON c.gym_id = g.id
  LEFT JOIN platform_activity_log pal ON pal.gym_id = g.id
GROUP BY
  g.id, g.name, g.address, g.phone, g.logo_url, g.owner_id, g.created_at,
  sp.name, sp.price_egp, sub.price_egp, sub.status, br.period_end,
  sp.member_limit, sp.id
ORDER BY g.created_at DESC;

-- ------------------------------------------------------------
-- online_coach_list — solo online coaches (gym_id IS NULL) with billing
-- and plan info sourced from the shared platform billing tables.
-- is_billing_active = has an active plan AND has paid the fee for the
-- current billing period.
-- ------------------------------------------------------------
CREATE VIEW online_coach_list
WITH (security_invoker = true) AS
SELECT
  c.id,
  c.profile_id,
  c.bio,
  c.specialties,
  c.created_at,
  p.full_name,
  p.phone,
  p.avatar_url,
  COUNT(cc.id) FILTER (WHERE cc.is_active)  AS client_count,
  sub.status                                AS billing_status,
  sub.started_at                            AS last_billing_at,
  COALESCE(sp.price_egp, sub.price_egp)     AS price_egp,
  MAX(pal.created_at)                       AS last_activity_at,
  (
    sub.status = 'active'
    AND br.status = 'paid'
    AND now() >= br.period_start
    AND now() <  br.period_end
  )                                         AS is_billing_active,
  sp.name                                   AS plan_name,
  sp.member_limit
FROM coaches c
JOIN  user_credentials p  ON p.id = c.profile_id
LEFT JOIN coach_clients cc ON cc.coach_id = c.id
LEFT JOIN platform_activity_log pal ON pal.actor_id = c.profile_id
LEFT JOIN LATERAL (
  SELECT ps.id, ps.status, ps.started_at, ps.plan_id, ps.price_egp
  FROM platform_subscriptions ps
  WHERE ps.coach_id = c.id
  ORDER BY ps.created_at DESC
  LIMIT 1
) sub ON true
LEFT JOIN subscription_plans sp ON sp.id = sub.plan_id
LEFT JOIN LATERAL (
  SELECT pbr.status, pbr.period_start, pbr.period_end
  FROM platform_billing_records pbr
  WHERE pbr.subscription_id = sub.id
  ORDER BY pbr.period_start DESC
  LIMIT 1
) br ON true
WHERE c.gym_id IS NULL
GROUP BY
  c.id, p.id,
  sub.status, sub.started_at, sub.price_egp,
  sp.id,
  br.status, br.period_start, br.period_end;

-- ------------------------------------------------------------
-- platform_subscription_details — a subscription with its plan-derived
-- fields and latest billing record flattened in. Exactly one of
-- (gym_id, coach_id) is set; the coach Subscription tab filters on
-- coach_id the same way the gym tab filters on gym_id.
-- ------------------------------------------------------------
CREATE VIEW platform_subscription_details
WITH (security_invoker = true) AS
SELECT
  ps.id,
  ps.gym_id,
  ps.coach_id,
  ps.plan_id,
  ps.price_egp,
  ps.status,
  ps.started_at,
  ps.notes,
  ps.created_at,

  -- derived from subscription_plans
  sp.name                               AS plan_name,
  COALESCE(sp.billing_cycle, 'monthly') AS billing_cycle,
  sp.duration_days,
  sp.member_limit,
  sp.features,

  -- derived from latest billing record
  br.id                                 AS latest_billing_record_id,
  br.period_start                       AS current_period_start,
  br.period_end                         AS current_period_end,
  br.status                             AS billing_status,
  br.amount_egp                         AS billed_amount_egp,
  br.paid_at
FROM platform_subscriptions ps
LEFT JOIN subscription_plans sp ON sp.id = ps.plan_id
LEFT JOIN LATERAL (
  SELECT id, period_start, period_end, status, amount_egp, paid_at
  FROM platform_billing_records
  WHERE subscription_id = ps.id
  ORDER BY period_start DESC
  LIMIT 1
) br ON true;

-- ------------------------------------------------------------
-- platform_activity_log_list — super-admin activity feed with gym, coach,
-- and actor names resolved so the page can render without extra JOINs.
-- ------------------------------------------------------------
CREATE VIEW platform_activity_log_list
WITH (security_invoker = true) AS
SELECT
  pal.id,
  pal.gym_id,
  g.name AS gym_name,
  pal.coach_id,
  coach_p.full_name AS coach_name,
  coach_p.avatar_url AS coach_avatar_url,
  CASE
    WHEN pal.gym_id IS NOT NULL THEN 'gym'
    WHEN pal.coach_id IS NOT NULL THEN 'online_coach'
    ELSE 'platform'
  END AS tenant_type,
  COALESCE(g.name, coach_p.full_name) AS tenant_name,
  pal.event_type,
  pal.actor_id,
  actor.full_name AS actor_name,
  actor.avatar_url AS actor_avatar_url,
  actor.user_type AS actor_type,
  pal.metadata,
  pal.created_at
FROM platform_activity_log pal
  LEFT JOIN gyms g ON g.id = pal.gym_id
  LEFT JOIN coaches co ON co.id = pal.coach_id
  LEFT JOIN user_credentials coach_p ON coach_p.id = co.profile_id
  LEFT JOIN user_credentials actor ON actor.id = pal.actor_id
ORDER BY pal.created_at DESC;
