-- ============================================================
-- Migration: add DEFAULT values to nullable columns
-- Safe to re-run — SET DEFAULT is idempotent.
-- Does NOT backfill existing NULL rows; only affects future INSERTs.
-- ============================================================

-- gyms
ALTER TABLE gyms
  ALTER COLUMN address   SET DEFAULT '',
  ALTER COLUMN phone     SET DEFAULT '',
  ALTER COLUMN logo_url  SET DEFAULT '';

-- profiles
ALTER TABLE profiles
  ALTER COLUMN full_name   SET DEFAULT '',
  ALTER COLUMN phone       SET DEFAULT '',
  ALTER COLUMN avatar_url  SET DEFAULT '';

-- coaches
ALTER TABLE coaches
  ALTER COLUMN bio         SET DEFAULT '',
  ALTER COLUMN specialties SET DEFAULT '{}';

-- clients
ALTER TABLE clients
  ALTER COLUMN membership_status  SET DEFAULT 'active',
  ALTER COLUMN membership_type    SET DEFAULT '',
  ALTER COLUMN start_date         SET DEFAULT CURRENT_DATE;

-- gym_classes
ALTER TABLE gym_classes
  ALTER COLUMN description  SET DEFAULT '',
  ALTER COLUMN price_egp    SET DEFAULT 0,
  ALTER COLUMN schedule     SET DEFAULT '{}';

-- exercises
ALTER TABLE exercises
  ALTER COLUMN description   SET DEFAULT '',
  ALTER COLUMN muscle_group  SET DEFAULT '{}',
  ALTER COLUMN equipment     SET DEFAULT '',
  ALTER COLUMN difficulty    SET DEFAULT 'beginner',
  ALTER COLUMN video_url     SET DEFAULT '';

-- workout_plan_days
ALTER TABLE workout_plan_days
  ALTER COLUMN label  SET DEFAULT '';

-- workout_plan_exercises
ALTER TABLE workout_plan_exercises
  ALTER COLUMN sets          SET DEFAULT 0,
  ALTER COLUMN reps          SET DEFAULT '',
  ALTER COLUMN rest_seconds  SET DEFAULT 0,
  ALTER COLUMN notes         SET DEFAULT '';

-- workout_logs
ALTER TABLE workout_logs
  ALTER COLUMN notes  SET DEFAULT '';

-- workout_log_sets
ALTER TABLE workout_log_sets
  ALTER COLUMN set_number  SET DEFAULT 0,
  ALTER COLUMN reps_done   SET DEFAULT 0,
  ALTER COLUMN weight_kg   SET DEFAULT 0;

-- nutrition_plans
ALTER TABLE nutrition_plans
  ALTER COLUMN calories    SET DEFAULT 0,
  ALTER COLUMN protein_g   SET DEFAULT 0,
  ALTER COLUMN carbs_g     SET DEFAULT 0,
  ALTER COLUMN fats_g      SET DEFAULT 0,
  ALTER COLUMN meal_notes  SET DEFAULT '';

-- daily_checkins
ALTER TABLE daily_checkins
  ALTER COLUMN weight_kg     SET DEFAULT 0,
  ALTER COLUMN energy_level  SET DEFAULT 1,
  ALTER COLUMN sleep_hours   SET DEFAULT 0,
  ALTER COLUMN water_litres  SET DEFAULT 0,
  ALTER COLUMN notes         SET DEFAULT '';

-- progress_photos
ALTER TABLE progress_photos
  ALTER COLUMN front_url  SET DEFAULT '',
  ALTER COLUMN side_url   SET DEFAULT '',
  ALTER COLUMN back_url   SET DEFAULT '';

-- inbody_results
ALTER TABLE inbody_results
  ALTER COLUMN weight_kg      SET DEFAULT 0,
  ALTER COLUMN muscle_mass_kg SET DEFAULT 0,
  ALTER COLUMN body_fat_pct   SET DEFAULT 0,
  ALTER COLUMN bmi            SET DEFAULT 0,
  ALTER COLUMN visceral_fat   SET DEFAULT 0,
  ALTER COLUMN raw_pdf_url    SET DEFAULT '';

-- subscription_plans (from subscription_plans migration)
ALTER TABLE subscription_plans
  ALTER COLUMN description  SET DEFAULT '',
  ALTER COLUMN price_egp    SET DEFAULT 0;

-- platform_subscriptions (from super_admin migration)
ALTER TABLE platform_subscriptions
  ALTER COLUMN notes  SET DEFAULT '';

-- platform_activity_log (from super_admin migration)
ALTER TABLE platform_activity_log
  ALTER COLUMN metadata  SET DEFAULT '{}';

-- platform_billing_records (from platform_billing_records migration)
ALTER TABLE platform_billing_records
  ALTER COLUMN notes  SET DEFAULT '';
