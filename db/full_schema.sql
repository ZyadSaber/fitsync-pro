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
-- user_type drives dashboard routing and middleware access control.
-- gym_id = NULL  → online coaching context
-- gym_id = set   → gym module context
-- ============================================================
CREATE TABLE profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  gym_id        UUID REFERENCES gyms(id),        -- NULL for online-only users
  user_type     TEXT NOT NULL DEFAULT 'member'
                CHECK (user_type IN ('member', 'gym', 'coach')),
  full_name     TEXT,
  phone         TEXT,
  avatar_url    TEXT,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- Auto-create a profile row with default type 'member' on every sign-up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, user_type)
  VALUES (NEW.id, 'member')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

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

-- GYMS: only the owner can access their gym row
ALTER TABLE gyms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "gym admin access" ON gyms
  USING (owner_id = auth.uid());

-- PROFILES: users see only their own profile; gym admin sees their gym's profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile" ON profiles
  FOR SELECT USING (id = auth.uid());
CREATE POLICY "own profile update" ON profiles
  FOR UPDATE USING (id = auth.uid());
CREATE POLICY "gym admin reads profiles" ON profiles
  FOR SELECT USING (
    gym_id IN (SELECT id FROM gyms WHERE owner_id = auth.uid())
  );

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